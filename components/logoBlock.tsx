import { useRouter } from "next/router";
import styles from "../styles/Home.module.css"
import { getAssets, getText, getLink } from "../helpers"

const logoBlock = () => {
  const router = useRouter()
  return (
    <>
      <div className={styles.mainLogo}>
        <a href={getLink(`index`)}>
          <img
            src={getAssets(`images/logo.png`, 'mainLogo')}
            alt={getText(`Stake NFT - earn ERC20`, `MainPage_Header`)}
          />
        </a>
      </div>
    </>
  )
}

export default logoBlock