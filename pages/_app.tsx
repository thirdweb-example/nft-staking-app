import type { AppProps } from "next/app"
import Head from 'next/head'
import "../styles/globals.css"
import { getText } from "../helpers"

function MyApp({ Component, pageProps }: AppProps) {

  return (
    <div>
      <Head>
        <title>{getText(`NFTStake - Stake NFT - earn ERC20`, `App_Title`)}</title>
        <meta name="description" content={getText(`NFTStake - Stake NFT - earn ERC20`, `App_Description`)} />
        <meta name="keywords" content={getText(`NFT, Stake, ERC20, Blockchain`, `App_Keywords`)} />
      </Head>
      <Component {...pageProps} />
    </div>
  );
}

export default MyApp;
