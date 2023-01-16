import { BigNumber, ethers } from "ethers"
import type { NextPage } from "next"
import { useEffect, useState } from "react"
import styles from "../styles/Home.module.css"

import { setupWeb3, switchOrAddChain, doConnectWithMetamask, isMetamaskConnected } from "../helpers/setupWeb3"
import { calcSendArgWithFee } from "../helpers/calcSendArgWithFee"
import navBlock from "../components/navBlock"
import logoBlock from "../components/logoBlock"
import { getLink } from "../helpers"
import { useRouter } from "next/router"
import useStorage from "../storage"

// Eth-testnet
/*
const chainId = 5;
const nftDropContractAddress = "0xefeffe4d50392998efe4cf46b6fbaa19a58a041a"
const tokenContractAddress = "0xaFF4481D10270F50f203E0763e2597776068CBc5"
const stakingContractAddress = "0x8b740b4ad15e2201f291cbfc487977b0ecb5fc84"
*/
// Bnb-testnet
/*
const chainId = 97;
const nftDropContractAddress = "0x7682598A861336359740C08b3D1C5981F9473979"
const tokenContractAddress = "0x703f112bda4cc6cb9c5fb4b2e6140f6d8374f10b"
const stakingContractAddress = "0xAcf15259F8B99094b7051679a9e60B2F270558ce"
*/

import MyNFTAbi from '../contracts/MyNFTAbi.json'

import { Interface as AbiInterface } from '@ethersproject/abi'

const MyNFT_INTERFACE = new AbiInterface(MyNFTAbi)

const debugLog = (msg) => { console.log(msg) }

const Mint: NextPage = (props) => {
  const {
    storageData,
    isOwner,
    addNotify,
    getText,
  } = props

  const mintUris = [
    'https://github.com/shendel/crypto-casino/raw/master/public/images/games/slots/symbols/apple.png',
    'https://github.com/shendel/crypto-casino/raw/master/public/images/games/slots/symbols/bar.png',
    'https://github.com/shendel/crypto-casino/raw/master/public/images/games/slots/symbols/bell.png',
    'https://github.com/shendel/crypto-casino/raw/master/public/images/games/slots/symbols/cherry.png',
    'https://github.com/shendel/crypto-casino/raw/master/public/images/games/slots/symbols/lemon.png',
    'https://github.com/shendel/crypto-casino/raw/master/public/images/games/slots/symbols/orange.png',
    'https://github.com/shendel/crypto-casino/raw/master/public/images/games/slots/symbols/plum.png',
    'https://github.com/shendel/crypto-casino/raw/master/public/images/games/slots/symbols/seven.png',
    'https://github.com/shendel/crypto-casino/raw/master/public/images/games/slots/symbols/water-melon.png',
  ]

  const [ chainId, setChainId ] = useState(storageData?.chainId)
  const [ nftDropContractAddress, setNftDropContractAddress ] = useState(storageData?.nftCollection)

  const [activeChainId, setActiveChainId] = useState(false)
  const [activeWeb3, setActiveWeb3] = useState(false)
  const [address, setAddress] = useState(false)

  const [nftContract, setNftContract] = useState(false)

  const [isWalletConecting, setIsWalletConnecting] = useState(false)
  const [isMinting, setIsMinting] = useState(false)
  const [isMinted, setIsMinted] = useState(false)


  const processError = (error, error_namespace) => {
    let metamaskError = false
    try {
      metamaskError = error.message.replace(`Internal JSON-RPC error.`,``)
      metamaskError = JSON.parse(metamaskError)
    } catch (e) {}
    const errMsg = (metamaskError && metamaskError.message) ? metamaskError.message : error.message
    
    switch (errMsg) {
      case `execution reverted: You don't own this token!`:
        console.log(`You dont own this token`)
        break;
      case `MetaMask Tx Signature: User denied transaction signature.`:
        console.log('Transaction denied')
        break;
      case `execution reverted: ERC721: invalid token ID`:
        console.log('Invalid token ID')
        break;
      default:
        console.log('Unkrnown error', error.message)
        break;
    }
  }

  const initOnWeb3Ready = async () => {
    if (activeWeb3 && (`${activeChainId}` == `${chainId}`)) {
      activeWeb3.eth.getAccounts().then((accounts) => {
        setAddress(accounts[0])
        const _myNftContract = new activeWeb3.eth.Contract(MyNFTAbi, nftDropContractAddress)
        setNftContract(_myNftContract)
      }).catch((err) => {
        console.log('>>> initOnWeb3Ready', err)
        processError(err)
      })
    } else {
      const _isConnected = await isMetamaskConnected()
      if (_isConnected) {
        connectWithMetamask()
      }
    }
  }

  useEffect(() => {
    if (storageData
      && storageData.chainId
      && storageData.nftCollection
    ) {
      setChainId(storageData.chainId)
      setNftDropContractAddress(storageData.nftCollection)
    }
  }, [storageData])

  useEffect(() => {
    debugLog('on useEffect activeWeb3 initOnWeb3Ready')
    if (chainId && nftDropContractAddress) {
      initOnWeb3Ready()
    }
  }, [activeWeb3, chainId, nftDropContractAddress])


  const connectWithMetamask = async () => {
    doConnectWithMetamask({
      onBeforeConnect: () => { setIsWalletConnecting(true) },
      onSetActiveChain: setActiveChainId,
      onConnected: (cId, web3) => {
        setActiveWeb3(web3)
        setIsWalletConnecting(false)
      },
      onError: (err) => {
        console.log(">>>> connectWithMetamask", err)
        processError(err)
        setIsWalletConnecting(false)
      },
      needChainId: chainId,
    })
  }

  const doMintNFT = async () => {
    if (address && nftContract) {
      setIsMinting(true)
      addNotify(`Confirm transaction for mint demo NFT`)
      try {
        const nftUri = mintUris[Math.floor(Math.random()*mintUris.length)]
        const mintTxData = await calcSendArgWithFee(address, nftContract, "claimNFT", [nftUri])
        nftContract.methods.claimNFT(nftUri).send(mintTxData).then(() => {
          setIsMinted(true)
          setIsMinting(false)
          addNotify(`Demo NFT minted! Now you can test stake farm.`, `success`)
        }).catch((e) => {
          addNotify(`Mint demo NFT transaction failed`, `error`)
          setIsMinting(false)
        })
      } catch (e) {
        addNotify(`Mint demo NFT transaction failed`, `error`)
        setIsMinting(false)
      }
    }
  }


  return (
    <div className={styles.container}>
      {navBlock(`mint`, isOwner)}
      {logoBlock()}
      <h1 className={styles.h1}>
        {getText(`MintPage_Title`, `Mint Demo NFTs for test`)}
      </h1>
      <hr className={`${styles.divider} ${styles.spacerTop}`} />

      {!address ? (
        <button disabled={isWalletConecting} className={styles.mainButton} onClick={connectWithMetamask}>
          {isWalletConecting ? `Connecting` : `Connect Wallet`}
        </button>
      ) : (
        <>
          {!isMinted ? (
            <button disabled={isMinting} className={styles.mainButton} onClick={doMintNFT}>
              {isMinting ? `Minting NFT...` : `Mint NFT`}
            </button>
          ) : (
            <>
              <h2>Demo NFT minted</h2>
              <a href={getLink('stake')} className={styles.mainButton}>
                Go to Stake NFT
              </a>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Mint;
