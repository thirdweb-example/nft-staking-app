import styles from "../../styles/Home.module.css"
import { useEffect, useState } from "react"
import toggleGroup from "../toggleGroup"
import iconButton from "../iconButton"
import { CHAIN_INFO, ZERO_ADDRESS } from "../../helpers/constants"
import { useStateString, useStateCurrency } from "../../helpers/useState"
import callNftMethod from "../../helpers/callNftMethod"
import { toWei, fromWei } from "../../helpers/wei"
import FormTabs from "../FormTabs"


export default function MintNftForSale(options) {
  const {
    nftAddress,
    chainId,
    openConfirmWindow,
    addNotify,
    getActiveChain
  } = options

  const [ isOpened, setIsOpened ] = useState(false)
  const onToggleOpen = () => {
    setIsOpened(!isOpened)
  }

  const [ tokenUri, setTokenUri, hasTokenUriError ] = useStateString(``, { notEmpty: true })
  const [ tokenPrice, setTokenPrice, hasTokenPriceError ] = useStateCurrency(0, { notZero: true } )
  const [ isNftMinting, setIsNftMinting] = useState(false)

  useEffect(() => {
  }, [])

  const { nativeCurrency } = CHAIN_INFO(chainId)

  const doMintNtf = () => {
    openConfirmWindow({
      title: `Confirm action`,
      message: `Mint NFT for sale?`,
      onConfirm: () => {
        setIsNftMinting(true)
        addNotify(`Mint NFT for sale. Confirm transaction`)
        const { activeWeb3 } = getActiveChain()
        callNftMethod({
          activeWeb3,
          contractAddress: nftAddress,
          method: `mintNFTForSell`,
          args: [
            tokenUri,
            toWei(tokenPrice, nativeCurrency.decimals),
            ZERO_ADDRESS
          ],
          onTrx: (txHash) => {
            addNotify(`Mint NFT for sale TX ${txHash}`, `success`)
            console.log('>> onTrx', txHash)
          },
          onSuccess: (receipt) => {
            addNotify(`Broadcast Mint NFT TX`, `success`)
            console.log('>> onSuccess', receipt)
          },
          onError: (err) => {
            addNotify(`Fail mint NFT. ${err.message ? err.message : ''}`, `error`)
            setIsNftMinting(false)
            console.log('>> onError', err)
          },
          onFinally: (answer) => {
            const tokenId = answer?.events?.Mint?.returnValues?.tokenId
            addNotify(`NFT #${tokenId} is minted!`, `success`)
            setIsNftMinting(false)
            setTokenUri(``)
            console.log('>> onFinally', answer)
          }
        })
      }
    })
  }

  const tabs = new FormTabs({
    activeTab: `mintone`,
    tabs: [
      {
        key: `mintone`,
        title: `Mint one NFT`,
        content: (
          <>
            <div className={styles.subFormInfo}>
              <div className={styles.infoRow}>
                <label>Token URI:</label>
                <span>
                  <div>
                    <input type="text" value={tokenUri} onChange={(e) => { setTokenUri(e) }} />
                    {iconButton({
                      title: `Open in new tab`,
                      href: tokenUri,
                      target: `_blank`,
                    })}
                  </div>
                  {hasTokenUriError && (
                    <div>
                      <b className={styles.hasError}>Specify corrent token uri</b>
                    </div>
                  )}
                </span>
              </div>
              <div className={styles.infoRow}>
                <label>Token Price:</label>
                <span>
                  <div>
                    <input type="number" step="0.1" value={tokenPrice} onChange={(e) => { setTokenPrice(e) }} />
                    <span>{` `}</span><span>{nativeCurrency.symbol}</span>
                  </div>
                  {hasTokenPriceError && (
                    <div>
                      <b className={styles.hasError}>Price must be greater than zero</b>
                    </div>
                  )}
                </span>
              </div>
              <div className={styles.actionsRow}>
                <button
                  disabled={hasTokenUriError || hasTokenPriceError}
                  onClick={doMintNtf}
                >
                  {isNftMinting ? `Minting NFT for sale...` : `Mint NFT for sale`}
                </button>
              </div>
            </div>
          </>
        )
      },
      {
        key: `mintmore`,
        title: `Mint many NFT`,
        content: (
          <div>Mint many NFT</div>
        )
      }
    ]
  })
  return {
    render: () => {
      return toggleGroup({
        title: `Mint NFT for sale`,
        isOpened,
        onToggle: onToggleOpen,
        content: tabs.render()
      })
    }
  }
}