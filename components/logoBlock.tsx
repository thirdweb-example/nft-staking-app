import { useRouter } from "next/router";
import styles from "../styles/Home.module.css"
import { getAssets, getLink } from "../helpers"

const logoBlock = (options) => {
  const router = useRouter()
  const {
    getDesign,
    getText,
  } = options

  return (
    <>
      <div className={`${styles.mainLogo} logoAddParams`}>
        <a href={getLink(`index`)}>
          <img
            src={getDesign('logoUri', `uri`, getAssets(`images/logo.png`, 'mainLogo'))}
            alt={getText(`Stake NFT - earn ERC20`, `MainPage_Header`)}
          />
        </a>
      </div>
    </>
  )
}

export default logoBlock