import type { NextPage } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import styles from "../styles/Home.module.css";

const Home: NextPage = () => {
  const router = useRouter();

  return (
    <div className={styles.container}>
      {/* Top Section */}
      <h1 className={styles.h1}>L2NFTOG Staking Rewards</h1>
      <div className={styles.nftBoxGrid}>
        <div
          className={styles.optionSelectBox}
          role="button"
          onClick={() => router.push(`/mint`)}
        >
          {/* Acuire L2NFTOG NFT */}
          <Image src="/icons/drop.webp" alt="drop" width={64} height={64} />
          <h2 className={styles.selectBoxTitle}>Mint a new NFT</h2>
          <p className={styles.selectBoxDescription}>
            Get an L2NFTOF NFT from [NFTEarth](https://nftearth.exchange/collection/optimism/0x00e3aa03e47c32397a94509e50b0558988c0d04e)! 
          </p>
        </div>

        <div
          className={styles.optionSelectBox}
          role="button"
          onClick={() => router.push(`/stake`)}
        >
          {/* Stake Your NFT to begin earning $NFTE token rewards! */}
          <Image src="/icons/token.webp" alt="token" width={64} height={64} />
          <h2 className={styles.selectBoxTitle}>Stake Your NFTs</h2>
          <p className={styles.selectBoxDescription}>
            Stake your L2NFTOG NFT and earn tokens from the <b> $$NFTE staking rewards </b> contract.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
