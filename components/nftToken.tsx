import styles from "../styles/Home.module.css"
import isImageUrl from "is-image-url"

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
  } = options
  return (
    <div className={styles.nftBox} key={tokenId.toString()}>
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
      {onDeStake !== null && (
        <button
          disabled={isDeStaking || isStaking || isApproveDo}
          className={`${styles.mainButton} ${styles.spacerBottom}`}
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
          className={`${styles.mainButton} ${styles.spacerBottom}`}
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
                <>Approving</>
              ) : (
                <>
                  {isApproved ? 'Stake' : 'Approve & Stake'}
                </>
              )}
            </>
          )}
        </button>
      )}
    </div>
  )
}

export default nftToken