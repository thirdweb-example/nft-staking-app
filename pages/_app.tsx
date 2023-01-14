import type { AppProps } from "next/app"
import Head from 'next/head'
import "../styles/globals.css"
import styles from "../styles/Home.module.css"
import { getText, getLink } from "../helpers"
import useStorage from "../storage/"
import { useRouter } from "next/router"

function MyApp({ Component, pageProps }: AppProps) {
  const { storageData, storageIsLoading } = useStorage()
  const router = useRouter()

  const settingsUrl = (process.env.NODE_ENV && process.env.NODE_ENV !== 'production') ? '/settings' : '/settings.html'

  const isSettingsPage = (router.asPath === settingsUrl)

  return (
    <div>
      <Head>
        <title>{getText(`NFTStake - Stake NFT - earn ERC20`, `App_Title`)}</title>
        <meta name="description" content={getText(`NFTStake - Stake NFT - earn ERC20`, `App_Description`)} />
        <meta name="keywords" content={getText(`NFT, Stake, ERC20, Blockchain`, `App_Keywords`)} />
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
            <Component {...pageProps} />
          )}
        </>
      )}
      <footer className={styles.mainFooter} >
        Powered by OnOut - <a href="https://onout.org/nftstake/" target="_blank">no-code tool to create NFTStake</a>
      </footer>
    </div>
  );
}

export default MyApp;
