import type { NextPage } from "next"
import { useRouter } from "next/router"
import styles from "../styles/Home.module.css"
import { getLink, getAssets, getText, getBoolOption, getIntOption } from "../helpers"
import navBlock from "../components/navBlock"
import logoBlock from "../components/logoBlock"


const Home: NextPage = () => {
  const router = useRouter();

  return (
    <div className={styles.container}>
      {navBlock(`index`, true)}
      {/* Top Section */}
      {logoBlock()}
      <h1 className={styles.h1}>{getText(`Stake NFT - earn ERC20`, `MainPage_Header`)}</h1>

      <div
        className={styles.nftBoxGrid}
      >
        {/* Mint a new NFT */}
        { getBoolOption( `MainPage_EnabledMind` , true ) && (
          <div className={styles.optionSelectBox}>
            <h2 className={styles.selectBoxTitle}>
              {getText(`Mint demo NFT`, `MainPage_Mint_Title`)}
            </h2>
            <p className={styles.selectBoxDescription}>
              {getText(`Use the NFT Drop Contract to claim an NFT from the collection.`, `MainPage_Mint_Desc`)}
            </p>
          </div>
        )}
        <div
          className={styles.optionSelectBox}
          role="button"
          onClick={() => router.push(getLink(`stake`))}
        >
          <h2 className={styles.selectBoxTitle}>
            {getText(`Stake Your NFTs`, `MainPage_Stake_Title`)}
          </h2>
          <p className={styles.selectBoxDescription}>
            {getText(
              `By locking up NFTs on a platform, you can receive rewards depending on the annual interest rate, the staking duration, and the number of NFTs staked`,
              `MainPage_Stake_Desc`
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
