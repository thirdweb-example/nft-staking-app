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
import fetchNftInfo from "../helpers/fetchNftInfo"
import callNftMethod from "../helpers/callNftMethod"
import crypto from "crypto"
import nftToken from "../components/nftToken"
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

import NftAirdropContractData from "../contracts/source/artifacts/StakeNFT.json"
import MyNFTAbi from '../contracts/MyNFTAbi.json'
import { CHAIN_INFO } from "../helpers/constants"
import { toWei, fromWei } from "../helpers/wei"


const debugLog = (msg) => { console.log(msg) }

const Mint: NextPage = (props) => {
  const {
    storageData,
    isOwner,
    addNotify,
    getText,
    getDesign,
    storageMenu,
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

  const [ nftInfo, setNftInfo ] = useState({})
  const [ nftInfoFetched, setNftInfoFetched ] = useState(false)

  const [activeChainId, setActiveChainId] = useState(false)
  const [activeWeb3, setActiveWeb3] = useState(false)
  const [address, setAddress] = useState(false)

  const [nftContract, setNftContract] = useState(false)
  const [airdropContract, setAirdropContract] = useState(false)

  const [isWalletConecting, setIsWalletConnecting] = useState(false)
  const [isMinting, setIsMinting] = useState(false)
  const [isMinted, setIsMinted] = useState(false)
  const [mintedNFT, setMintedNft] = useState({})

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
        const _airdropContract = new activeWeb3.eth.Contract(NftAirdropContractData.abi, nftDropContractAddress)
        setAirdropContract(_airdropContract)
        fetchNftInfo(nftDropContractAddress, chainId).then((_nftInfo) => {
          console.log('>>> nft info fetched', _nftInfo)
          setNftInfo(_nftInfo)
          setNftInfoFetched(true)
        }).catch((err) => {
          console.log('>>> fail fetch nft info', err)
        })
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

  const doMintPayable = async () => {
    if (address && airdropContract) {
      setIsMinting(true)
      addNotify(`Confirm transaction for mint NFT`)
      const seed = crypto.randomBytes(32).toString('hex')
      console.log(nftInfo)
      callNftMethod({
        activeWeb3,
        contractAddress: nftDropContractAddress,
        method: 'mintRandom',
        weiAmount: nftInfo.NFTStakeInfo.mintPrice,
        args: [
          `0x${seed}`
        ],
        onTrx: (txHash) => {
          console.log('>> onTrx', txHash)
          addNotify(`NFT mint TX ${txHash}`, `success`)
        },
        onSuccess: (receipt) => {
          console.log('>> onSuccess', receipt)
          addNotify(`NFT mint transaction broadcasted`, `success`)
        },
        onError: (err) => {
          console.log('>> onError', err)
          addNotify(`Fail mint NFT. ${err.message ? err.message : ''}`, `error`)
        },
        onFinally: (answer) => {
          console.log('>> onFinally', answer)
          if (
            answer?.events?.Mint?.returnValues?.tokenUri
            && answer?.events?.Mint?.returnValues?.tokenId
          ) {
            const {
              tokenId,
              tokenUri,
            } = answer.events.Mint.returnValues

            setMintedNft({
              tokenId,
              tokenUri,
            })

            addNotify(`NFT #${tokenId} minted!`, `success`)
          }
          setIsMinting(false)
          setIsMinted(true)
        }
      })
    }
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

  const mintChainInfo = CHAIN_INFO(chainId)
  return (
    <div className={styles.container}>
      {navBlock(`mintown`)}
      {logoBlock({
        getText,
        getDesign
      })}
      <h1 className={`${styles.h1} pageTitle`}>
        {getText(`MintPage_Title`, `Mint Demo NFTs for test`)}
      </h1>
      <hr className={`${styles.divider} ${styles.spacerTop}`} />

      {!address ? (
        <>
          <div className="mintBeforeConnectWallet">
            {getText('StakePage_BeforeConnect_Text')}
          </div>
          <button disabled={isWalletConecting} className={`${styles.mainButton} primaryButton`} onClick={connectWithMetamask}>
            {isWalletConecting ? `Connecting` : `Connect Wallet`}
          </button>
          <div className="mintAfterConnectWallet">
            {getText('StakePage_AfterConnect_Text')}
          </div>
        </>
      ) : (
        <>
          {nftInfoFetched ? (
            <>
              {nftInfo.isNFTStakeToken ? (
                <>
                  <h2 className="mintPageSubTitle">{getText(`MintPage_Managed_Title`, `Mint NFT`)}</h2>
                  <div className="mintPageTextBeforePrice">
                    {getText('MintPage_TextBeforePrice')}
                  </div>
                  <div className={`${styles.mintPageDesc} mintPagePrice`}>
                    {getText(
                      `MintPage_Managed_PriceInfo`,
                      `Mint price is %amount% %currency%`,
                      {
                        amount: fromWei(nftInfo.NFTStakeInfo.mintPrice, mintChainInfo.nativeCurrency.decimals),
                        currency: mintChainInfo.nativeCurrency.symbol,
                      }
                    )}
                  </div>
                  <div className="mintPageTextAfterPrice">
                    {getText('MintPage_TextAfterPrice')}
                  </div>
                  <div className={styles.mintPageMintedHolder}>
                    <button disabled={isMinting} className={`${styles.mainButton} primaryButton`} onClick={doMintPayable}>
                      {isMinting
                        ? `Minting NFT...`
                        : (isMinted)
                          ? `Mint some one`
                          : `Mint NFT`
                      }
                    </button>
                  </div>
                  {mintedNFT && mintedNFT.tokenId && mintedNFT.tokenUri && (
                    <>
                      {nftToken({
                        ...mintedNFT,
                        isMinted: true,
                      })}
                    </>
                  )}
                </>
              ) : (
                <>
                  {!isMinted ? (
                    <button disabled={isMinting} className={`${styles.mainButton} primaryButton`} onClick={doMintNFT}>
                      {isMinting ? `Minting NFT...` : `Mint NFT`}
                    </button>
                  ) : (
                    <>
                      <h2>Demo NFT minted</h2>
                      <a href={getLink('stake')} className={`${styles.mainButton} primaryButton`}>
                        Go to Stake NFT
                      </a>
                    </>
                  )}
                </>
              )}
            </>
          ) : (
            <div>{getText(`MinPage_Loading`, `Loading...`)}</div>
          )}
        </>
      )}
    </div>
  );
};

export default Mint;
