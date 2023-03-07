import { useEffect, useState } from "react"
import { useStateUint } from "../../helpers/useState"
import toggleGroup from "../toggleGroup"
import styles from "../../styles/Home.module.css"
import iconButton from "../iconButton"
import openInTab from "../openInTab"
import FaIcon from "../FaIcon"
import callNftMethod from "../../helpers/callNftMethod"
import List from "../List"
import {
  CHAIN_INFO,
  CHAIN_EXPLORER_LINK
} from "../../helpers/constants"
import { toWei, fromWei } from "../../helpers/wei"
import SwitchNetworkAndCall from "../SwitchNetworkAndCall"


export default function NftInfoBlock(options) {
  const {
    NFTStakeInfo,
    chainId,
    getActiveChain,
    contractAddress,
    openConfirmWindow,
    addNotify,
    onSaveChanges,
  } = options

  const {
    version,
    owner,
    maxSupply,
    totalSupply,
    allowTrade,
    allowUserSale,
    tradeFee,
    allowMint,
    mintPrice,

    allowedERC20,
    
    allowMintOwn,
    mintOwnPrice,
  } = NFTStakeInfo

  const nativeCurrency = CHAIN_INFO(chainId).nativeCurrency
  const [ isEditValues, setIsEditValue ] = useState(false)
  
  const [ newAllowMint, setNewAllowMint ] = useState((allowMint) ? 1 : 0)
  const [ newMintPrice, setNewMintPrice ] = useState(fromWei(mintPrice, nativeCurrency.decimals))
  const [ newAllowMintOwn, setNewAllowMintOwn ] = useState((allowMintOwn) ? 1 : 0)
  const [ newMintOwnPrice, setNewMintOwnPrice ] = useState(fromWei(mintOwnPrice, nativeCurrency.decimals))
  const [ newAllowTrade, setNewAllowTrade ] = useState((allowTrade) ? 1 : 0)
  const [ newAllowUserSale, setNewAllowUserSale ] = useState((allowUserSale) ? 1 : 0)
  const [ newTradeFee, setNewTradeFee ] = useState(tradeFee)
  const [ newAllowedERC20, setNewAllowedERC20 ] = useState(allowedERC20)

  const onEditValues = () => {
    setNewAllowMint((allowMint) ? 1 : 0)
    setNewMintPrice(fromWei(mintPrice, nativeCurrency.decimals))
    setNewAllowTrade((allowTrade) ? 1 : 0)
    setNewAllowUserSale((allowUserSale) ? 1 : 0)
    setNewTradeFee(tradeFee)
    setNewAllowedERC20(allowedERC20)
    setIsEditValue(true)
  }
  const offEditValues = () => {
    setIsEditValue(false)
  }
  const [ isSaveChanges, setIsSaveChanges ] = useState(false)
  const saveChanges = () => {
    const {
      activeWeb3
    } = getActiveChain()

    openConfirmWindow({
      title: `Save changes`,
      message: `Save NFT collection settings?`,
      onConfirm: () => {
        setIsSaveChanges(true)
        addNotify(`Saving NFT collection options. Confirm transaction`)

        callNftMethod({
          activeWeb3,
          contractAddress: contractAddress,
          method: 'setNewOptions',
          args: [
            toWei(newMintPrice, nativeCurrency.decimals),
            (newAllowTrade == 1) ? true : false,
            (newAllowUserSale == 1) ? true : false,
            newTradeFee,
            (newAllowMint == 1) ? true : false,
            newAllowedERC20
          ],
          onTrx: (txHash) => {
            console.log('>> onTrx', txHash)
            addNotify(`Save NFT collection options TX ${txHash}`, `success`)
          },
          onSuccess: (receipt) => {
            console.log('>> onSuccess', receipt)
            setIsSaveChanges(false)
            setIsEditValue(false)
            onSaveChanges()
            addNotify(`NFT collection options saved`, `success`)
          },
          onError: (err) => {
            setIsSaveChanges(false)
            addNotify(`Fail save NFT collection options. ${err.message ? err.message : ''}`, `error`)
            console.log('>> onError', err)
          },
          onFinally: (answer) => {
            console.log('>> onFinally', answer)
          }
        })
      }
    })
    
  }
  
  
  return (
    <div className={styles.adminForm}>
      {toggleGroup({
        title: `NFT Collection info`,
        isOpened: true,
        onToggle: () => {},
        content: (
          <>
            <div className={styles.subFormInfo}>
              <div className={styles.infoRow}>
                <label>Contract address:</label>
                <div>
                  <div>
                    <b>{contractAddress}</b>
                    {openInTab(CHAIN_EXPLORER_LINK({ address: contractAddress, chainId }), `Open in block explorer`)}
                  </div>
                </div>
              </div>
              <div className={styles.infoRow}>
                <label>Contract version:</label>
                <span>
                  <b>{version}</b>
                </span>
              </div>
              <div className={styles.infoRow}>
                <label>Owner</label>
                <span>
                  <b>{owner}</b>
                </span>
              </div>
              <div className={styles.infoRow}>
                <label>Max supply</label>
                <span>
                  <b>{maxSupply}</b>
                </span>
              </div>
              <div className={styles.infoRow}>
                <label>Total supply</label>
                <span>
                  <b>{totalSupply}</b>
                </span>
              </div>
              <div className={styles.infoRow}>
                <label>Allow mint:</label>
                <div>
                  {isEditValues ? (
                    <div>
                      <select value={newAllowMint} onChange={(e) => { setNewAllowMint(e.target.value) }}>
                        <option value={0}>No</option>
                        <option value={1}>Yes</option>
                      </select>
                    </div>
                  ) : (
                    <div>
                      <b>{allowMint ? `Yes` : `No`}</b>
                    </div>
                  )}
                </div>
              </div>
              {newAllowMint == 1 && (
                <div className={styles.infoRow}>
                  <label>Mint price ({nativeCurrency.symbol})</label>
                  {isEditValues ? (
                    <div>
                      <input type="number" min="0" step="0.001" value={newMintPrice} onChange={(e) => { setNewMintPrice(e.target.value) }} />
                    </div>
                  ) : (
                    <div>
                      <b>{fromWei(mintPrice, nativeCurrency.decimals)}</b>
                    </div>
                  )}
                </div>
              )}
              <div className={styles.infoRow}>
                <label>Allow trade:</label>
                <div>
                  {isEditValues ? (
                    <div>
                      <select value={newAllowTrade} onChange={(e) => { setNewAllowTrade(e.target.value) }}>
                        <option value={0}>No</option>
                        <option value={1}>Yes</option>
                      </select>
                    </div>
                  ) : (
                    <div>
                      <b>{allowTrade ? `Yes` : `No`}</b>
                    </div>
                  )}
                </div>
              </div>
              {newAllowTrade == 1 && (
                <>
                  <div className={styles.infoRow}>
                    <label>ERC20 allowed for trade:</label>
                    {isEditValues ? (
                      <div>
                        <div>
                          <strong className={styles.inputInfo}>List of token contracts that can be used for trading on par with native currency</strong>
                        </div>
                        <div>
                          
                          <List items={newAllowedERC20} onChange={(v) => { setNewAllowedERC20(v) }} />
                        </div>
                      </div>
                    ) : (
                      <div>
                        {allowedERC20.length ? (
                          <>
                            <div>
                              <strong className={styles.inputInfo}>List of token contracts that can be used for trading on par with native currency</strong>
                            </div>
                            {allowedERC20.map((erc20, key) => {
                              return (
                                <div key={key}>
                                  <strong>{erc20}</strong>
                                  {openInTab(CHAIN_EXPLORER_LINK({ address: erc20, chainId }), `Open in block explorer`)}
                                </div>
                              )
                            })}
                          </>
                        ) : (
                          <strong className={styles.inputInfo}>Empty. Allowed only native currency</strong>
                        )}
                        
                      </div>
                    )}
                  </div>
                  <div className={styles.infoRow}>
                    <label>Allow user sale:</label>
                    {isEditValues ? (
                      <div>
                        <select value={newAllowUserSale} onChange={(e) => { setNewAllowUserSale(e.target.value) }}>
                          <option value={0}>No</option>
                          <option value={1}>Yes</option>
                        </select>
                      </div>
                    ) : (
                      <div>
                        <b>{allowUserSale ? `Yes` : `No`}</b>
                      </div>
                    )}
                  </div>
                </>
              )}
              {newAllowTrade == 1 && newAllowUserSale == 1 && (
                <div className={styles.infoRow}>
                  <label>Trade fee:</label>
                  {isEditValues ? (
                    <div>
                      <input type="number" min="0" max="30" value={newTradeFee} onChange={(e) => { setNewTradeFee(e.target.value) }} />
                      <strong>%</strong>
                    </div>
                  ) : (
                    <div>
                      <b>{tradeFee}</b>
                      <strong>%</strong>
                    </div>
                  )}
                </div>
              )}
              {/*
              {NFTStakeInfo.allowUserSale && (
                <>
                  
                </>
              )}
              <div className={styles.infoRow}>
                <label>Allow mint:</label>
                <span>
                  <b>{NFTStakeInfo.allowMint ? `Yes` : `No`}</b>
                  <a className={styles.adminActionButton} title={`Edit value`}>
                    <FaIcon icon="pen-to-square" />
                  </a>
                </span>
              </div>
              <div className={styles.infoRow}>
                <label>Mint price:</label>
                <span>
                  <b>
                    {fromWei(
                      NFTStakeInfo.mintPrice,
                      nftChainInfo.nativeCurrency.decimals
                    )}
                    {` `}
                    {nftChainInfo.nativeCurrency.symbol}
                    <a className={styles.adminActionButton} title={`Edit value`}>
                      <FaIcon icon="pen-to-square" />
                    </a>
                    <a className={styles.buttonWithIcon}>
                      <FaIcon icon="cloud-arrow-up" />
                      Save changes
                    </a>
                    <a className={styles.buttonWithIcon}>
                      <FaIcon icon="xmark" />
                      Cancel
                    </a>
                  </b>
                </span>
              </div>
              */}
              <div className={styles.actionsRow}>
                {isEditValues ? (
                  <>
                    <SwitchNetworkAndCall
                      chainId={chainId}
                      className={styles.adminButton}
                      disabled={false}
                      onClick={saveChanges}
                      action={`Save changes`}
                    >
                      Save changes
                    </SwitchNetworkAndCall>
                    <button onClick={offEditValues} className={styles.adminButton}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <button onClick={onEditValues} className={styles.adminButton}>
                    Edit NFT options
                  </button>
                )}
              </div>
            </div>
          </>
        )
      })}
    </div>
  )
}