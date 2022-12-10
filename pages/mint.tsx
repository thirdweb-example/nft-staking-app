import { Web3Button } from "@thirdweb-dev/react";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import styles from "../styles/Home.module.css";

const Mint: NextPage = () => {
  const router = useRouter();

  return (
    <div className={styles.container}>
      <h1 className={styles.h1}>Mint A Weed NFT!</h1>

      <p className={styles.explain}>
        At Dutch Farm, each unit of weed costs 5$. Mint them and <b>stake</b> them to enjoy rewards in our native token $DFM.
      </p>
      <hr className={`${styles.smallDivider} ${styles.detailPageHr}`} />

      <Web3Button
        colorMode="dark"
        accentColor="#5204BF"
        contractAddress="0xeF4Ff095e0AAE69287e05D5AAD85146D602AE843"
        action={(contract) => contract.erc721.claim(1)}
        onSuccess={() => {
          alert("NFT Claimed!");
          router.push(`/stake`);
        }}
        onError={(error) => {
          console.error(error);
          alert(error);
        }}
      >
        Mint some weed
      </Web3Button>
    </div>
  );
};

export default Mint;
