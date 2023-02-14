import type { NextPage } from "next"
import { useEffect, useState } from "react"
import styles from "../styles/Home.module.css"

import { setupWeb3, switchOrAddChain, doConnectWithMetamask, isMetamaskConnected, onWalletChanged } from "../helpers/setupWeb3"
import { calcSendArgWithFee } from "../helpers/calcSendArgWithFee"
import navBlock from "../components/navBlock"
import logoBlock from "../components/logoBlock"
import { getLink } from "../helpers"
import { useRouter } from "next/router"
import useStorage from "../storage"
import fetchTokensListInfo from "../helpers/fetchTokensListInfo"
import fetchNftInfo from "../helpers/fetchNftInfo"
import callNftMethod from "../helpers/callNftMethod"
import crypto from "crypto"
import nftSaleToken from "../components/nftSaleToken"
import NftAirdropContractData from "../contracts/source/artifacts/StakeNFT.json"
import MyNFTAbi from '../contracts/MyNFTAbi.json'
import { CHAIN_INFO, ZERO_ADDRESS } from "../helpers/constants"
import { toWei, fromWei } from "../helpers/wei"
import BigNumber from "bignumber.js"
import approveToken from "../helpers/approveToken"
import fetchUserNfts from "../helpers/fetchUserNfts"
import SellNftModal from "../components/SellNftModal"
import Web3 from 'web3'


const debugLog = (msg) => { console.log(msg) }


const Marketplace: NextPage = (props) => {
  const {
    storageData,
    storageData: {
      isBaseConfigReady,
    },
    isOwner,
    addNotify,
    getText,
    getDesign,
    openConfirmWindow,
    storageMenu,
  } = props

  const [ chainId, setChainId ] = useState(storageData?.chainId)
  const [ nftDropContractAddress, setNftDropContractAddress ] = useState(storageData?.nftCollection)

  const [ nftInfo, setNftInfo ] = useState({})
  const [ nftInfoFetched, setNftInfoFetched ] = useState(false)
  const [ tokensAtSale, setTokensAtSale ] = useState([])

  const [ allowedERC20Info, setAllowedERC20Info ] = useState({}) 
  const [ allowedERC20InfoFetching, setAllowedERC20InfoFetching ] = useState(false)
  const [ allowedERC20InfoFetched, setAllowedERC20InfoFetched ] = useState(false)

  const [activeChainId, setActiveChainId] = useState(false)
  const [activeWeb3, setActiveWeb3] = useState(false)
  const [address, setAddress] = useState(false)

  const [airdropContract, setAirdropContract] = useState(false)

  const [isWalletConecting, setIsWalletConnecting] = useState(false)

  const [ currentLot, setCurrentLot ] = useState(false)
  const [ isApproving, setIsApproving ] = useState(false)
  
  const doApproveAndBuy = (lotIndex) => {
    addNotify(`Approving... Confirm transaction`)

    const {
      erc20,
      price,
    } = tokensAtSale[lotIndex]

    setIsApproving(true)
    approveToken({
      activeWeb3,
      chainId,
      tokenAddress: erc20,
      approveFor: nftDropContractAddress,
      weiAmount: price.toString(),
      onTrx: (hash) => {
        addNotify(`Approving TX hash ${hash}`, `success`)
      },
      onFinally: () => {
        addNotify(`Approved`, `success`)
        setIsApproving(false)
        doBuyLot(lotIndex)
      },
      onError: (err) => {
        setIsApproving(false)
        addNotify(`Fail approve token. ${err.message ? err.message : ''}`, `error`)
      }
    })
  }

  
  
  const [ isRemoveFromTrade, setIsRemoveFromTrade ] = useState(false)
  
  const doRemoveFromTrade = (lotIndex) => {
    const {
      tokenId
    } = tokensAtSale[lotIndex]

    openConfirmWindow({
      title: `Remove lot from marketplace`,
      message: `Do you want remove NFT #${tokenId.toString()} from marketplace?`,
      onConfirm: () => {
        setIsRemoveFromTrade(true)
        addNotify(`Removing NFT from marketplace. Confirm transaction`)
        callNftMethod({
          activeWeb3,
          contractAddress: nftDropContractAddress,
          method: 'deSellNFT',
          args: [
            tokenId.toString()
          ],
          onTrx: (txHash) => {
            console.log('>> onTrx', txHash)
            addNotify(`Remove NFT from marketplace TX ${txHash}`, `success`)
          },
          onSuccess: (receipt) => {},
          onError: (err) => {
            console.log('>> onError', err)
            addNotify(`Fail remove NFT. ${err.message ? err.message : ''}`, `error`)
            setIsRemoveFromTrade(false)
          },
          onFinally: (answer) => {
            addNotify(`NFT successfull removed from marketplace`, `success`)
            setIsRemoveFromTrade(false)
            refreshTokensAtSale()
            setReloadUserNfts(true)
          }
        })
      }
    })
  }

  const [ isBuying, setIsBuying ] = useState(false)
  const doBuyLot = (lotIndex) => {
    addNotify(`Buying NFT. Confirm transaction`)
    setIsBuying(true)
    callNftMethod({
      activeWeb3,
      contractAddress: nftDropContractAddress,
      method: tokensAtSale[lotIndex].erc20 == ZERO_ADDRESS ? 'buyNFT' : 'buyNFTbyERC20',
      ...(tokensAtSale[lotIndex].erc20 == ZERO_ADDRESS
        ? {
          weiAmount: tokensAtSale[lotIndex].price.toString()
        } : {}
      ),
      args: [
        tokensAtSale[lotIndex].tokenId.toString()
      ],
      onTrx: (txHash) => {
        console.log('>> onTrx', txHash)
        addNotify(`Buy NFT TX ${txHash}`, `success`)
      },
      onSuccess: (receipt) => {},
      onError: (err) => {
        console.log('>> onError', err)
        addNotify(`Fail buy NFT. ${err.message ? err.message : ''}`, `error`)
        setIsBuying(false)
      },
      onFinally: (answer) => {
        addNotify(`NFT success buyed`, `success`)
        setIsBuying(false)
        refreshTokensAtSale()
        setReloadUserNfts(true)
      }
    })
  }

  const [ userNfts, setUserNfts ] = useState([])
  const [ reloadUserNfts, setReloadUserNfts ] = useState(true)
  const [ isUserNftsFetching, setIsUserNftsFetching ] = useState(false)
  const [ isUserNftsFetched, setIsUserNftsFetched ] = useState(false)
  
  useEffect(() => {
    if (chainId && address && nftDropContractAddress && reloadUserNfts) {
      setReloadUserNfts(false)
      setUserNfts([])
      setIsUserNftsFetched(false)
      setIsUserNftsFetching(true)
      fetchUserNfts({
        chainId,
        walletAddress: address,
        nftAddress: nftDropContractAddress
      }).then((answer) => {
        setUserNfts(answer)
        setIsUserNftsFetching(false)
        setIsUserNftsFetched(true)
      }).catch((err) => {
        setIsUserNftsFetching(false)
        setIsUserNftsFetched(true)
        console.log('>>> err', err)
      })
    }
  }, [ chainId, address, nftDropContractAddress, reloadUserNfts ])

  const [ isSellNft, setIsSellNft ] = useState(false)
  const [ sellNftInfo, setSellNftInfo ] = useState({})
  const doSellNft = (lotIndex) => {
    setSellNftInfo(userNfts[lotIndex])
    setIsSellNft(true)
  }

  useEffect(() => {
    if (nftInfo && nftInfo.isNFTStakeToken && nftInfo.NFTStakeInfo) {
      const { NFTStakeInfo } = nftInfo
      setTokensAtSale([...NFTStakeInfo.tokensAtSale])
      if (NFTStakeInfo.allowedERC20.length > 0) {
        setAllowedERC20InfoFetching(true)
        setAllowedERC20InfoFetched(false)
        fetchTokensListInfo({
          erc20list: NFTStakeInfo.allowedERC20,
          chainId,
          withAllowance: (address) ? {
            allowanceFrom: address,
            allowanceTo: nftDropContractAddress
          } : false
        }).then((answ) => {
          setAllowedERC20Info(answ)
          setAllowedERC20InfoFetching(false)
          setAllowedERC20InfoFetched(true)
        }).catch((err) => {
          console.log('Fail fetch allowed erc20 info', err)
          setAllowedERC20InfoFetched(true)
          setAllowedERC20InfoFetching(false)
        })
      } else {
        setAllowedERC20InfoFetched(true)
      }
    }
  }, [ nftInfo ])

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

  const refreshTokensAtSale = () => {
    fetchNftInfo(nftDropContractAddress, chainId).then((_nftInfo) => {
      setTokensAtSale([..._nftInfo.NFTStakeInfo.tokensAtSale])
    }).catch((err) => {
      console.log('>>> fail fetch nft info', err)
    })
  }

  const initOnWeb3Ready = async () => {
    if (activeWeb3 && (`${activeChainId}` == `${chainId}`)) {
      activeWeb3.eth.getAccounts().then((accounts) => {
        console.log('>>> initOnWeb3Ready', accounts)
        setAddress(accounts[0])
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
    onWalletChanged((newAccount) => {
      setAddress(newAccount)
      if (newAccount) {
        initOnWeb3Ready()
        setReloadUserNfts(true)
      }
    })
  }, [])

  useEffect(() => {
    if (chainId && nftDropContractAddress && !address) {
      console.log('>>> has chainId')
      const chainInfo = CHAIN_INFO(chainId)
      console.log('>>> chainInfo', chainInfo)
      if (chainInfo) {
        try {
          const web3 = new Web3(chainInfo.rpcUrls[0])
          console.log('>>> web3', web3)
          setActiveWeb3(web3)
          fetchNftInfo(nftDropContractAddress, chainId).then((_nftInfo) => {
            console.log('>>> nft info fetched no address', _nftInfo)
            setNftInfo(_nftInfo)
            setNftInfoFetched(true)
          }).catch((err) => {
            console.log('>>> fail fetch nft info', err)
          })
        } catch (err) {
          console.log('>>> err', err)
        }
      }
    }
  }, [ chainId, nftDropContractAddress, address])
  
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
    if (activeWeb3 && chainId && nftDropContractAddress) {
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

  const chainInfo = CHAIN_INFO(chainId)
  const nativeCurrency = chainInfo.nativeCurrency
  
  return (
    <div className={styles.container}>
      {navBlock(`marketplace`)}
      {logoBlock({
        getText,
        getDesign
      })}
      <h1 className={`${styles.h1} pageTitle`}>
        {getText(`MarketPage_Title`, `NFTs Marketplace`)}
      </h1>

      <hr className={`${styles.divider} ${styles.spacerTop}`} />

      <>
        {!address ? (
          <>
            <div className="mpBeforeConnectWallet">
              {getText('MarketPage_BeforeConnect_Text')}
            </div>
            <button disabled={isWalletConecting} className={`${styles.mainButton} primaryButton`} onClick={connectWithMetamask}>
              {isWalletConecting ? `Connecting` : `Connect Wallet`}
            </button>
            <div className="mpAfterConnectWallet">
              {getText('MarketPage_AfterConnect_Text')}
            </div>
          </>
        ) : (
          <h4>Connected wallet {address}</h4>
        )}
        {nftInfoFetched ? (
          <>
            {nftInfo.isNFTStakeToken ? (
              <>
                <div className={styles.nftBoxGrid}>
                  {allowedERC20InfoFetched ? (
                    <>
                      {tokensAtSale.map((lotInfo, lotIndex) => {
                        const {
                          uri,
                          tokenId,
                          erc20,
                          seller
                        } = lotInfo
                        const price = fromWei(
                          lotInfo.price,
                          erc20 == ZERO_ADDRESS
                            ? nativeCurrency.decimals
                            : allowedERC20Info[erc20].decimals
                        )
                        let needApprove = false
                        if (erc20 != ZERO_ADDRESS) {
                          needApprove = new BigNumber(lotInfo.price.toString()).isGreaterThan( allowedERC20Info[erc20].allowance)
                        }
                        return nftSaleToken({
                          isWalletConnected: address,
                          tokenId: tokenId.toString(),
                          tokenUri: uri,
                          price,
                          needApprove,
                          seller,
                          isERC: (erc20 != ZERO_ADDRESS),
                          currency: erc20 == ZERO_ADDRESS ? nativeCurrency.symbol : allowedERC20Info[erc20].symbol,
                          openConfirmWindow,
                          isApproving,
                          isBuying,
                          isActive: (lotIndex === currentLot),
                          isOwner: (lotInfo.seller == address),
                          isRemoveFromTrade,
                          isBaseConfigReady,
                          onRemoveFromTrade: () => {
                            setCurrentLot(lotIndex)
                            doRemoveFromTrade(lotIndex)
                          },
                          onBuy: () => {
                            setCurrentLot(lotIndex)
                            doBuyLot(lotIndex)
                          },
                          onApproveAndBuy: () => {
                            setCurrentLot(lotIndex)
                            doApproveAndBuy(lotIndex)
                          }
                        })
                      })}
                    </>
                  ) : (
                    <>
                      <div>Loading...</div>
                    </>
                  )}
                </div>
                <hr className={`${styles.divider} ${styles.spacerTop}`} />
                {address !== false && (
                  <>
                    <h2>Your NFTs</h2>
                    <hr className={`${styles.divider} ${styles.spacerTop}`} />
                    <div className={styles.nftBoxGrid}>
                      {isUserNftsFetched ? (
                        <>
                          {userNfts.length > 0 ? (
                            <>
                              {userNfts.map((info, lotIndex) => {
                                return nftSaleToken({
                                  tokenId: info.tokenId.toString(),
                                  tokenUri: info.tokenURI,
                                  openConfirmWindow,
                                  isUserNFT: true,
                                  isTradeAllow: nftInfo.NFTStakeInfo.allowUserSale,
                                  onAddToTrade: () => { doSellNft(lotIndex) }
                                })
                              })}
                            </>
                          ) : (
                            <div>You are dont have any NFTs</div>
                          )}
                        </>
                      ) : (
                        <div>Loading...</div>
                      )}
                    </div>
                  </>
                )}
                {isSellNft && (
                  <SellNftModal {...{
                    activeWeb3,
                    openConfirmWindow,
                    addNotify,
                    nftInfo: sellNftInfo,
                    chainId,
                    nftContract: nftDropContractAddress,
                    isBaseConfigReady,
                    allowedERC20Info,
                    tradeFee: nftInfo.NFTStakeInfo.tradeFee.toString(),
                    onClose: () => { setIsSellNft(false) },
                    onSelled: () => {
                      setIsSellNft(false)
                      refreshTokensAtSale()
                      setReloadUserNfts(true)
                    }
                  }} />
                )}
              </>
            ) : (
              <>
                <div>Not NFTStake contract</div>
              </>
            )}
          </>
        ) : (
          <div>{getText(`MarketPage_Loading`, `Loading...`)}</div>
        )}
      </>
    </div>
  );
};

export default Marketplace;
