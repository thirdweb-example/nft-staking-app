import type { NextPage } from "next";
import { useRouter } from "next/router";
import styles from "../styles/Home.module.css";
import { ThirdwebSDK } from "@thirdweb-dev/sdk";

const sdk = new ThirdwebSDK("polygon");
const contract = await sdk.getContract("0xD9EaFf0D99f1260C0036fdaF92512E8D44C373e2");
const result = await contract.call("withdraw", _tokenId);
const Home: NextPage = () => {
  const router = useRouter();

  return (
    <div className={styles.container}>
      {/* Top Section */}
      <h1 className={styles.h1}>FALCON HEAVY MARS NFT</h1>

      <div
        className={styles.nftBoxGrid}
        role="button"
        onClick={() => router.push(`/mint`)}
      >
        {/* Mint a new NFT */}
        <div className={styles.optionSelectBox}>
          <img src={`/icons/drop.webp`} alt="drop" />
          <h2 className={styles.selectBoxTitle}>Mint a new NFT</h2>
          <p className={styles.selectBoxDescription}>
            Mint a fresh Falcon Heavy Mars NFT from the collection.
          </p>
        </div>

        <div
          className={styles.optionSelectBox}
          role="button"
          onClick={() => router.push(`/stake`)}
        >
          <img src={`/icons/token.webp`} alt="drop" />
          <h2 className={styles.selectBoxTitle}>Stake Your NFTs</h2>
          <p className={styles.selectBoxDescription}>
            Stake your <b>FHM NFTs</b> on the <b>Geyser</b> and farm AVY tokens.{" "}
            
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
function _tokenId(arg0: string, _tokenId: any) {
  throw new Error("Function not implemented.");
}

