import styles from "../styles/Home.module.css"
import { useEffect, useState } from "react"



export default function FormTabs(options) {
  const {
    tabs,
    activeTab
  } = options
  
  const [ currentTab, setCurrentTab] = useState(activeTab)
  const setActiveTab = (tabId) => {
    setCurrentTab(tabId)
  }

  return {
    render: () => {
      return (
        <div className={styles.formTabs}>
          <nav>
            {tabs.map((tabInfo) => {
              const { key } = tabInfo
              return (
                <a key={key}
                  className={key == currentTab ? styles.formTabsActive : ''}
                  onClick={() => setActiveTab(key)}
                >
                  {tabInfo.title}
                </a>
              )
            })}
          </nav>
          {tabs.map((tabInfo) => {
            const { key, content } = tabInfo
            return (
              <div key={key} className={key == currentTab ? styles.formTabsActive : ''}>
                {content}
              </div>
            )
          })}
        </div>
      )
    }
  }
}