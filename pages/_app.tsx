import type { AppProps } from "next/app"
import Head from 'next/head'
import "../styles/globals.css"
import styles from "../styles/Home.module.css"
import { getStorageText, getLink } from "../helpers"
import useStorage from "../storage/"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import update from 'immutability-helper';

import { getUnixTimestamp } from "../helpers/getUnixTimestamp"

import NotifyHolder from "../components/NotifyHolder"


let confirmWindowOnConfirm = () => {}
let confirmWindowOnCancel = () => {}
const defaultConfirmWindowLabels = {
  title: `Message`,
  message: `Confirm`,
  ok: `Ok`,
  cancel: `Cancel`,
} 

function MyApp({ Component, pageProps }: AppProps) {
  const {
    storageData,
    storageIsLoading,
    isOwner,
    setDoReloadStorage,
    storageTexts,
  } = useStorage()
  const router = useRouter()

  const settingsUrl = (process.env.NODE_ENV && process.env.NODE_ENV !== 'production') ? 'settings' : 'settings.html'
  const routerBaseName = router.asPath.split('/').reverse()[0];

  const isSettingsPage = (routerBaseName === settingsUrl)

  /* Confirm window */
  const [ isConfirmWindowOpened, setIsConfirmWindowOpened ] = useState(false)
  const [ confirmWindowLabels, setConfirmWindowLabels ] = useState(defaultConfirmWindowLabels)


  const onConfirmWindowConfirm = () => {
    confirmWindowOnConfirm()
    setIsConfirmWindowOpened(false)
  }
  const onConfirmWindowCancel = () => {
    confirmWindowOnCancel()
    setIsConfirmWindowOpened(false)
  }
  const openConfirmWindow = (options = {}) => {
    const {
      onConfirm,
      onCancel,
    } = options

    console.log(options)
    confirmWindowOnConfirm = (onConfirm) ? onConfirm : () => {}
    confirmWindowOnCancel = (onCancel) ? onCancel : () => {}
    setConfirmWindowLabels({
      title: options.title || defaultConfirmWindowLabels.title,
      message: options.message || defaultConfirmWindowLabels.message,
      ok: options.okLabel || defaultConfirmWindowLabels.ok,
      cancel: options.cancelLabel || defaultConfirmWindowLabels.cancel,
    })
    setIsConfirmWindowOpened(true)
  
  }
  /* -------------- */
  const notifyHolder = new NotifyHolder({})
  const addNotify = (msg, style = `info`) => {
    notifyHolder.addItem({
      msg,
      style,
      time: getUnixTimestamp(),
      utx: getUnixTimestamp(),
    })
  }

  const getText = getStorageText(storageTexts)
  return (
    <div>
      <Head>
        <title>{getText(`App_Title`, `NFTStake - Stake NFT - earn ERC20`)}</title>
        <meta name="description" content={getText(`App_Description`, `NFTStake - Stake NFT - earn ERC20`)} />
        <meta name="keywords" content={getText(`App_Keywords`, `NFT, Stake, ERC20, Blockchain`)} />
        <style global>
          {`
            .svg-inline--fa {
              display: var(inline-block);
              height: 1em;
              overflow: visible;
              vertical-align: -0.125em;
            }
            svg:not(:root).svg-inline--fa, svg:not(:host).svg-inline--fa {
              overflow: visible;
              box-sizing: content-box;
            }

            .someOwnClass {
              background: red;
            }
          `}
        </style>
      </Head>
      {(storageIsLoading || (storageData === null)) ? (
        <div className={styles.loadingHolder}>
          <span>Loading...</span>
        </div>
      ) : (
        <>
          {!storageIsLoading && storageData && !storageData.isInstalled && !isSettingsPage && (
            <div className={styles.container}>
              <h2>NFTStake need install on this domain</h2>
              <a href={getLink(`settings`)} className={`${styles.mainButton} ${styles.autoWidth}`}>
                Go to Install
              </a>
            </div>
          )}
          {storageData && !storageData.isBaseConfigReady && storageData.isInstalled && !isSettingsPage && (
            <div className={styles.container}>
              <h2>NFTStake need base setup</h2>
              <a href={getLink(`settings`)} className={`${styles.mainButton} ${styles.autoWidth}`}>
                Go to setup
              </a>
            </div>
          )}
          {((!storageIsLoading && storageData && storageData.isInstalled && storageData.isBaseConfigReady) || isSettingsPage) && (
            <Component
              {...pageProps }
              storageData={storageData}
              storageIsLoading={storageIsLoading}
              openConfirmWindow={openConfirmWindow}
              isOwner={isOwner}
              addNotify={addNotify}
              setDoReloadStorage={setDoReloadStorage}
              storageTexts={storageTexts}
              getText={getText}
            />
          )}
        </>
      )}
      {notifyHolder.render()}
      {/* ---- Confirm block ---- */}
      { isConfirmWindowOpened && (
        <div className={styles.confirmWindow}>
          <div>
            <h3>{confirmWindowLabels.title}</h3>
            <span>{confirmWindowLabels.message}</span>
            <div>
              <button className={styles.mainButton} onClick={onConfirmWindowConfirm}>
                {confirmWindowLabels.ok}
              </button>
              <button className={styles.mainButton} onClick={onConfirmWindowCancel}>
                {confirmWindowLabels.cancel}
              </button>
            </div>
          </div>
        </div>
      )}
      <footer className={styles.mainFooter} >
        {getText(`App_Footer`, `Powered by OnOut - [no-code tool to create NFTStake](https://onout.org/nftstake/)`)}
      </footer>
    </div>
  );
}

export default MyApp;
