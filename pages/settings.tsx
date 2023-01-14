import type { NextPage } from "next"
import styles from "../styles/Home.module.css"
import navBlock from "../components/navBlock"
import adminFormRow from "../components/adminFormRow"
import useStorage from "../storage/"
import { useEffect, useState } from "react"
import {
  setupWeb3,
  switchOrAddChain,
  doConnectWithMetamask,
  isMetamaskConnected,
  getCurrentChainId,
} from "../helpers/setupWeb3"
import { calcSendArgWithFee } from "../helpers/calcSendArgWithFee"

import STORAGE_JSON from "../contracts/Storage.json"
import { getCurrentDomain } from "../helpers/getCurrentDomain"
import fetchTokenInfo from "../helpers/fetchTokenInfo"
import fetchFarmInfo from "../helpers/fetchFarmInfo"
import fetchTokenBalance from "../helpers/fetchTokenBalance"
import deployFarmContract from "../helpers/deployFarmContract"
import delay from "../helpers/delay"
import { toWei, fromWei } from "../helpers/wei"
import openInTab from "../components/openInTab"

import {
  AVAILABLE_NETWORKS_INFO,
  CHAIN_INFO,
  CHAIN_EXPLORER_LINK
} from "../helpers/constants"

const storageChainId = 5
const storageAddress = '0xafb8f27df1f629432a47214b4e1674cbcbdb02df'

const settingsTabs = {
  main: `Main settings`,
  texts: `Edit texts`,
  design: `Design`,
  social: `Social links`
}

const debugLog = (msg) => { console.log(msg) }

const CHAINS_LIST = (() => {
  const ret = Object.keys(AVAILABLE_NETWORKS_INFO).map((k) => {
    return {
      id: AVAILABLE_NETWORKS_INFO[k].networkVersion,
      title: AVAILABLE_NETWORKS_INFO[k].chainName,
    }
  })
  ret.unshift({
    id: 0,
    title: `Select Blockchain`,
  })
  return ret
})()

const Settings: NextPage = (props) => {

  const { storageData, storageIsLoading, isOwner } = props

  /* ---- NOTIFY BLOCK ---- */
  const [notifyBlocks, setNotifyBlocks] = useState([])
  const [removeNotifyConfiged, setRemoveNotifyConfiged] = useState(false)

  
  useEffect(() => {
    const timer = setTimeout(() => {
      const _b = [...notifyBlocks]
      _b.shift()
      setNotifyBlocks(_b)
    }, 5000)
    return () => clearTimeout(timer)
  }, [notifyBlocks])
  
  const addNotify = (msg, style = `info`) => {
    const _t = [...notifyBlocks]
    _t.push({ msg, style })
    setNotifyBlocks([..._t])
  }
  /* ----- \\\\ NOTIFY BLOCK ----- */
  const [activeChainId, setActiveChainId] = useState(false)
  const [activeWeb3, setActiveWeb3] = useState(false)
  const [address, setAddress] = useState(false)
  const [isWalletConecting, setIsWalletConnecting] = useState(false)

  const processError = (error, error_namespace) => {
    let metamaskError = false
    try {
      metamaskError = error.message.replace(`Internal JSON-RPC error.`,``)
      metamaskError = JSON.parse(metamaskError)
    } catch (e) {}
    const errMsg = (metamaskError && metamaskError.message) ? metamaskError.message : error.message
    
    switch (errMsg) {
      case `execution reverted: You don't own this token!`:
        console.log(`You dont own this token`)
        break;
      case `MetaMask Tx Signature: User denied transaction signature.`:
        console.log('Transaction denied')
        break;
      case `execution reverted: ERC721: invalid token ID`:
        console.log('Invalid token ID')
        break;
      default:
        console.log('Unkrnown error', error.message)
        break;
    }
  }

  const initOnWeb3Ready = async () => {
    if (activeWeb3 && (`${activeChainId}` == `${storageChainId}`)) {
      activeWeb3.eth.getAccounts().then((accounts) => {
        setAddress(accounts[0])
        const _storageContract = new activeWeb3.eth.Contract(STORAGE_JSON.abi, storageAddress)
        console.log('>>> storageContract', _storageContract)
        setStorageContract(_storageContract)
      }).catch((err) => {
        console.log('>>> initOnWeb3Ready', err)
        processError(err)
      })
    } else {
      const _isConnected = await isMetamaskConnected()
      if (_isConnected) {
        connectWithMetamask()
      }
    }
  }

  useEffect(() => {
    debugLog('on useEffect activeWeb3 initOnWeb3Ready')
    initOnWeb3Ready()
  }, [activeWeb3])


  const connectWithMetamask = async () => {
    doConnectWithMetamask({
      onBeforeConnect: () => { setIsWalletConnecting(true) },
      onSetActiveChain: setActiveChainId,
      onConnected: (cId, web3) => {
        setActiveWeb3(web3)
        setIsWalletConnecting(false)
      },
      onError: (err) => {
        console.log(">>>> connectWithMetamask", err)
        processError(err)
        setIsWalletConnecting(false)
      },
      needChainId: storageChainId,
    })
  }
  /* ---------------------------- END WEB3 CONNECT --------- */

  const [storageContract, setStorageContract] = useState(false)

  const saveStorageConfig = async (options) => {
    const {
      onBegin,
      onReady,
      onError,
      newData,
    } = options

    if (getCurrentChainId() !== storageChainId) {
      const storageChainInfo = CHAIN_INFO(storageChainId)
      if (window.confirm(`Please change network Storage chain (${storageChainInfo.chainName})`)) {
        await switchOrAddChain(storageChainId)
        addNotify(`Switching to Storage chain`)
        await delay(2000)
      } else {
        if (onError) onError()
        return false
      }
    }
    if (address && storageContract) {
      if (onBegin) onBegin()

      const saveData = {
        ...storageData,
        ...newData,
      }

      try {
        const setupTxData = await calcSendArgWithFee(
          address,
          storageContract,
          "setKeyData",
          [
            getCurrentDomain(),
            {
              owner: address,
              info: JSON.stringify(saveData)
            }
          ]
        )
        
        storageContract.methods.setKeyData(
          getCurrentDomain(),
          {
            owner: address,
            info: JSON.stringify(saveData)
          }
        ).send(setupTxData).then(() => {
          if (onReady) onReady()
        }).catch((e) => {
          console.log('>>> error', e)
          if (onError) onError(e)
        })
      } catch (e) {
        console.log('>>> error', e)
        if (onError) onError(e)
      }
    }
  }

  let showInstallBox = (storageData && !storageData.isInstalled)

  const [isInstalledOnDomain, setIsInstalledOnDomain] = useState(showInstallBox)
  const [isSettingUpOnDomain, setIsSettingUpOnDomain] = useState(false)
  const doSetupOnDomain = () => {
    saveStorageConfig({
      onBegin: () => {
        setIsSettingUpOnDomain(true)
        addNotify(`Confirm transaction for setup NFTStake on this domain`)
      },
      onReady: () => {
        setIsSettingUpOnDomain(false)
        setIsInstalledOnDomain(true)
        addNotify(`NFTStake successfull installed on this domain. Now you can configure farm`, `success`)
      },
      onError: (err) => {
        setIsSettingUpOnDomain(false)
        addNotify(`Fail setup NFTStake on domain`, `error`)
      },
      newData: {
        isInstalled: true,
      }
    })
  }

  const [activeTab, setActiveTab] = useState(`main`)

  /* -------------- MAIN TAB ---------------------*/
  const [ newChainId, setNewChainId ] = useState(storageData?.chainId || 0)
  const [ newNftCollection, setNewNftCollection ] = useState(storageData?.nftCollection || '')
  const [ newRewardToken, setNewRewardToken ] = useState(storageData?.rewardToken || '')
  const [ newFarmContract, setNewFarmContract ] = useState(storageData?.farmContract || '')

  /* --- Reward token --- */
  const [ rewardTokenInfo, setRewardTokenInfo ] = useState({
    chainId: 0,
    address: ``,
    name: ``,
    symbol: ``,
    decimals: 0
  })
  const [ rewardTokenFetching, setRewardTokenFetching ] = useState(false)
  const [ rewardTokenFetched, setRewardTokenFetched ] = useState(false)

  useEffect(() => {
    setRewardTokenInfo({})
  }, [ newRewardToken ])
  const _fetchRewardTokenInfo = (address, chainId) => {
    setRewardTokenInfo({})
    fetchTokenInfo(address, chainId).then((tokenInfo) => {
      console.log(tokenInfo)
      addNotify(`Info about reward token fetched`, `success`)
      setRewardTokenInfo(tokenInfo)
      setRewardTokenFetching(false)
      setRewardTokenFetched(true)
    }).catch((err) => {
      console.log(err)
      addNotify(`Fail fetch reward token info. ${(err && err.message) ? err.message : err}`, `error`)
      setRewardTokenFetching(false)
    })
  }
  const fetchRewardTokenInfo = () => {
    setRewardTokenFetching(true)
    setRewardTokenFetched(false)
    addNotify(`Fetching reward token info`)
    if (newChainId && newRewardToken) {
      _fetchRewardTokenInfo(newRewardToken, newChainId)
    } else {
      addNotify(`Fail fetch reward token info. No chainid or token address`, `error`)
      setRewardTokenFetching(false)
    }
  }
  /* -- */
  /* ----- Farm info --- */
  const [ farmInfo, setFarmInfo ] = useState({
    address: ``,
    chainId: 0,
    nftCollection: ``,
    owner: ``,
    rewardsToken: ``,
    version: 1,
    rewardsPerHour: 0, // v2
  })
  const [ farmInfoFetching, setFarmInfoFetching ] = useState(false)
  const [ farmInfoFetched, setFarmInfoFetched ] = useState(false)

  const [ farmBalance, setFarmBalance ] = useState({})
  const [ farmBalanceFetching, setFarmBalanceFetching ] = useState(false)
  const [ farmBalanceFetched, setFarmBalanceFetched ] = useState(false)

  const doFetchFarmInfo = () => {
    setFarmInfoFetching(true)
    setFarmInfoFetched(false)
    setRewardTokenFetched(false)
    addNotify(`Fetching farm contract info`)
    setFarmInfo({})
    setFarmBalance({})
    if (newChainId && newFarmContract) {
      fetchFarmInfo(newFarmContract, newChainId).then((info) => {
        addNotify(`Info about farm contract fetched`, `success`)
        setFarmInfo(info)
        setFarmInfoFetched(true)
        setFarmInfoFetching(false)
      }).catch((err) => {
        console.log(err)
        addNotify(`Fail fetch farm contract info. ${(err && err.message) ? err.message : err}`, `error`)
        setFarmInfoFetching(false)
      })
    } else {
      addNotify(`Fail fetch farm contract info. No chainid or farm contract address`, `error`)
      setFarmInfoFetching(false)
    }
  }

  const doFetchFarmBalance = () => {
    setFarmBalanceFetched(false)
    setFarmBalanceFetching(true)
    addNotify(`Fetching farm contract balance`)
    if (newChainId && newFarmContract && newRewardToken) {
      fetchTokenBalance(newFarmContract, newRewardToken, newChainId).then((balanceInfo) => {
        addNotify(`Farm balance fetched`, `success`)
        setFarmBalance(balanceInfo)
        setFarmBalanceFetched(true)
        setFarmBalanceFetching(false)
      }).catch((err) => {
        console.log(err)
        addNotify(`Fail fetch farm balance. ${(err && err.message) ? err.message : err}`, `error`)
        setFarmBalanceFetching(false)
      })
    } else {
      addNotify(`Fail fetch farm balance. Not defined chainId, farm address or reward token address`, `error`)
      setFarmBalanceFetching(false)
    }
  }

  useEffect(() => {
    if (farmInfoFetched && farmInfo && farmInfo.address && farmInfo.chainId) {
      setNewNftCollection(farmInfo.nftCollection)
      setNewRewardToken(farmInfo.rewardsToken)
      _fetchRewardTokenInfo(farmInfo.rewardsToken, farmInfo.chainId)
    }
  }, [ farmInfo, farmInfoFetched ])

  /* --- Deploy farm contract --- */
  const [ isOpenedDeployFarm, setIsOpenedDeployFarm ] = useState(false)
  const [ deployRewardPerHour, setDeployRewardPerHour ] = useState( 0.1 )
  const [ isFarmContractDeploying, setIsFarmContractDeploying ] = useState(false)
  const [ canDeploy, setCanDeploy ] = useState(false)

  const doDeployFarmContract = () => {
  console.log('>>>> deployRewardPerHour', deployRewardPerHour, rewardTokenInfo, rewardTokenInfo.decimals)
  console.log(toWei(deployRewardPerHour.toString(), rewardTokenInfo.decimals))
    //return
    setIsFarmContractDeploying(true)
    if (newChainId && newRewardToken && newNftCollection) {
      addNotify(`Confirm deploy transaction`)
        deployFarmContract({
        activeWeb3,
        nftCollection: newNftCollection,
        rewardsToken: newRewardToken,
        rewardsPerHour: toWei(deployRewardPerHour.toString(), rewardTokenInfo.decimals),
        onTrx: (hash) => {
          addNotify(`Farm contract deploy TX ${hash}...`, `success`)
        },
        onSuccess: (newContractAddress) => {
          addNotify(`Farm contract deployed. Now save settings`, `success`)
          setNewFarmContract(newContractAddress)
          setIsFarmContractDeploying(false)
          setIsOpenedDeployFarm(false)
          doFetchFarmInfo()
        }
      }).then((answ) => {
        console.log(answ)
      }).catch((err) => {
        addNotify(`Fail deploy contract. ${(err.message ? err.message : '')}`, `error`)
        setIsFarmContractDeploying(false)
        console.log(err)
      })
    } else {
      addNotify(`Fail deploy. Not selected chainId, nft collection or reward token`, `error`)
      setIsFarmContractDeploying(false)
    }
  }

  const doShowFarmDeploy = () => {
    setIsOpenedDeployFarm(true)
  }
  const doHideFarmDeploy = () => {
    setIsOpenedDeployFarm(false)
  }

  useEffect(() => {
    if ((newChainId !==0)
      && newNftCollection
      && newRewardToken
      && rewardTokenFetched
      && rewardTokenInfo
      && rewardTokenInfo.symbol
    ) {
      setCanDeploy(true)
    } else {
      setCanDeploy(false)
    }
  }, [ newChainId, newNftCollection, newRewardToken, rewardTokenFetched ])

  const farmDeployOptions = () => {
    const farmChainInfo = CHAIN_INFO(newChainId)
    return (
      <div className={styles.subFormInfo}>
        <h3>Deploy new Farm contract options</h3>
        <div className={styles.infoRow}>
          <label>Farm chain:</label>
          <span>
            {newChainId != 0 ? (
              <b>{farmChainInfo.chainName} ({farmChainInfo.networkVersion})</b>
            ) : (
              <b className={styles.hasError}>Specify blockchain</b>
            )}
          </span>
        </div>
        <div className={styles.infoRow}>
          <label>NFT Collection:</label>
          <span>
            {newNftCollection ? (
              <>
                <b>{newNftCollection}</b>
                {openInTab(CHAIN_EXPLORER_LINK({ address: newNftCollection, chainId: newChainId }), `Open in block explorer`)}
              </>
            ) : (
              <b className={styles.hasError}>Specify NFT collection address</b>
            )}
          </span>
        </div>
        <div className={styles.infoRow}>
          <label>Reward Token:</label>
          <span>
            {newRewardToken ? (
              <>
                <b>{newRewardToken}</b>
                {openInTab(CHAIN_EXPLORER_LINK({ address: newRewardToken, chainId: newChainId }), `Open in block explorer`)}
              </>
            ) : (
              <b className={styles.hasError}>Specify Reward token address</b>
            )}
          </span>
        </div>
        <div className={styles.infoRow}>
          <span>How many tokens will the user receive every hour for each staked NFT?</span>
        </div>
        <div className={styles.infoRow}>
          <label>Reward per hour:</label>
          {newRewardToken ? (
            <>
              {(rewardTokenFetched && rewardTokenInfo && rewardTokenInfo.symbol) ? (
                <>
                  <div>
                    <div>
                      <input value={deployRewardPerHour} onChange={(e) => { setDeployRewardPerHour(e.target.value) }} type="number" step="0.000001" />
                      <span>&nbsp;{rewardTokenInfo.symbol}</span>
                    </div>
                    <div>
                      <span>&nbsp;({toWei(deployRewardPerHour.toString(), rewardTokenInfo.decimals).toString()}) in Wei without decimals)</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <button disabled={rewardTokenFetching} className={styles.secondaryButton} onClick={fetchRewardTokenInfo}>
                    {rewardTokenFetching ? `Fetching reward token info` : `First fetch reward token info`}
                  </button>
                </>
              )}
            </>
          ) : (
            <span>
              <b className={styles.hasError}>Specify Reward token address</b>
            </span>
          )}
        </div>
        <div className={styles.actionsRow}>
          <button disabled={!canDeploy || farmInfoFetching || isFarmContractDeploying} className={styles.secondaryButton} onClick={doDeployFarmContract}>
            {isFarmContractDeploying ? `Deploying Farm contract...` : `Deploy new farm contract`}
          </button>
          <button disabled={isFarmContractDeploying} className={styles.secondaryButton} onClick={doHideFarmDeploy}>
            Cancel
          </button>
        </div>
      </div>
    )
  }
  /* -- */
  useEffect(() => {
    if (storageData) {
      setNewChainId(storageData.chainId)
      setNewNftCollection(storageData.nftCollection)
      setNewRewardToken(storageData.rewardToken)
      setNewFarmContract(storageData.farmContract)
    }
  }, [storageData])
  const doSetChainId = (chainId) => {
    setNewChainId(chainId)
  }
  const doSetNftCollection = (nftCollection) => {
    setNewNftCollection(nftCollection)
  }
  const doSetRewardToken = (rewardToken) => {
    setNewRewardToken(rewardToken)
  }
  const doSetFarmContract = (farmContract) => {
    setNewFarmContract(farmContract)
  }

  const doSaveMainConfig = () => {
    const newConfig = {
      chainId: newChainId,
      nftCollection: newNftCollection,
      rewardToken: newRewardToken,
      farmContract: newFarmContract,
    }
    saveStorageConfig({
      onBegin: () => {
        setIsSettingUpOnDomain(true)
        addNotify(`Confirm transaction for save main config`)
      },
      onReady: () => {
        setIsSettingUpOnDomain(false)
        setIsInstalledOnDomain(true)
        addNotify(`NFTStake main config successfull saved`, `success`)
      },
      onError: (err) => {
        setIsSettingUpOnDomain(false)
        addNotify(`Fail save main config`, `error`)
      },
      newData: newConfig
    })
  }

  const doTest = () => {

  }

  

  const renderMainTab = () => {
    return (
      <div className={styles.adminForm}>
        {!isOpenedDeployFarm && (
          <>
            {adminFormRow({
              label: `Work blockchain ID`,
              type: `list`,
              values: CHAINS_LIST,
              value: newChainId,
              onChange: doSetChainId
            })}
            {adminFormRow({
              label: `NFT Collection address`,
              type: `address`,
              value: newNftCollection,
              onChange: doSetNftCollection,
              placeholder: `Enter address of NFT collection for stack`,
              buttons: (
                <button className={styles.secondaryButton} onClick={() => {}}>
                  Deploy Demo NFT collection
                </button>
              )
            })}
            {adminFormRow({
              label: `Reward Token address`,
              type: `address`,
              value: newRewardToken,
              onChange: doSetRewardToken,
              placeholder: `Enter address of Token for reward`,
              buttons: (
                <button disabled={rewardTokenFetching} className={styles.secondaryButton} onClick={fetchRewardTokenInfo}>
                  {rewardTokenFetching ? `Fetching...` : `Fetch reward token info`}
                </button>
              )
            })}
          </>
        )}
        {rewardTokenFetched && rewardTokenInfo.symbol && (
          <div className={styles.subFormInfo}>
            <h3>Reward Token info</h3>
            <div className={styles.infoRow}>
              <label>Chain ID:</label>
              <span>{rewardTokenInfo.chainId}</span>
            </div>
            <div className={styles.infoRow}>
              <label>Symbol:</label>
              <span>{rewardTokenInfo.symbol}</span>
            </div>
            <div className={styles.infoRow}>
              <label>Name:</label>
              <span>{rewardTokenInfo.name}</span>
            </div>
            <div className={styles.infoRow}>
              <label>Decimals:</label>
              <span>{rewardTokenInfo.decimals}</span>
            </div>
          </div>
        )}
        {!isOpenedDeployFarm && (
          <>
            {adminFormRow({
              label: `Farm contract address`,
              type: `address`,
              value: newFarmContract,
              onChange: doSetFarmContract,
              placeholder: `Enter address of Farm contract or deploy new`,
              buttons: (
                <>
                  <button disabled={farmInfoFetching || isFarmContractDeploying} className={styles.secondaryButton} onClick={doFetchFarmInfo}>
                    {(farmInfoFetching) ? `Fetching...` : `Fetch contract info`}
                  </button>
                  <button disabled={farmInfoFetching || isFarmContractDeploying} className={styles.secondaryButton} onClick={doShowFarmDeploy}>
                    Deploy new Farm
                  </button>
                </>
              )
            })}
          </>
        )}
        {isOpenedDeployFarm && farmDeployOptions()}
        {!isOpenedDeployFarm && farmInfoFetched && farmInfo.version && (
          <div className={styles.subFormInfo}>
            <h3>Farm contract info</h3>
            <div className={styles.infoRow}>
              <label>Contract version:</label>
              <span>{farmInfo.version}</span>
            </div>
            <div className={styles.infoRow}>
              <label>Owner:</label>
              <span>{farmInfo.owner}</span>
            </div>
            <div className={styles.infoRow}>
              <label>Farm balance:</label>
              {(farmBalanceFetched && farmBalance.normalized !== undefined && rewardTokenInfo && rewardTokenInfo.symbol) ? (
                <>
                  <span>{farmBalance.normalized} {rewardTokenInfo.symbol}</span>
                  <button disabled={farmBalanceFetching} className={styles.secondaryButton} onClick={doFetchFarmBalance}>
                    {farmBalanceFetching ? `Fetching...` : `Refresh`}
                  </button>
                </>
              ) : (
                <button disabled={farmBalanceFetching} className={styles.secondaryButton} onClick={doFetchFarmBalance}>
                  {farmBalanceFetching ? `Fetching farm balance...` : `Fetch farm balance`}
                </button>
              )}
            </div>
            {(farmBalanceFetched && farmBalance.normalized !== undefined && rewardTokenInfo && rewardTokenInfo.symbol) && (
              <div className={styles.infoRow}>
                <span>
                  Send the <b>{rewardTokenInfo.symbol}</b> tokens to Farm contract address <b>{farmInfo.address}</b> for increase the balance
                </span>
              </div>
            )}
            {(farmInfo.version >= 2) && (
              <>
                <div className={styles.infoRow}>
                  <label>Reward per hour per NFT:</label>
                  <span>{fromWei(farmInfo.rewardsPerHour, rewardTokenInfo.decimals)} {rewardTokenInfo.symbol}</span>
                </div>
                <div className={styles.infoRow}>
                  <label>&nbsp;</label>
                  <span>Reward per hour in wei <b>{farmInfo.rewardsPerHour}</b> {rewardTokenInfo.symbol}</span> 
                </div>
              </>
            )}
          </div>
        )}
        <div className={styles.adminFormBottom}>
          <button className={styles.mainButton} onClick={doSaveMainConfig} >
            Save changes
          </button>
        </div>
      </div>
    )
  }
  /* -------------------------------------------- */
  //console.log('>>> storageData', storageData, showInstallBox, (storageData && !storageData.isInstalled), !isInstalledOnDomain)
  return (
    <div className={styles.container}>
      {navBlock(`settings`, true)}
      <h1 className={styles.h1}>Settings</h1>
      {storageData !== null && (
        <>
          {(showInstallBox && !isInstalledOnDomain) ? (
            <>
              <h2>NFTStake need setup on this domain</h2>
              {!address ? (
                <button disabled={isWalletConecting} className={styles.mainButton} onClick={connectWithMetamask}>
                  {isWalletConecting ? `Connecting` : `Connect Wallet`}
                </button>
              ) : (
                <>
                  <button disabled={isSettingUpOnDomain} className={`${styles.mainButton} ${styles.autoWidth}`} onClick={doSetupOnDomain}>
                    {isSettingUpOnDomain ? `Setup on domain...` : `Setup NFTStake on this domain`}
                  </button>
                </>
              )}
            </>
          ) : (
            <>
              {!address ? (
                <button disabled={isWalletConecting} className={styles.mainButton} onClick={connectWithMetamask}>
                  {isWalletConecting ? `Connecting` : `Connect Wallet`}
                </button>
              ) : (
                <>
                  {isOwner ? (
                    <>
                      <ul className={styles.settingsTabsNav}>
                        {Object.keys(settingsTabs).map((tabKey) => {
                          return (
                            <li onClick={() => { setActiveTab(tabKey) }} key={tabKey} className={(tabKey === activeTab) ? styles.activeTab : ``}>
                              {settingsTabs[tabKey]}
                            </li>
                          )
                        })}
                      </ul>
                      <hr className={`${styles.divider} ${styles.spacerTop}`} />
                      {/* -------------------------------------------------*/ }
                      {activeTab === `main` && (
                        <>{renderMainTab()}</>
                      )}
                      {/* -------------------------------------------------*/ }
                    </>
                  ) : (
                    <h2>Access denied</h2>
                  )}
                </>
              )}
            </>
          )}
        </>
      )}
      {/* ---- NOTIFY BLOCK ---- */}
      {notifyBlocks.length > 0 && (
        <div className={styles.notifyHolder}>
          {notifyBlocks.map((block,blockIndex) => {
            return (<div className={`${(block.style) ? styles[block.style] : styles.info}`} key={blockIndex}>{block.msg}</div>)
          })}
        </div>
      )}
      {/* ---- Confirm block ---- */}
      {/*
      <div className={styles.confirmWindow}>
        <div>
          <h3>Title</h3>
          <span>Message</span>
          <div>
            <button className={styles.mainButton} onClick={() => {}}>
              Confirm
            </button>
            <button className={styles.mainButton} onClick={() => {}}>
              Cancel
            </button>
          </div>
        </div>
      </div>
      */}
    </div>
  )
}

export default Settings;
