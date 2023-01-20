import styles from "../../styles/Home.module.css"
import { useEffect, useState } from "react"
import toggleGroup from "../toggleGroup"



export default function NftAtSale(options) {
  const {
    nftAddress,
    chainId,
    openConfirmWindow,
    addNotify,
    getActiveChain,
    tokensAtSale,
  } = options

  const [ isOpened, setIsOpened ] = useState(false)
  const onToggleOpen = () => {
    setIsOpened(!isOpened)
  }

  return {
    render: () => {
      return (
      )
    }
  }
}