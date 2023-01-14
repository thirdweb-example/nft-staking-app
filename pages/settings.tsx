import type { NextPage } from "next"
import styles from "../styles/Home.module.css"
import navBlock from "../components/navBlock"
import useStorage from "../storage/"
import { useEffect, useState } from "react"
import { setupWeb3, switchOrAddChain, doConnectWithMetamask, isMetamaskConnected } from "../helpers/setupWeb3"
import { calcSendArgWithFee } from "../helpers/calcSendArgWithFee"

import STORAGE_JSON from "../contracts/Storage.json"
import { getCurrentDomain } from "../helpers/getCurrentDomain"
const storageChainId = 5
const storageAddress = '0xafb8f27df1f629432a47214b4e1674cbcbdb02df'

const settingsTabs = {
  main: `Main settings`,
  texts: `Edit texts`,
  social: `Social links`
}

const debugLog = (msg) => { console.log(msg) }

const Settings: NextPage = () => {
  const { storageData, storageIsLoading } = useStorage()

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
    console.log('>>> new config', newConfig)
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

  const renderMainTab = () => {
    return (
      <div className={styles.form}>
        <div>
          <label>Work ChainId:</label>
          <div>
            <input type="number" value={newChainId} onChange={(v) => doSetChainId(v.target.value)} />
          </div>
        </div>
        <div>
          <label>NFT Collection address</label>
          <div>
            <input type="text" value={newNftCollection} onChange={(v) => doSetNftCollection(v.target.value)} />
          </div>
          <div>
            <button className={styles.secondaryButton} onClick={() => {}}>
              Deploy Demo NFT collection
            </button>
          </div>
        </div>
        <div>
          <label>Reward Token address</label>
          <div>
            <input type="text" value={newRewardToken} onChange={(v) => doSetRewardToken(v.target.value)} />
          </div>
        </div>
        <div>
          <label>Farm contract address</label>
          <div>
            <input type="text" value={newFarmContract} onChange={(v) => doSetFarmContract(v.target.value)} />
          </div>
          <div>
            <button className={styles.secondaryButton} onClick={() => {}}>
              Fetch contract
            </button>
            <button className={styles.secondaryButton} onClick={() => {}}>
              Deploy new farm contract
            </button>
          </div>
        </div>
        <div className={styles.subForm}>
          <div>
            <label>Reward per hour:</label>
            <input type="text" />
          </div>
        </div>
        <button className={styles.mainButton} onClick={doSaveMainConfig} >
          Save changes
        </button>
      </div>
    )
  }
  /* -------------------------------------------- */
  console.log('>>> storageData', storageData, showInstallBox, (storageData && !storageData.isInstalled), !isInstalledOnDomain)
  return (
    <div className={styles.container}>
      {navBlock(`settings`, true)}
      <h1 className={styles.h1}>Settings</h1>
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
    </div>
  )
}

export default Settings;
