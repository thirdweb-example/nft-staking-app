import { getLink } from "../helpers/getLink";
import { defMenus, sysMenus } from "../appconfig/menu"
import styles from "../styles/Home.module.css";
import useStorage from "../storage/"
import { useRouter } from "next/router";
import { getBoolOption } from "../helpers"

const navBlock = (curPage) => {
  const router = useRouter()
  const {
    storageMenu,
    isOwner,
    isInstalled,
    storageIsLoading
  } = useStorage()
  const menuItems = (storageMenu && storageMenu.length ? storageMenu : defMenus)

  if (storageIsLoading) return null
  return (
    <>
      <nav className={`${styles.mainNav} headerNavMenu`}>
        {menuItems.map((menuItem, itemKey) => {
          const active = (menuItem.target !== `` && curPage == sysMenus[menuItem.target])
          const href = (menuItem.target !== ``) ? getLink(sysMenus[menuItem.target]) : menuItem.link
          
          return (
            <a 
              key={itemKey}
              className={(active) ? `${styles.active} headerNavActive` : ``}
              href={href}
              {...(menuItem.blank ? { target: '_blank' } : {})}
            >
              {menuItem.title}
            </a>
          )
        })}
        {(isOwner || !isInstalled) && (
          <a 
            href={getLink(`settings`)}
            className={(curPage == `settings`) ? `${styles.active} headerNavActive` : ``}
          >
            Settings
          </a>
        )}
      </nav>
      <div className={styles.mainNavSeperator}></div>
    </>
  )
}

export default navBlock