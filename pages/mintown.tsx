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

import { FileUploader } from "react-drag-drop-files"
import { infuraUpload as IpfsUpload } from "../helpers/ipfs/infuraUpload"


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


  
  
  
  const mintChainInfo = CHAIN_INFO(chainId)

  const nftAllowedTypes = [ "JPEG", "JPG", "PNG", "GIF" ]
  const [ nftImage, setNftImage ] = useState(null)
  const [ nftImageData, setNftImageData ] = useState(null)
  const [ nftImageDataBuffer, setNftImageDataBuffer ] = useState(null)

  const [ nftName, setNftName ] = useState(``)
  const [ nftDesc, setNftDesc ] = useState(``)
  

  const handleChangeNFTImage = (file) => {
    setNftImage(file);
  }
  
  useEffect(() => {
    let fileReader, isCancel = false
    let fileReaderBuffer, isCancelBuffer = false
    if (nftImage) {
      fileReader = new FileReader()
      fileReader.onload = (e) => {
        const { result } = e.target
        if (result && !isCancel) {
          console.log('>>> nft image', result)
          setNftImageData(result)
        }
      }
      fileReader.readAsDataURL(nftImage)
      
      fileReaderBuffer = new FileReader()
      fileReaderBuffer.onload = (e) => {
        const { result } = e.target
        if (result && !isCancelBuffer) {
          console.log('>>> nft image buffer', result)
          setNftImageDataBuffer(result)
        }
      }
      fileReaderBuffer.readAsArrayBuffer(nftImage)
    }
    return () => {
      isCancel = true
      if (fileReader && fileReader.readyState === 1) {
        fileReader.abort()
      }
      isCancelBuffer = true
      if (fileReaderBuffer && fileReaderBuffer.readyState === 1) {
        fileReaderBuffer.abort()
      }
    }

  }, [nftImage])

  const [ isMinting, setIsMinting ] = useState(false)

  const [ isImageUpload, setIsImageUpload ] = useState(false)
  const [ isImageUploaded, setIsImageUploaded ] = useState(false)
  const [ isImageUploadError, setIsImageUploadError ] = useState(false)
  const [ imageUploadedCID, setImageUploadedCID ] = useState(false)
  
  const [ isJsonUpload, setIsJsonUpload ] = useState(false)
  const [ isJsonUploaded, setIsJsonUploaded ] = useState(false)
  const [ isJsonUploadError, setIsJsonUploadError ] = useState(false)
  const [ jsonUploadedCID, setJsonUploadedCID ] = useState(false)

  const doMintNFT = () => {
    console.log('>>. do mint')
    setIsMinting(true)
    
    setIsImageUpload(true)
    setIsImageUploadError(false)
    setIsImageUploaded(false)
    
    setIsJsonUpload(false)
    setIsJsonUploaded(false)
    setIsJsonUploadError(false)
    
    IpfsUpload(nftImageDataBuffer).then((imageCid) => {
      console.log('>>> cid', imageCid)
      setImageUploadedCID(imageCid)
      const json = {
        name: nftName,
        description: nftDesc,
        image: `ipfs://${imageCid}`,
      }
      setIsImageUpload(false)
      setIsImageUploaded(true)
      setIsJsonUpload(true)
      IpfsUpload(JSON.stringify(json)).then((jsonCID) => {
        setIsJsonUpload(false)
        setIsImageUploaded(true)
        setJsonUploadedCID(jsonCID)
        console.log('>>> json CID', jsonCID)
      }).catch((err) => {
        console.log('err', err)
        setIsJsonUpload(false)
        setIsJsonUploadError(true)
        setIsMinting(false)
      })
    }).catch((err) => {
      console.log('>>> err', err)
      setIsImageUploadError(true)
      setIsImageUpload(false)
      setIsMinting(false)
    })
  }
  
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
                  <style jsx>
                  {`
                    .mintOwnForm {
                    }
                  `}
                  </style>
                  <div className="mintOwnForm">
                    <div>
                      <FileUploader
                        multiple={false}
                        handleChange={handleChangeNFTImage}
                        types={nftAllowedTypes}
                      />
                      {nftImageData && (
                        <div>
                          <img src={nftImageData} />
                        </div>
                      )}
                    </div>
                    <div>
                      <label>Name:</label>
                      <input type="text" value={nftName} onChange={(e) => { setNftName(e.target.value) }} />
                    </div>
                    <div>
                      <label>Description:</label>
                      <textarea value={nftDesc} onChange={(e) => { setNftDesc(e.target.value) } } />
                    </div>
                    <div>
                      <button onClick={doMintNFT}>Mint NFT</button>
                    </div>
                  </div>
                  {/*
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
                  */}
                </>
              ) : (
                <>
                  {/*
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
                  */}
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
