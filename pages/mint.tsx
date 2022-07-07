import { useAddress, useMetamask, useNFTDrop } from "@thirdweb-dev/react";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import styles from "../styles/Home.module.css";

const Mint: NextPage = () => {
  const router = useRouter();
  // Get the currently connected wallet's address
  const address = useAddress();

  // Function to connect to the user's Metamask wallet
  const connectWithMetamask = useMetamask();

  // Get the NFT Collection contract
  const nftDropContract = useNFTDrop(
    "0x269f26c44aAD70Cf9c53b5105823743FAF467c07"
  );

  async function claimNft() {
    try {
      const tx = await nftDropContract?.claim(1);
      console.log(tx);
      alert("NFT Claimed!");
      router.push(`/stake`);
    } catch (error) {
      console.error(error);
      alert(error);
    }
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.h1}>MINT A FRESH FALCON HEAVY MARS NFT</h1>

      <p className={styles.explain}>
      Falcon Heavy Mars is a collection of <b>10,000 unique NFTs</b> that are similar to Pokemon playing cards. 
      Stake your <b>FHM NFTs</b> on the <b>GEYSER</b> and farm <b>AVY</b> tokens.
      </p>
      <hr className={`${styles.smallDivider} ${styles.detailPageHr}`} />

      {!address ? (
        <button
          className={`${styles.mainButton} ${styles.spacerBottom}`}
          onClick={connectWithMetamask}
        >
          Connect Metamask
        </button>
      ) : (
        <button
          className={`${styles.mainButton} ${styles.spacerBottom}`}
          onClick={() => claimNft()}
        >
          MINT NFT
        </button>
      )}
    </div>
  );
};

export default Mint;
