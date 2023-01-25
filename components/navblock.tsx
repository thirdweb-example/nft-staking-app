import { getLink } from "../helpers/getLink";
import styles from "../styles/Home.module.css";
import { useRouter } from "next/router";
import { getBoolOption } from "../helpers"


const menus = [
  {
    id: 'index',
    title: 'Home',
    link: 'index'
  },
  ...(
    getBoolOption( `EnabledDemoMind` , true ) ? [
      {
        id: 'mint',
        title: 'Mint NFT',
        link: 'mint'
      },
    ] : []
  ),
  {
    id: 'marketplace',
    title: 'Marketplace',
    link: 'marketplace'
  },
  {
    id: 'stake',
    title: 'Stake',
    link: 'stake'
  },
  {
    id: 'settings',
    title: 'Settings',
    link: 'settings',
    adminOnly: true
  }
]

const navBlock = (curPage, isAdmin = false) => {
  const router = useRouter()
  return (
    <>
      <nav className={`${styles.mainNav} headerNavMenu`}>
        {menus.map((menuItem) => {
          if (menuItem.adminOnly && !isAdmin) return null
          return (
            <a key={menuItem.id} className={(curPage === menuItem.id) ? `${styles.active} headerNavActive` : ``} href={getLink(menuItem.link)}>{menuItem.title}</a>
          )
        })}
      </nav>
      <div className={styles.mainNavSeperator}></div>
    </>
  )
}

export default navBlock