import { useState } from "react"
import { switchOrAddChain, getCurrentChainId } from "../helpers/setupWeb3"
import { CHAIN_INFO } from "../helpers/constants"
import { getStorageInfo } from "../storage/"
import FaIcon from "./FaIcon"
import AdminPopupWindow from "./AdminPopupWindow"
import styles from "../styles/Home.module.css"

export default function SwitchNetworkAndCall(options) {
  const {
    children,
    disabled,
    onClick,
    chainId: _chainId,
    action,
    className,
    icon
  } = {
    disabled: false,
    chainId: 1,
    className: ``,
    action: `Save`,
    onClick: () => {},
    ...options
  }

  const [ isSelectChainOpened, setIsSelectChainOpened ] = useState(false)
  
  const { storageChainId } = getStorageInfo()
  const chainId = (_chainId == `STORAGE`) ? storageChainId : _chainId
  const [ isSwitching, setIsSwitching ] = useState(false)
  const currentChainId = getCurrentChainId()
  let multiChain = (chainId instanceof Array)
    
  const needChainInfo = (multiChain) ? false : CHAIN_INFO(chainId)


  let isCorrectChain = false
  if (multiChain) {
    isCorrectChain = (chainId.indexOf(Number(`${currentChainId}`)) !== -1)
  } else {
    isCorrectChain = `${chainId}` == `${currentChainId}`
  }

  const switchToChain = (needChainId) => {
    setIsSwitching(true)
    switchOrAddChain(needChainId).then((isSwitched) => {
      setIsSwitching(false)
      if (isSwitched) {
        setIsSelectChainOpened(false)
        onClick()
      }
    }).catch ((err) => {
      setIsSwitching(false)
    })
  }
  const switchOrClick = () => {
    if (!isCorrectChain) {
      if (multiChain) {
        setIsSelectChainOpened(true)
      } else {
        setIsSwitching(true)
        switchOrAddChain(chainId).then((isSwitched) => {
          setIsSwitching(false)
          if (isSwitched) {
            onClick()
          }
        }).catch ((err) => {
          setIsSwitching(false)
        })
      }
    } else {
      onClick()
    }
  }
  
  return (
    <>
      <button disabled={disabled || isSwitching} onClick={switchOrClick} className={className}>
        {icon && (
          <FaIcon icon={icon} />
        )}
        {(!isCorrectChain) ? (
          <>
            {isSwitching ? (
              <>{(multiChain) ? `Switching...` : `Switching to ${needChainInfo.chainName} (${chainId})...`}</>
            ) : (
              <>{(multiChain) ? `Switch network for ${action}` : `Switch to ${needChainInfo.chainName} (${chainId}) for ${action}`}</>
            )}
          </>
        ) : (
          <>
            {children}
          </>
        )}
      </button>
      {multiChain && (
        <AdminPopupWindow
          hasClose={true}
          isOpened={isSelectChainOpened}
          onClose={() => { setIsSelectChainOpened(false) }}
          title={`Switch network for ${action}`}
        >
          <style jsx>
          {`
            .switchNetworkList {
              padding: 10px;
              padding-bottom: 0px;
            }
            .switchNetworkList BUTTON {
              margin-left: 0px;
              width: 100%;
              margin-bottom: 10px;
            }
          `}
          </style>
          <div className="switchNetworkList">
            {chainId.map((needChainId) => {
              const needChainInfo = CHAIN_INFO(needChainId)
              return (
                <button key={needChainId} disabled={isSwitching} onClick={() => { switchToChain(needChainId) }} className={styles.adminButton}>
                  {(isSwitching) ? `Switching...` : `Switch to ${needChainInfo.chainName} (${needChainId})`}
                </button>
              )
            })}
          </div>
        </AdminPopupWindow>
      )}
    </>
  )
}