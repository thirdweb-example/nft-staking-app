import {
  ThirdwebNftMedia,
  useContract,
  useNFT,
} from "@thirdweb-dev/react";
import type { FC } from "react";
import {
  nftDropContractAddress,
} from "../consts/contractAddresses";
import styles from "../styles/Home.module.css";

interface NFTCardProps {
  tokenId: number;
}

const NFTCard: FC<NFTCardProps> = ({ tokenId }) => {
  const { contract } = useContract(nftDropContractAddress, "nft-drop");
  const { data: nft } = useNFT(contract, tokenId);

  return (
    <>
      {nft && (
        <div>
          {nft.metadata && (
            <ThirdwebNftMedia
              metadata={nft.metadata}
              className={styles.nftMedia}
            />
          )}
          <h3>{nft.metadata.name}</h3>
        </div>
      )}
    </>
  );
};
export default NFTCard;
