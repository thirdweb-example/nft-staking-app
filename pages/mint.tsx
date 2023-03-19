import { Web3Button } from "@thirdweb-dev/react";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { nftDropContractAddress } from "../consts/contractAddresses";
import styles from "../styles/Home.module.css";

const Mint: NextPage = () => {
  const router = useRouter();

  return (
    <div className={styles.container}>
      <h1 className={styles.h1}>Get An L2NFTOG NFT!</h1>

      <p className={styles.explain}>
        Get your NFT if you do not have already 
      </p>
      <hr className={`${styles.smallDivider} ${styles.detailPageHr}`} />

      <Web3Button
        colorMode="dark"
        accentColor="#4B7C60"
        contractAddress={nftDropContractAddress}
        action={(contract) => contract.erc721.claim(1)}
        onSuccess={() => {
          alert("Getting NFT...");
          router.push("/stake");
        }}
        onError={(error) => {
          alert(error);
        }}
      >
        Get an L2NFTOG NFT!
      </Web3Button>
    </div>
  );
};

export default Mint;
