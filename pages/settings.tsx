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
  onBlockchainChanged,
} from "../helpers/setupWeb3"
import { calcSendArgWithFee } from "../helpers/calcSendArgWithFee"

import STORAGE_JSON from "../contracts/Storage.json"
import { getCurrentDomain } from "../helpers/getCurrentDomain"
import { getUnixTimestamp } from "../helpers/getUnixTimestamp"
import fetchTokenInfo from "../helpers/fetchTokenInfo"
import fetchNftInfo from "../helpers/fetchNftInfo"
import fetchFarmInfo from "../helpers/fetchFarmInfo"
import fetchTokenBalance from "../helpers/fetchTokenBalance"
import deployFarmContract from "../helpers/deployFarmContract"
import deployDemoNft from "../helpers/deployDemoNft"
import delay from "../helpers/delay"
import { toWei, fromWei } from "../helpers/wei"
import openInTab from "../components/openInTab"
import { textsGroups } from "../helpers/textsGroups"


import {
  AVAILABLE_NETWORKS_INFO,
  CHAIN_INFO,
  CHAIN_EXPLORER_LINK
} from "../helpers/constants"

const storageChainId = 5
const storageAddress = '0xafb8f27df1f629432a47214b4e1674cbcbdb02df'

const settingsTabs = {
  main: `Main settings`,
  nftconfig: `NFT collection`,
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

  const {
    storageData,
    storageIsLoading,
    isOwner,
    openConfirmWindow,
    addNotify,
    setDoReloadStorage,
    storageTexts,
  } = props

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

  const onNetworkChanged = (newActiveChainId) => {
    console.log('>>> newActiveChainId', newActiveChainId)
    setActiveChainId(newActiveChainId)
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
        onBlockchainChanged(onNetworkChanged)
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
  const [isStorageSave, setIsStorageSave] = useState(false)


  const saveStorageConfig = async (options) => {
    const {
      onBegin,
      onReady,
      onError,
      newData,
    } = options

    if (isStorageSave) {
      addNotify(`Storage already saving...`, `error`)
      return
    }
    const _newStorageData = {
      ...storageData,
      ...newData,
    }
    console.log('>> save data', _newStorageData)
    const _doSave = async () => {
      if (address && storageContract) {
        addNotify(`Saving config to storage. Confirm transaction`)
        setIsStorageSave(true)
        if (onBegin) onBegin()

        const saveData = _newStorageData

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
            setIsStorageSave(false)
            if (onReady) onReady()
          }).catch((e) => {
            console.log('>>> error', e)
            setIsStorageSave(false)
            if (onError) onError(e)
          })
        } catch (e) {
          console.log('>>> error', e)
          setIsStorageSave(false)
          if (onError) onError(e)
        }
      } else {
        addNotify(`Fail save storage. No active wallet or contract not ready yet`, `error`)
      }
    }
    console.log('>> do save', getCurrentChainId() !== storageChainId, getCurrentChainId(), storageChainId)
    if (!getCurrentChainId(storageChainId)) {
      const storageChainInfo = CHAIN_INFO(storageChainId)
      openConfirmWindow({
        title: `Need change active chain for save main config`,
        message: `Please change network Storage chain (${storageChainInfo.chainName})`,
        onConfirm: async () => {
          addNotify(`Switching to Storage chain`)
          await switchOrAddChain(storageChainId)
          await delay(2000)
          _doSave()
        },
        okLabel: `Switch`,
      })
    } else {
      _doSave()
    }
  }

  let showInstallBox = (storageData && !storageData.isInstalled)

  const [isInstalledOnDomain, setIsInstalledOnDomain] = useState(!showInstallBox)
  const [isSettingUpOnDomain, setIsSettingUpOnDomain] = useState(false)
  const doSetupOnDomain = () => {
    saveStorageConfig({
      onBegin: () => {
        setIsSettingUpOnDomain(true)
        addNotify(`Confirm transaction for setup NFTStake on this domain`)
      },
      onReady: async () => {
        setIsSettingUpOnDomain(false)
        setIsInstalledOnDomain(true)
        addNotify(`NFTStake successfull installed on this domain. Now you can configure farm`, `success`)
        setDoReloadStorage(true)
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

  /* --- NFT Info ---- */
  const [ isNFTInfoFetching, setIsNFTInfoFetching ] = useState(false)
  const [ isNFTInfoFetched, setIsNFTInfoFetched ] = useState(false)
  const [ nftCollectionInfo, setNftCollectionInfo ] = useState({
    name: ``,
    symbol: ``
  })

  const _doFetchNFTInfo = (nftAddress, nftChainId) => {
    setIsNFTInfoFetching(true)
    setIsNFTInfoFetched(false)
    setNftCollectionInfo({})
    addNotify(`Fetching NFT collection info`)
  
    fetchNftInfo(nftAddress, nftChainId).then((answ) => {
      addNotify(`NFT collection info fetched`, `success`)
      setNftCollectionInfo(answ)
      setIsNFTInfoFetched(true)
      setIsNFTInfoFetching(false)
    }).catch((err) => {
      console.log(err)
      setIsNFTInfoFetching(false)
      addNotify(`Fail fetch NFT info. ${err.message ? err.message : ''}`, `error`)
    })
  }

  const doFetchNFTInfo = () => {
    if (newChainId && newNftCollection) {
      _doFetchNFTInfo(newNftCollection, newChainId)
    } else {
      addNotify(`Fail fetch NFT info. No chainid or nft contract address`, `error`)
    }
  }
  /* ----------------- */
  /* --- Deploy demo NFT ---- */
  const [ isDeployingNFTDemo, setIsDeployingNFTDemo ] = useState(false)

  const doDeployDemoNFT = () => {
    const activeChainInfo = CHAIN_INFO(activeChainId)
    openConfirmWindow({
      title: `Deploying Demo NFT`,
      message: `Deploy Demo NFT at ${activeChainInfo.chainName} (${activeChainId})?`,
      okLabel: `Deploy`,
      onConfirm: () => {
        setIsDeployingNFTDemo(true)
        setNftCollectionInfo({})
        setIsNFTInfoFetched(false)
        deployDemoNft({
          activeWeb3,
          onSuccess: (contractAddress) => {
            console.log('>>> contract ', contractAddress)
            setNewNftCollection(contractAddress)
            setIsDeployingNFTDemo(false)
            addNotify(`Demo NFT Collection deployed`, `success`)
            _doFetchNFTInfo(contractAddress, newChainId || activeChainId)
          },
          onTrx: (hash) => {
            addNotify(`NFT Collection deploy TX ${hash}...`, `success`)
          },
          onError: (err) => {
            addNotify(`Fail deploy demo NFT collection. ${err.message ? err.message : ``}`, `error`)
            setIsDeployingNFTDemo(false)
          }
        }).then((answ) => {
        }).catch((err) => {
          console.log(err)
          addNotify(`Fail deploy demo NFT collection. ${err.message ? err.message : ``}`, `error`)
          setIsDeployingNFTDemo(false)
        })
      },
    })
  }
  /* --- Deploy farm contract --- */
  const [ isOpenedDeployFarm, setIsOpenedDeployFarm ] = useState(false)
  const [ deployRewardPerHour, setDeployRewardPerHour ] = useState( 0.1 )
  const [ isFarmContractDeploying, setIsFarmContractDeploying ] = useState(false)
  const [ canDeploy, setCanDeploy ] = useState(false)

  const doDeployFarmContract = () => {
    const activeChainInfo = CHAIN_INFO(activeChainId)
    openConfirmWindow({
      title: `Deploy Farm contract`,
      message: `Deploy Farm contract at ${activeChainInfo.chainName} (${activeChainId})?`,
      okLabel: `Deploy`,
      onConfirm: () => {
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
            },
            onError: (err) => {
              addNotify(`Fail deploy contract. ${(err.message ? err.message : '')}`, `error`)
              setIsFarmContractDeploying(false)
              console.log(err)
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
      },
    })
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
    console.log('>>> texts', storageTexts, newStorageTexts)
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
    console.log('>>>', ReloadStorage)
    ReloadStorage()
    setDoReloadStorage(true)
  /*
    deployDemoNft({
      activeWeb3,
      onSuccess: (contractAddress) => {
        console.log('>>> contract ', contractAddress)
      }
    }).then((answ) => {
    }).catch((err) => {
      console.log(err)
    })
    */
  }

  

  const renderMainTab = () => {
    return (
      <div className={styles.adminForm}>
        {/*<button onClick={doTest}>Test</button>*/}
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
                <>
                  <button disabled={isDeployingNFTDemo || isNFTInfoFetching} className={styles.secondaryButton} onClick={doFetchNFTInfo}>
                    {isNFTInfoFetching ? `Fetching NFT info` : `Fetch NFT info`}
                  </button>
                  <button disabled={isDeployingNFTDemo || isNFTInfoFetching} className={styles.secondaryButton} onClick={doDeployDemoNFT}>
                    {isDeployingNFTDemo ? `Deploying Demo NFT` : `Deploy Demo NFT collection`}
                  </button>
                </>
              )
            })}
          </>
        )}
        {isNFTInfoFetched && nftCollectionInfo && nftCollectionInfo.symbol && (
          <div className={styles.subFormInfo}>
            <h3>NFT Collection info</h3>
            <div className={styles.infoRow}>
              <label>Chain ID:</label>
              <span>
                <b>{CHAIN_INFO(nftCollectionInfo.chainId).chainName} ({nftCollectionInfo.chainId})</b>
              </span>
            </div>
            <div className={styles.infoRow}>
              <label>Address:</label>
              <span>
                <b>{newNftCollection}</b>
                {openInTab(CHAIN_EXPLORER_LINK({ address: nftCollectionInfo.address, chainId: nftCollectionInfo.chainId }), `Open in block explorer`)}
              </span>
            </div>
            <div className={styles.infoRow}>
              <label>Symbol:</label>
              <span>
                <b>{nftCollectionInfo.symbol}</b>
              </span>
            </div>
            <div className={styles.infoRow}>
              <label>Name:</label>
              <span>
                <b>{nftCollectionInfo.name}</b>
              </span>
            </div>
          </div>
        )}
        {!isOpenedDeployFarm && (
          <>
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
              <span>
                <b>{CHAIN_INFO(rewardTokenInfo.chainId).chainName} ({rewardTokenInfo.chainId})</b>
              </span>
            </div>
            <div className={styles.infoRow}>
              <label>Address:</label>
              <span>
                <b>{rewardTokenInfo.address}</b>
                {openInTab(CHAIN_EXPLORER_LINK({ address: rewardTokenInfo.address, chainId: rewardTokenInfo.chainId }), `Open in block explorer`)}
              </span>
            </div>
            <div className={styles.infoRow}>
              <label>Symbol:</label>
              <span>
                <b>{rewardTokenInfo.symbol}</b>
              </span>
            </div>
            <div className={styles.infoRow}>
              <label>Name:</label>
              <span>
                <b>{rewardTokenInfo.name}</b>
              </span>
            </div>
            <div className={styles.infoRow}>
              <label>Decimals:</label>
              <span>
                <b>{rewardTokenInfo.decimals}</b>
              </span>
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
                    {(farmInfoFetching) ? `Fetching...` : `Fetch Farm info`}
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
          <button disabled={isStorageSave} className={styles.mainButton} onClick={doSaveMainConfig} >
            Save changes
          </button>
        </div>
      </div>
    )
  }

  /* ---- EDIT TEXTS ---- */
  const [ newStorageTexts, setNewStorageTexts ] = useState(storageTexts)
  const [ isTextsChanged, setIsTextsChanged ] = useState(false)


  const updateStorageText = (textCode, newText) => {
    console.log('>>> updateStorageText', textCode, newText)

    setNewStorageTexts({
      ...newStorageTexts,
      [`${textCode}`]: newText,
    })
    setIsTextsChanged(true)
  }

  const doSaveTexts = () => {
    openConfirmWindow({
      title: `Save changed texts`,
      message: `Save changed texts?`,
      okLabel: `Save`,
      onConfirm: () => {
        console.log('>>> texts', storageTexts, newStorageTexts)
        const newConfig = {
          texts: newStorageTexts
        }
        saveStorageConfig({
          onBegin: () => {
            setIsSettingUpOnDomain(true)
            addNotify(`Confirm transaction for save changed texts`)
          },
          onReady: () => {
            setIsSettingUpOnDomain(false)
            setIsInstalledOnDomain(true)
            addNotify(`Texts successfull saved`, `success`)
          },
          onError: (err) => {
            setIsSettingUpOnDomain(false)
            addNotify(`Fail save texts`, `error`)
          },
          newData: newConfig
        })
      },
    })
  }

  const renderStorageTextArea = (options) => {
    const {
      code,
      desc,
      value,
      defValue,
      multiline,
    } = options

    return (
      <div className={styles.adminStorageTextArea}>
        <label>{desc} ({code})</label>
        <input
          type="text"
          value={newStorageTexts[code] ? newStorageTexts[code] : defValue}
          onChange={(e) => { updateStorageText(code, e.target.value) }}
        />
      </div>
    )
  }

  const renderTextsTab = () => {
    return (
      <div className={styles.adminForm}>
        {Object.keys(textsGroups).map((groupKey) => {
          return (
            <div className={styles.adminFormTextGroup} key={groupKey}>
              <h3>{textsGroups[groupKey].title}</h3>
              {textsGroups[groupKey].items.map((itemInfo, itemKey) => {
                const {
                  code,
                  desc,
                  value,
                  multiline,
                } = itemInfo
                return (
                  <div key={itemKey}>
                    {renderStorageTextArea({
                      code: code,
                      desc: desc,
                      defValue: value,
                      multiline,
                    })}
                  </div>
                )
              })}
            </div>
          )
        })}
        <div className={styles.adminFormBottom}>
          <button disabled={isStorageSave || !isTextsChanged} className={styles.mainButton} onClick={doSaveTexts} >
            Save changes
          </button>
        </div>
      </div>
    )
  }


  /* ------------------------------------------- */
  const renderActiveChainInfo = () => {
    const chainInfo = CHAIN_INFO(activeChainId)
    const storageChainInfo = CHAIN_INFO(storageChainId)

    return (
      <div className={styles.adminActiveChainInfo}>
        <span>
          Current active network is <b>{chainInfo?.chainName || `Unknown`} ({activeChainId})</b>
        </span>
        <span>
          Main config storage network is <b>{storageChainInfo?.chainName || `Unknown`} ({storageChainId})</b>
        </span>
      </div>
    )
  }
  /* -------------------------------------------- */
  //console.log('>>> storageData', storageData, showInstallBox, (storageData && !storageData.isInstalled), !isInstalledOnDomain)

  if (isInstalledOnDomain) showInstallBox = false
  return (
    <div className={styles.container}>
      {navBlock(`settings`, true)}
      <h1 className={styles.h1}>Settings</h1>
      {storageData !== null && (
        <>
          {(showInstallBox) ? (
            <>
              <h2>NFTStake need setup on this domain</h2>
              {!address ? (
                <button disabled={isWalletConecting} className={styles.mainButton} onClick={connectWithMetamask}>
                  {isWalletConecting ? `Connecting` : `Connect Wallet`}
                </button>
              ) : (
                <>
                  {renderActiveChainInfo()}
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
                      {renderActiveChainInfo()}
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
                      {activeTab === `main` && renderMainTab()}
                      {activeTab === `texts` && renderTextsTab()}
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
    </div>
  )
}

export default Settings;
