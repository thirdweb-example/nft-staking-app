import styles from "../styles/Home.module.css"
import isImageUrl from "../helpers/isImageUrl"
import { getLink } from "../helpers/getLink"
import { getUnixTimestamp } from "../helpers/getUnixTimestamp"
import { TimeToText } from "../helpers/TimeToText"

const nftToken = (options) => {
  const {
    tokenId,
    tokenUri,
    price,
    seller,
    currency,
    needApprove,
    isApproving,
    isBuying,
    onBuy,
    isActive,
    onApproveAndBuy,
    openConfirmWindow,
    isUserNFT,
    isOwner,
    isTradeAllow,
    isRemoveFromTrade,
    onRemoveFromTrade,
    onAddToTrade,
    isPreview,
    isWalletConnected
  } = options


  return (
    <div className={`${styles.nftBox} nftTokenBox ${styles.nftSaleBox}`} key={tokenId.toString()}>
      {tokenUri !== false && isImageUrl(tokenUri) ? (
        <>
          <h3>#{tokenId}</h3>
          <img src={tokenUri} />
        </>
      ) : (
        <>
          <h3>#{tokenId}</h3>
        </>
      )}

      {!isPreview && (
        <>
          {isUserNFT ? (
            <>
              <a
                className={`${styles.mainButton} ${styles.spacerBottom} primaryButton`}
                href={getLink(`stake`)}
              >
                Go to staking
              </a>
              {isTradeAllow && (
                <button disabled={isApproving || isBuying || isRemoveFromTrade}
                  className={`${styles.mainButton} ${styles.spacerBottom} primaryButton`}
                  onClick={onAddToTrade}
                >
                  Sell
                </button>
              )}
            </>
          ) : (
            <>
              <div className={styles.nftTokenPrice}>{price}{` `}{currency}</div>
              {isWalletConnected && (
                <>
                  {isOwner ? (
                    <button disabled={isApproving || isBuying || isRemoveFromTrade}
                      className={`${styles.mainButton} ${styles.spacerBottom} primaryButton`}
                      onClick={onRemoveFromTrade}
                    >
                      {isRemoveFromTrade
                        ? isActive ? `Removing...` : `Remove from sale`
                        : `Remove from sale`
                      }
                    </button>
                  ) : (
                    <>
                      {needApprove ? (
                        <button
                          disabled={isApproving || isBuying || isRemoveFromTrade}
                          className={`${styles.mainButton} ${styles.spacerBottom} primaryButton`}
                          onClick={onApproveAndBuy}
                        >
                          {isApproving
                            ? isActive ? `Approving...` : `Approve & Buy`
                            : `Approve & Buy`
                          }
                        </button>
                      ) : (
                        <button
                          disabled={isApproving || isBuying || isRemoveFromTrade}
                          className={`${styles.mainButton} ${styles.spacerBottom} primaryButton`}
                          onClick={onBuy}
                        >
                          {isBuying
                            ? isActive ? `Buying...` : `Buy`
                            : `Buy`
                          }
                        </button>
                      )}
                    </>
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

export default nftToken