import styles from "../styles/Home.module.css"
import isImageUrl from "../helpers/isImageUrl"
import { getLink } from "../helpers/getLink"

const nftToken = (options) => {
  const {
    tokenId,
    tokenUri,
    isApproved,
    onDeStake,
    onStake,
    isFetchUri,
    deStakeId,
    stakeId,
    isStaking,
    isDeStaking,
    isApproveDo,
    isApproveId,
    isMinted,
  } = options
  return (
    <div className={`${styles.nftBox} nftTokenBox`} key={tokenId.toString()}>
      {tokenUri !== false && isImageUrl(tokenUri) ? (
        <>
          <h3>#{tokenId}</h3>
          <img src={tokenUri} />
        </>
      ) : (
        <>
          <h3>#{tokenId}</h3>
          {isFetchUri && (
            <h2>Fetch info</h2>
          )}
        </>
      )}
      {isMinted ? (
        <>
          <a
            className={`${styles.mainButton} ${styles.spacerBottom} primaryButton`}
            href={getLink(`stake`)}
          >
            Go to staking
          </a>
        </>
      ) : (
        <>
          {onDeStake !== null && (
            <button
              disabled={isDeStaking || isStaking || isApproveDo}
              className={`${styles.mainButton} ${styles.spacerBottom} primaryButton`}
              onClick={onDeStake}
            >
              {(isDeStaking && (deStakeId === tokenId)) ? (
                <>De-staking...</>
              ) : (
                <>De-stake</>
              )}
            </button>
          )}
          {onStake !== null && (
            <button
              className={`${styles.mainButton} ${styles.spacerBottom} primaryButton`}
              onClick={onStake}
              disabled={isDeStaking || isStaking || isApproveDo}
            >
              {(isStaking && (stakeId === tokenId)) ? (
                <>
                  Staking...
                </>
              ) : (
                <>
                  {(isApproveDo && (isApproveId === tokenId)) ? (
                    <>Approving...</>
                  ) : (
                    <>
                      {isApproved ? 'Stake' : 'Approve & Stake'}
                    </>
                  )}
                </>
              )}
            </button>
          )}
        </>
      )}
    </div>
  )
}

export default nftToken