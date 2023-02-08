import styles from "../../styles/Home.module.css"
import { useEffect, useState } from "react"
import { useStateUri, useStateString } from "../../helpers/useState"
import { defaultDesign } from "../../helpers/defaultDesign"
import { getUnixTimestamp } from "../../helpers/getUnixTimestamp"

import toggleGroup from "../toggleGroup"
import iconButton from "../iconButton"
import FaIcon from "../FaIcon"
import openInTab from "../openInTab"

import { sysMenus, defMenus } from "../../appconfig/menu"

import AdminPopupWindow from "../AdminPopupWindow"

const useStateColor = useStateUri

export default function TabMenu(options) {
  const {
    addNotify,
    openConfirmWindow,
    storageMenu,
    saveStorageConfig
  } = options

  
  const [ menuItems, setMenuItems ] = useState(storageMenu && storageMenu.length ? storageMenu : defMenus)

  const [ isEditAction, setIsEditAction ] = useState(false)
  const [ editMenuIndex, setEditMenuIndex ] = useState(0)
  const [ itemTitle, setItemTitle, itemTitleHasError, setItemTitleHasError ] = useStateString(``, { notEmpty: true } )
  const [ itemTarget, setItemTarget ] = useState('')
  const [ itemLink, setItemLink, itemLinkHasError, setItemLinkHasError ] = useStateString(``, { notEmpty: true } )
  const [ itemOpenInNewTab, setItemOpenInNewTab ] = useState(false)
  const [ isEditAddOpened, setIsEditAddOpened ] = useState(false)
  
  const onCancelAddEdit = () => {
    setIsEditAddOpened(false)
  }

  const openAddMenu = () => {
    setItemTitle(``)
    setItemTarget(``)
    setItemLink(``)
    setItemOpenInNewTab(false)
    setIsEditAction(false)
    setIsEditAddOpened(true)
  }

  const onRemoveItem = (itemIndex) => {
    openConfirmWindow({
      title: `Removing menu item`,
      message: `Remove this menu item?`,
      onConfirm: () => {
        addNotify(`Menu item removed`, `success`)
        setMenuItems((prev) => {
          prev.splice(itemIndex, 1)
          return [...prev]
        })
      }
    })
  }
  const onMoveItemUp = (itemIndex) => {
    if (itemIndex > 0) {
      setMenuItems((prev) => {
        const upItem = prev[itemIndex - 1]
        prev[itemIndex - 1] = prev[itemIndex]
        prev[itemIndex] = upItem
        return [...prev]
      })
    }
  }
  const onMoveItemDown = (itemIndex) => {
    if (itemIndex < menuItems.length - 1) {
      setMenuItems((prev) => {
        const dwItem = prev[itemIndex + 1]
        prev[itemIndex + 1] = prev[itemIndex]
        prev[itemIndex] = dwItem
        return [...prev]
      })
    }
  }
  const onAddEditDo = () => {
    if (itemTitleHasError) return addNotify(`Title is required`, `error`)
    if (itemTarget == `` && itemLinkHasError) return addNotify(`Href is required`, `error`)
    const itemData = {
      title: itemTitle,
      target: itemTarget,
      link: itemLink,
      blank: itemOpenInNewTab
    }
    if (isEditAction) {
      setIsEditAddOpened(false)
      addNotify(`Menu item changed`, `success`)
      setMenuItems((prev) => {
        prev[editMenuIndex] = itemData
        return [
          ...prev
        ]
      })
    } else {
      setIsEditAddOpened(false)
      addNotify(`New menu item added`, `success`)
      setMenuItems((prev) => {
        return [
          ...prev,
          itemData
        ]
      })
    }
  }
  
  const onEditItem = (itemIndex) => {
    const {
      title,
      target,
      link,
      blank
    } = menuItems[itemIndex]
    setEditMenuIndex(itemIndex)
    setItemTitle(title)
    setItemTarget(target)
    setItemLink(link)
    setItemOpenInNewTab(blank)
    setIsEditAction(true)
    setIsEditAddOpened(true)
  }

  const [ isSaveMenus, setIsSaveMenus ] = useState(false)
  const doSaveMenus = () => {
    openConfirmWindow({
      title: `Save menu items`,
      message: `Save changes to storage config?`,
      onConfirm: () => {
        setIsSaveMenus(true)
        saveStorageConfig({
          onBegin: () => {
            addNotify(`Confirm transaction for save changed menu items`)
          },
          onReady: () => {
            addNotify(`Menu items successfull saved`, `success`)
            setIsSaveMenus(false)
          },
          onError: (err) => {
            addNotify(`Fail save menu items`, `error`)
            setIsSaveMenus(false)
          },
          newData: {
            menu: menuItems,
          }
        })
      }
    })
  }
  return {
    render: () => {
      return (
        <>
          <div className="tab-menu-items">
            <style jsx>
            {`
              .tab-menu-items {
                width: 100%;
                display: flex;
                justify-content: center;
              }
              .tab-menu-items TABLE {
                width: 100%;
                border: 1px solid #FFF;
                margin-bottom: 10px;
                border-spacing: 0px;
                border-right: 0px;
                border-bottom: 0px;
              }
              .tab-menu-items TABLE THEAD TR {
                background: #0b469f;
              }
              .tab-menu-items TABLE TD {
                padding: 4px;
                border-bottom: 1px solid #FFF;
                border-right: 1px solid #FFF;
              }
              .tab-menu-items TABLE TBODY TD {
                text-align: left;
              }
              .tab-menu-items TABLE TBODY TR {
                border-bottom: 1px solid red;
              }
              .tab-menu-items TABLE TBODY TR.is-edit {
                vertical-align: top;
              }
              .tab-menu-items TR.is-edit SELECT,
              .tab-menu-items TR.is-edit INPUT[type="text"] {
                display: block;
                width: 100%;
              }
              .tab-menu-items TR.is-edit LABEL {
                display: block;
              }
              .tab-menu-items TD.options {
                white-space: nowrap;
              }
              .tab-menu-items TD {
                width: 100%;
              }
              .tab-menu-items TD:first-child {
                width: 30%;
              }
              .tab-menu-items TABLE TBODY TD.empty {
                text-align: center;
                font-weight: bold;
              }
            `}
            </style>
            <div className={styles.adminForm}>
              <table>
                <thead>
                  <tr>
                    <td>Title</td>
                    <td>Link</td>
                    <td>Options</td>
                  </tr>
                </thead>
                <tbody>
                  {menuItems.length > 0 ? (
                    menuItems.map((itemData, itemKey) => {
                      const {
                        title,
                        target,
                        link,
                        blank
                      } = itemData
                      return (
                        <tr key={itemKey}>
                          <td>
                            <b>{title}</b>
                          </td>
                          <td>
                            <b>
                              {target == `` ? (
                                <>
                                  {blank && (<>[NEW TAB]&nbsp;</>)}
                                  {link}
                                  {openInTab(link,link)}
                                </>
                              ) : (
                                <>{`[${target} PAGE]`}</>
                              )}
                            </b>
                          </td>
                          <td className="options">
                            {iconButton({
                              title: `Move item up`,
                              icon: `arrow-up`,
                              onClick: () => { onMoveItemUp(itemKey) }
                            })}
                            {iconButton({
                              title: `Move item down`,
                              icon: `arrow-down`,
                              onClick: () => { onMoveItemDown(itemKey) }
                            })}
                            {iconButton({
                              title: `Edit menu item`,
                              icon: `edit`,
                              onClick: () => { onEditItem(itemKey) }
                            })}
                            {iconButton({
                              title: `Remove menu item`,
                              icon: `trash`,
                              onClick: () => { onRemoveItem(itemKey) }
                            })}
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan="3" className="empty">
                        No menu items
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <div className={styles.actionsRow}>
                <a className={styles.buttonWithIcon} onClick={openAddMenu}>
                  <FaIcon icon="add" />
                  Add new menu item
                </a>
              </div>
            </div>
            <AdminPopupWindow title={(isEditAction) ? `Edit menu item` : `Add new menu item`} isOpened={isEditAddOpened}>
              <div className={styles.adminForm}>
                <div className={styles.subFormInfo}>
                  <div className={styles.infoRow}>
                    <label>Title:</label>
                    <div>
                      {itemTitleHasError && (
                        <div><b className={styles.hasError}>The field is required</b></div>
                      )}
                      <div>
                        <input value={itemTitle} onChange={(e) => { setItemTitle(e) }} type="text" />
                      </div>
                    </div>
                  </div>
                  <div className={styles.infoRow}>
                    <label>Target:</label>
                    <div>
                      <select value={itemTarget} onChange={(e) => { setItemTarget(e.target.value) }}>
                        {Object.keys(sysMenus).map((targetKey) => {
                          return (
                            <option value={targetKey} key={targetKey}>{`[${targetKey} PAGE]`}</option>
                          )
                        })}
                        <option value={``}>Custom link</option>
                      </select>
                    </div>
                  </div>
                  {itemTarget == `` && (
                    <>
                      <div className={styles.infoRow}>
                        <label>Href (URL):</label>
                        <div>
                          {itemLinkHasError && (
                            <div><b className={styles.hasError}>The field is required</b></div>
                          )}
                          <div>
                            <input type="text" value={itemLink} onChange={(e) => { setItemLink(e) }} />
                          </div>
                        </div>
                      </div>
                      <div className={styles.infoRow}>
                        <label></label>
                        <div>
                          <div>
                            <label>
                              <input type="checkbox" checked={itemOpenInNewTab} onChange={(e) => { setItemOpenInNewTab(!itemOpenInNewTab) }} />
                              <span>Open in new tab</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                  <div className={styles.actionsRow}>
                    <button onClick={onAddEditDo}>{isEditAction ? `Edit` : `Add`}</button>
                    <button onClick={onCancelAddEdit}>Cancel</button>
                  </div>
                </div>
              </div>
            </AdminPopupWindow>
          </div>
          <div className={styles.adminFormBottom}>
            <button disabled={isSaveMenus} className={`${styles.mainButton} primaryButton`} onClick={doSaveMenus} >
              {isSaveMenus ? `Saving changes...` : `Save changes`}
            </button>
          </div>
        </>
      )
    }
  }
}