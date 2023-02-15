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

import { FileUploader } from "../components/DragDropUpload"
import { infuraUpload as IpfsUpload } from "../helpers/ipfs/infuraUpload"


import NftAirdropContractData from "../contracts/source/artifacts/StakeNFT.json"
import MyNFTAbi from '../contracts/MyNFTAbi.json'
import { CHAIN_INFO } from "../helpers/constants"
import { toWei, fromWei } from "../helpers/wei"

import FaIcon from "../components/FaIcon"


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
          setNftImageData(result)
        }
      }
      fileReader.readAsDataURL(nftImage)
      
      fileReaderBuffer = new FileReader()
      fileReaderBuffer.onload = (e) => {
        const { result } = e.target
        if (result && !isCancelBuffer) {
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
  const [ isMinted, setIsMinted ] = useState(false)

  const [ isImageUpload, setIsImageUpload ] = useState(false)
  const [ isImageUploaded, setIsImageUploaded ] = useState(false)
  const [ isImageUploadError, setIsImageUploadError ] = useState(false)
  const [ imageUploadedCID, setImageUploadedCID ] = useState(false)
  
  const [ isJsonUpload, setIsJsonUpload ] = useState(false)
  const [ isJsonUploaded, setIsJsonUploaded ] = useState(false)
  const [ isJsonUploadError, setIsJsonUploadError ] = useState(false)
  const [ jsonUploadedCID, setJsonUploadedCID ] = useState(false)

  const [ mintTx, setMintTx ] = useState(false)
  const [ isMintShow, setIsMintShow ] = useState(false)
  
  const [ mintedNFT, setMintedNft ] = useState(false)
  
  const resetMintForm = () => {
    setIsMintShow(false)
    setIsImageUploaded(false)
    setIsJsonUploaded(false)
    setNftName(``)
    setNftDesc(``)
    setNftImage(null)
    setNftImageData(null)
    setNftImageDataBuffer(null)
  }
  const doMintNFT = () => {
    if (nftImageDataBuffer == null) return addNotify(`Select NFT image`, `error`)
    if (nftName == ``) return addNotify(`Enter NFT name`, `error`)
    if (nftDesc == ``) return addNotify(`Enter NFT description`, `error`)

    setIsMinting(false)
    setMintTx(false)
    
    setIsImageUpload(true)
    setIsImageUploadError(false)
    setIsImageUploaded(false)
    
    setIsJsonUpload(false)
    setIsJsonUploaded(false)
    setIsJsonUploadError(false)
    
    setIsMintShow(true)
    
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
        setIsJsonUploaded(true)
        setJsonUploadedCID(jsonCID)
        console.log('>>> json CID', jsonCID)
        setIsMinting(true)
        callNftMethod({
          activeWeb3,
          contractAddress: nftDropContractAddress,
          method: 'mint',
          weiAmount: nftInfo.NFTStakeInfo.mintOwnPrice,
          args: [
            address,
            `ipfs://${jsonCID}`
          ],
          onTrx: (txHash) => {
            console.log('>> onTrx', txHash)
            addNotify(`NFT mint TX ${txHash}`, `success`)
            setMintTx(txHash)
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

  // Image uploader costumize
  const [ isImageDrag, setIsImageDrag ] = useState(false)
  const handleDragImage = (isDragging) => {
    setIsImageDrag(isDragging)
    console.log('>>> is drag', isDragging)
  }
  return (
    <div className={styles.container}>
      {navBlock(`mintown`)}
      {logoBlock({
        getText,
        getDesign
      })}
      <h1 className={`${styles.h1} pageTitle`}>
        {getText(`MintOwnPage_Title`, `Mint NFTs`)}
      </h1>
      <hr className={`${styles.divider} ${styles.spacerTop}`} />

      {nftInfoFetched && (
        <h2>Mint price is {fromWei(nftInfo.NFTStakeInfo.mintOwnPrice, mintChainInfo.nativeCurrency.decimals)} {mintChainInfo.nativeCurrency.symbol} + Blockchain fee</h2>
      )}
      {!address ? (
        <>
          <div className="mintBeforeConnectWallet">
            {getText('MintPage_BeforeConnect_Text')}
          </div>
          <button disabled={isWalletConecting} className={`${styles.mainButton} primaryButton`} onClick={connectWithMetamask}>
            {isWalletConecting ? `Connecting` : `Connect Wallet`}
          </button>
          <div className="mintAfterConnectWallet">
            {getText('MintPage_AfterConnect_Text')}
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
                      max-width: 640px;
                      margin: 0 auto;
                      width: 100%;
                      position: relative;
                    }
                    .mintOwnForm .imageHolder {
                      display: block;
                      width: 100%;
                      padding: 10px;
                      border: 1px solid #000;
                      border-radius: 10px;
                      border-top: 0px;
                      border-top-left-radius: 0px;
                      border-top-right-radius: 0px;
                      margin-bottom: 10px;
                    }
                    .mintOwnForm .imageHolder IMG {
                      display: block;
                      width: 100%;
                    }
                    .mintOwnForm .imageUploader > LABEL {
                      display: block;
                      width: 100%;
                      outline: 1px solid red;
                    }
                    
                    .mintOwnForm .inputHolder {
                      display: block;
                      text-align: left;
                      margin-bottom: 10px;
                    }
                    .mintOwnForm .inputHolder LABEL {
                      display: block;
                      color: #000;
                    }
                    .mintOwnForm .inputHolder INPUT[type="text"],
                    .mintOwnForm .inputHolder TEXTAREA {
                      display: block;
                      width: 100%;
                      background: #FFF;
                      border: 1px solid #000;
                      border-radius: 5px;
                      color: #000;
                      height: 2.5em;
                      padding-left: 10px;
                      padding-right: 10px;
                    }
                    .mintOwnForm .inputHolder TEXTAREA {
                      height: 10em;
                    }
                    .mintOwnForm .mintProgress {
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      position: absolute;
                      top: 0px;
                      right: 0px;
                      bottom: 0px;
                      left: 0px;
                      background: #edeef0b0;
                      color: #346297;
                    }
                    .mintOwnForm .mintProgress>DIV {
                      width: 80%;
                      padding: 10px;
                      border: 1px solid #346297;
                      background: #edeef0;
                      box-shadow: 0px 0px 6px 0px black;
                    }
                    .mintOwnForm .mintProgress LABEL {
                      display: block;
                      font-size: 12pt;
                      padding-bottom: 5px;
                      font-weight: bold;
                    }
                    .mintOwnForm .mintProgress LABEL.error {
                      color: #bb0404;
                    }
                  `}
                  </style>
                  <div className="mintOwnForm">
                    <div className="imageUploader">
                      <FileUploader
                        multiple={false}
                        handleChange={handleChangeNFTImage}
                        onDraggingStateChange={handleDragImage}
                        types={nftAllowedTypes}
                      />
                      {nftImageData && (
                        <div className="imageHolder">
                          <img src={nftImageData} />
                        </div>
                      )}
                    </div>
                    <div className="inputHolder">
                      <label>Name:</label>
                      <input type="text" value={nftName} onChange={(e) => { setNftName(e.target.value) }} />
                    </div>
                    <div className="inputHolder">
                      <label>Description:</label>
                      <textarea value={nftDesc} onChange={(e) => { setNftDesc(e.target.value) } } />
                    </div>
                    <div>
                      <button onClick={doMintNFT} className={`${styles.mainButton} primaryButton`}>Mint NFT</button>
                    </div>
                    {isMintShow && (
                      <div className="mintProgress">
                        <div>
                          {isImageUpload && (<label>Uploading Image to IPFS provider...</label>)}
                          {isImageUploaded && (<label>Image uploaded to IPFS</label>)}
                          {isImageUploadError && (<label className="error">Fail upload image to IPFS provider</label>)}
                          {isJsonUpload && (<label>Uploading NFT metadata to IPFS provider...</label>)}
                          {isJsonUploaded && (<label>NFT metadata uploaded to IPFS</label>)}
                          {isJsonUploadError && (<label className="error">Fail upload NFT metadata to IPFS</label>)}
                          {isMinting && !isMinted && (<label>Minting NFT. Confirm transaction</label>)}
                          {isMinted && (<label>NFT Minted!</label>)}
                          {isMinted && (
                            <div>
                              <button onClick={resetMintForm} className={`${styles.mainButton} primaryButton`}>Close</button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  
                </>
              )}
            </>
          ) : (
            <div>{getText(`MintPage_Loading`, `Loading...`)}</div>
          )}
        </>
      )}
    </div>
  );
};

export default Mint;
