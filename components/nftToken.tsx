import styles from "../styles/Home.module.css"
import isImageUrl from "../helpers/isImageUrl"
import { getLink } from "../helpers/getLink"
import { getUnixTimestamp } from "../helpers/getUnixTimestamp"
import { TimeToText } from "../helpers/TimeToText"
import NftMedia from "./NftMedia"

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
    farmStatus,
    tokenUtx,
    openConfirmWindow,
  } = options

  let isLocked = false
  if (farmStatus && farmStatus.version >= 3) {
    if (farmStatus.lockEnabled) {
      if (getUnixTimestamp() < (Number(tokenUtx) + Number(farmStatus.lockTime))) {
        isLocked = true
      }
    }
  }
  const onLocked = () => {
    const lockTimeUtx = (Number(tokenUtx) + Number(farmStatus.lockTime)) - getUnixTimestamp()
    openConfirmWindow({
      title: `NFT token is locked`,
      message: `This token is currently locked. You can withdraw him out of the farm in ${TimeToText(lockTimeUtx)}`,
      isOk: true
    })
  }

  return (
    <div className={`${styles.nftBox} nftTokenBox`} key={tokenId.toString()}>
      {tokenUri !== false && isImageUrl(tokenUri) ? (
        <>
          <h3>#{tokenId}</h3>
          <NftMedia url={tokenUri} />
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
            <>
              {isLocked ? (
                <button onClick={onLocked} className={`${styles.mainButton} ${styles.spacerBottom} primaryButton`}>
                  Locked
                </button>
              ) : (
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
            </>
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