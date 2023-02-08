import type { NextPage } from "next"
import { useRouter } from "next/router"
import styles from "../styles/Home.module.css"
import { getLink, getAssets, getBoolOption, getIntOption } from "../helpers"
import navBlock from "../components/navBlock"
import logoBlock from "../components/logoBlock"
import useStorage from "../storage/"
import { useEffect, useState } from "react"


const Home: NextPage = (props) => {
  const router = useRouter();
  const { isOwner, getText, getDesign, storageMenu } = props

  return (
    <div className={styles.container}>
      {navBlock(`index`)}
      {/* Top Section */}
      {logoBlock({
        getText,
        getDesign
      })}
      <h1 className={`${styles.h1} pageTitle`}>{getText(`MainPage_Header`, `Stake NFT - earn ERC20`)}</h1>

      <div className="mainPageTextAfterTitle">
        {getText(`MainPage_AfterTitle`)}
      </div>
      <div
        className={styles.nftBoxGrid}
      >
        {/* Mint a new NFT */}
        { getBoolOption( `EnabledDemoMind` , true ) && (
          <div className={`${styles.optionSelectBox} mainPageSection`}>
            <a href={getLink(`mint`)}>
              <h2 className={styles.selectBoxTitle}>
                {getText(`MainPage_Mint_Title`, `Mint demo NFT`)}
              </h2>
              <p className={styles.selectBoxDescription}>
                {getText(`MainPage_Mint_Desc`, `Use the NFT Drop Contract to claim an NFT from the collection.`)}
              </p>
            </a>
          </div>
        )}
        <div
          className={`${styles.optionSelectBox} mainPageSection`}
          
        >
          <a href={getLink(`stake`)}>
            <h2 className={styles.selectBoxTitle}>
              {getText(`MainPage_Stake_Title`, `Stake Your NFTs`)}
            </h2>
            <p className={styles.selectBoxDescription}>
              {getText(
                `MainPage_Stake_Desc`,
                `By locking up NFTs on a platform, you can receive rewards depending on the annual interest rate, the staking duration, and the number of NFTs staked`
              )}
            </p>
          </a>
        </div>
      </div>
      <div className="mainPageTextAfterSections">
        {getText(`MainPage_AfterSections`)}
      </div>
    </div>
  );
};

export default Home;
