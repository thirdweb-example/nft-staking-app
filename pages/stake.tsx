import {
  ThirdwebNftMedia,
  useAddress,
  useContract,
  useDisconnect,
  useMetamask,
  useNFTDrop,
  useToken,
  useTokenBalance,
  useOwnedNFTs,
  useSigner,
} from "@thirdweb-dev/react";
import { NFTMetadataOwner, ThirdwebSDK } from "@thirdweb-dev/sdk";
import { BigNumber, ethers } from "ethers";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styles from "../styles/Home.module.css";

const Stake: NextPage = () => {
  const router = useRouter();
  const signer = useSigner();

  // Wallet Connection Hooks
  const address = useAddress();
  const connectWithMetamask = useMetamask();
  const disconnectWallet = useDisconnect();

  // Contract Hooks
  const nftDropContract = useNFTDrop(
    "0x322067594DBCE69A9a9711BC393440aA5e3Aaca1"
  );
  const tokenContract = useToken("0xb1cF059e6847e4270920a02e969CA2E016AeA22B");
  const { data: stakingContract } = useContract(
    "0x60e43fe4fC2f9B2C6E883BBf991979E225866370"
  );

  // Load Unstaked NFTs
  const { data: ownedNfts } = useOwnedNFTs(nftDropContract, address);

  // Load Balance of Token
  const { data: tokenBalance } = useTokenBalance(tokenContract, address);

  ///////////////////////////////////////////////////////////////////////////
  // Custom contract functions
  ///////////////////////////////////////////////////////////////////////////
  const [stakedNfts, setStakedNfts] = useState<any[]>([]);
  const [claimableRewards, setClaimableRewards] = useState<BigNumber>();

  useEffect(() => {
    async function loadStakedNfts() {
      const sdk = new ThirdwebSDK("mumbai");
      const contract = await sdk.getContract(
        "0x60e43fe4fC2f9B2C6E883BBf991979E225866370"
      );
      const stakedTokens = await contract?.functions?.getStakedTokens(address);

      // For each staked token, fetch it from the sdk
      const stakedNfts = await Promise.all(
        stakedTokens.map(async (tokenId) => {
          const nft = await nftDropContract?.get(tokenId);
          return nft;
        })
      );
      setStakedNfts(stakedNfts);
      console.log("setStakedNfts", stakedNfts);
    }

    async function loadClaimableRewards() {
      const sdk = new ThirdwebSDK("mumbai");
      const contract = await sdk.getContract(
        "0x60e43fe4fC2f9B2C6E883BBf991979E225866370"
      );
      try {
        const claimableRewards = await contract?.functions?.userStakeInfo(
          address
        );
        console.log("Loaded claimable rewards", claimableRewards);
        setClaimableRewards(claimableRewards._availableRewards);
      } catch (e) {
        setClaimableRewards(BigNumber.from(0));
      }
      console.log(claimableRewards);
    }

    if (stakingContract) {
      loadStakedNfts();
      loadClaimableRewards();
    }
  }, [address, stakingContract]);

  ///////////////////////////////////////////////////////////////////////////
  // Write Functions
  ///////////////////////////////////////////////////////////////////////////
  async function stakeNft(id: BigNumber) {
    const sdk = new ThirdwebSDK(signer);
    const contract = await sdk.getContract(
      "0x60e43fe4fC2f9B2C6E883BBf991979E225866370"
    );

    const isApproved = await nftDropContract?.isApproved(
      address,
      "0x60e43fe4fC2f9B2C6E883BBf991979E225866370"
    );
    // If not approved, request approval
    if (!isApproved) {
      await nftDropContract?.setApprovalForAll(
        "0x60e43fe4fC2f9B2C6E883BBf991979E225866370",
        true
      );
    }
    const stake = await contract.functions.stake(id);
  }

  async function withdraw(id: BigNumber) {
    const sdk = new ThirdwebSDK(signer);
    const contract = await sdk.getContract(
      "0x60e43fe4fC2f9B2C6E883BBf991979E225866370"
    );
    const withdraw = await contract.functions.withdraw(id);
  }

  async function claimRewards() {
    const sdk = new ThirdwebSDK(signer);
    const contract = await sdk.getContract(
      "0x60e43fe4fC2f9B2C6E883BBf991979E225866370"
    );
    const claim = await contract.functions.claimRewards();
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.h1}>Stake Your NFTs</h1>

      <hr className={`${styles.divider} ${styles.spacerTop}`} />

      {!address ? (
        <button className={styles.mainButton} onClick={connectWithMetamask}>
          Connect Wallet
        </button>
      ) : (
        <>
          <h2>Your Tokens</h2>

          <div className={styles.tokenGrid}>
            <div className={styles.tokenItem}>
              <h3 className={styles.tokenLabel}>Claimable Rewards</h3>
              <p className={styles.tokenValue}>
                <b>
                  {!claimableRewards
                    ? "Loading..."
                    : ethers.utils.formatUnits(claimableRewards, 18)}
                </b>{" "}
                {tokenBalance?.symbol}
              </p>
            </div>
            <div className={styles.tokenItem}>
              <h3 className={styles.tokenLabel}>Current Balance</h3>
              <p className={styles.tokenValue}>
                <b>{tokenBalance?.displayValue}</b> {tokenBalance?.symbol}
              </p>
            </div>
          </div>

          <button
            className={`${styles.mainButton} ${styles.spacerTop}`}
            onClick={() => claimRewards()}
          >
            Claim Rewards
          </button>

          <hr className={`${styles.divider} ${styles.spacerTop}`} />

          <h2>Your Staked NFTs</h2>
          <div className={styles.nftBoxGrid}>
            {stakedNfts?.map((nft) => (
              <div className={styles.nftBox} key={nft.metadata.id.toString()}>
                <ThirdwebNftMedia
                  metadata={nft.metadata}
                  className={styles.nftMedia}
                />
                <h3>{nft.metadata.name}</h3>
                <button
                  className={`${styles.mainButton} ${styles.spacerBottom}`}
                  onClick={() => withdraw(nft.metadata.id)}
                >
                  Withdraw
                </button>
              </div>
            ))}
          </div>

          <hr className={`${styles.divider} ${styles.spacerTop}`} />

          <h2>Your Unstaked NFTs</h2>

          <div className={styles.nftBoxGrid}>
            {ownedNfts?.map((nft) => (
              <div className={styles.nftBox} key={nft.metadata.id.toString()}>
                <ThirdwebNftMedia
                  metadata={nft.metadata}
                  className={styles.nftMedia}
                />
                <h3>{nft.metadata.name}</h3>
                <button
                  className={`${styles.mainButton} ${styles.spacerBottom}`}
                  onClick={() => stakeNft(nft.metadata.id)}
                >
                  Stake
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Stake;
