import type { NextPage } from "next";
import { useRouter } from "next/router";
import styles from "../styles/Home.module.css";

const Home: NextPage = () => {
  const router = useRouter();

  return (
    <div className={styles.container}>
      {/* Top Section */}
      <h1 className={styles.h1}>FALCON HEAVY STATION</h1>

      <div
        className={styles.nftBoxGrid}
        role="button"
        onClick={() => router.push(`/mint`)}
      >
        {/* Mint a new NFT */}
        <div className={styles.optionSelectBox}>
          <img src={`/icons/drop.webp`} alt="drop" />
          <h2 className={styles.selectBoxTitle}>MINT NFT</h2>
          <p className={styles.selectBoxDescription}>
            MINT A FRESH <b>FALCON HEAVY MARS</b> NFT
          </p>
        </div>

        <div
          className={styles.optionSelectBox}
          role="button"
          onClick={() => router.push(`/stake`)}
        >
          <img src={`/icons/token.webp`} alt="drop" />
          <h2 className={styles.selectBoxTitle}>NFT PORTAL</h2>
          <p className={styles.selectBoxDescription}>
            VIEW YOUR <b>FALCON HEAVY MARS</b> COLLECTION
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
