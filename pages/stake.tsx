import { BigNumber, ethers } from "ethers"
import type { NextPage } from "next"
import { useEffect, useState } from "react"
import styles from "../styles/Home.module.css"

import { setupWeb3, switchOrAddChain, doConnectWithMetamask, isMetamaskConnected } from "../helpers/setupWeb3"
import { calcSendArgWithFee } from "../helpers/calcSendArgWithFee"
import navBlock from "../components/navBlock"
import logoBlock from "../components/logoBlock"
import useStorage from "../storage/"
import nftToken from "../components/nftToken"

import { getUnixTimestamp } from "../helpers/getUnixTimestamp"
import { callMulticall } from "../helpers/callMulticall"

import TokenAbi from 'human-standard-token-abi'
import ERC721Abi from '../contracts/ERC721Abi.json'
import FarmContractData from "../contracts/source/artifacts/Farm.json"
import MulticallAbi from '../contracts/MulticallAbi.json'

import { MULTICALL_CONTRACTS } from '../helpers/constants'
import { Interface as AbiInterface } from '@ethersproject/abi'

const ERC721_INTERFACE = new AbiInterface(ERC721Abi)

const FARM_INTERFACE = new AbiInterface(FarmContractData.abi)

const debugLog = (msg) => { console.log(msg) }

const Stake: NextPage = (props) => {
  const {
    storageData,
    isOwner,
    openConfirmWindow,
    addNotify,
    getText,
    getDesign,
    storageMenu,
  } = props

  const showDebugPanel = false

  const [ chainId, setChainId ] = useState(storageData?.chainId)
  const [ nftDropContractAddress, setNftDropContractAddress ] = useState(storageData?.nftCollection)
  const [ tokenContractAddress, setTokenContractAddress ] = useState(storageData?.rewardToken)
  const [ stakingContractAddress, setStakingContractAddress ] = useState(storageData?.farmContract)

  const [activeChainId, setActiveChainId] = useState(false)
  const [activeWeb3, setActiveWeb3] = useState(false)
  const [address, setAddress] = useState(false)
  const [farmContract, setFarmContract] = useState(false)
  const [nftContract, setNftContract] = useState(false)
  const [mcContract, setMcContract] = useState(false)

  const [farmStatus, setFarmStatus] = useState(false)
  const [farmStatusFetching, setFarmStatusFetching] = useState(false)
  const [farmStatusFetched, setFarmStatusFetched] = useState(false)
  
  const [claimableRewards, setClaimableRewards] = useState(false)
  const [claimableRewardsLoading, setClaimableRewardsLoading] = useState(true)
  const [claimableRewardsError, setClaimableRewardsError] = useState(false)
  const [isClaimbleRewards, setIsClaimbleRewards] = useState(false)
  
  const [rewardTokenContract, setRewardTokenContract] = useState(false)
  const [rewardTokenSymbol, setRewardTokenSymbol] = useState(false)
  const [rewardTokenDecimals, setRewardTokenDecimals] = useState(false)
  const [rewardTokenInfoLoading, setRewardTokenInfoLoading] = useState(true)
  const [rewardTokenInfoLoadError, setRewardTokenInfoLoadError] = useState(false)
  const [rewardTokenBalance, setRewardTokenBalance] = useState(false)
  const [rewardTokenBalanceLoading, setRewardTokenBalanceLoading] = useState(true)
  const [rewardTokenBalanceLoadError, setRewardTokenBalanceLoadError] = useState(false)

  const [isApproved, setIsApproved] = useState(false)
  const [isApproveCheck, setIsApproveCheck] = useState(true)

  const [stakedNftsLoading, setStakedNftsLoading] = useState(true)
  const [stakedNftsLoadError, setStakedNftsLoadError] = useState(false)
  const [stakedNfts, setStakedNfts] = useState([])
  const [stakedNftsUtx, setStakedNftsUtx] = useState([])

  const [stakedNftsUris, setStakedNftsUris] = useState({})
  const [stakedNftsUrisFetching, setStakedNftsUrisFetching] = useState(false)
  const [stakedNftsUrisLoadError, setStakedNftsUrisLoadError] = useState(false)

  const [ownedNfts, setOwnedNfts] = useState([])
  const [ownedNftsUris, setOwnedNftsUris] = useState({})
  const [ownedNftsUrisFetching, setOwnedNftsUrisFetching] = useState(true)
  const [ownedNftsUrisLoadError, setOwnedNftsUrisLoadError] = useState(false)

  const [ownedNftsLoading, setOwnedNftsLoading] = useState(true)
  const [ownedNftsLoadError, setOwnedNftsLoadError] = useState(false)

  const [canListOwnedNfts, setCanListOwnedNfts] = useState(false)

  const [customTokenId, setCustomTokenId] = useState(false)

  const [isStakingDo, setIsStakingDo] = useState(false)
  const [isStakingId, setIsStakingId] = useState(false)

  const [isDeStakingDo, setIsDeStakingDo] = useState(false)
  const [isDeStakingId, setIsDeStakingId] = useState(false)

  const [isApproveDo, setIsApproveDo] = useState(false)
  const [isApproveId, setIsApproveId] = useState(false)

  const [isWalletConecting, setIsWalletConnecting] = useState(false)

  const [isDebugOpened, setIsDebugOpened] = useState(false)

  useEffect(() => {
    if (storageData
      && storageData.chainId
      && storageData.nftCollection
      && storageData.rewardToken
      && storageData.farmContract
    ) {
      setChainId(storageData.chainId)
      setNftDropContractAddress(storageData.nftCollection)
      setTokenContractAddress(storageData.rewardToken)
      setStakingContractAddress(storageData.farmContract)
    }
  }, [storageData])


  const toggleDebug = () => {
    setIsDebugOpened(!isDebugOpened)
  }

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

  const fetchAvailableReward = () => {
    debugLog('do fetchAvailableReward')
    try {
      setClaimableRewardsError(false)
      setClaimableRewardsLoading(true)
      farmContract.methods.availableRewards(address).call().then((rewardsWei) => {
        setClaimableRewards(rewardsWei)
        setClaimableRewardsLoading(false)
      })
    } catch (err) {
      console.log('>>> fail fetchAvailableReward')
      processError(err, 'fetchAvailableReward')
      setClaimableRewardsError(true)
    }
  }

  const fetchTotalRewardBalance = () => {
    debugLog('do fetchTotalRewardBalance')
    setRewardTokenBalanceLoading(true)
    setRewardTokenBalanceLoadError(false)
    if (rewardTokenContract) {
      rewardTokenContract.methods.balanceOf(stakingContractAddress).call().then((balanceWei) => {
        setRewardTokenBalance(balanceWei)
        setRewardTokenBalanceLoading(false)
      }).catch((err) => {
        setRewardTokenBalanceLoadError(true)
        console.log('>>> fetchTotalRewardBalance', err)
        processError(err, 'fetchTotalRewardBalance')
      })
    }
  }

  const fetchStakedNfts = () => {
    debugLog('do fetchStakedNfts')
    if (address && farmContract && farmStatus) {
      setStakedNftsLoadError(false)
      setStakedNftsUrisLoadError(false)
      setStakedNftsLoading(true)

      farmContract.methods[(farmStatus.version >=3) ? 'getStakedTokens_V3' : 'getStakedTokens'](address).call().then((userStackedTokens) => {
        const userStackedTokensUtx = {}

        const userStackedTokensIds = userStackedTokens.map((stackInfo) => {
          userStackedTokensUtx[stackInfo.tokenId] = stackInfo.stackeUtx
          return stackInfo.tokenId
        })
        setStakedNftsUtx(userStackedTokensUtx)
        setStakedNfts(userStackedTokensIds)
        setStakedNftsLoading(false)
        setStakedNftsUrisFetching(true)

        fetchTokenUris(userStackedTokensIds).then((tokenUris) => {
          setStakedNftsUris(tokenUris)
          setStakedNftsUrisFetching(false)
        }).catch((e) => {
          setStakedNftsUrisFetching(false)
          setStakedNftsUrisLoadError(true)
        })
      }).catch((err) => {
        setStakedNftsLoadError(true)
        console.log('>>> fail fetchStakedNfts', err)
        processError(err, 'fetchStakedNfts')
      })
    }
  }

  const fetchIsApproved = async () => {
    debugLog('do fetchIsApproved')
    setIsApproveCheck(true)
    try {
      nftContract.methods.isApprovedForAll(address, stakingContractAddress).call().then((_isApproved) => {
        setIsApproved(_isApproved)
        setIsApproveCheck(false)
      })
    } catch (err) {
      console.log('>>> fail check is approved')
      processError(err, 'approve_check')
      setIsApproveCheck(false)
    }
  }

  const fetchTokenUris = (tokenIds) => {
    debugLog('do fetchTokenUris', tokenIds)
    return new Promise((resolve, reject) => {
      if (address && nftContract && mcContract) {
        const urisCalls = tokenIds.map((tokenId) => {
          return {
            target: nftDropContractAddress,
            tokenId,
            callData: ERC721_INTERFACE.encodeFunctionData('tokenURI', [tokenId])
          }
        })
        mcContract.methods.aggregate(urisCalls).call().then((tokenUrisAnswer) => {
          const _userTokenUris = {}
          tokenUrisAnswer.returnData.forEach((retData, _tokenNumberInCall) => {
            const tokenUri = ERC721_INTERFACE.decodeFunctionResult('tokenURI', retData)[0]
            _userTokenUris[tokenIds[_tokenNumberInCall]] = tokenUri
          })
          resolve(_userTokenUris)
        }).catch((err) => {
          processError(err, 'fetchTokenUris')
          reject()
        })
      } else {
        reject()
      }
    })
  }


  const fetchUserNfts = async () => {
    debugLog('do fetchUserNfts')
    if (address && nftContract && mcContract && !stakedNftsLoading) {
      setOwnedNftsLoading(true)
      setOwnedNftsLoadError(false)
      let hasTotalSupply = false
      let hasMaxSupply = false
      let totalSupply = 0
      let maxSupply = 0
      // TOTAL SUPPLY
      try {
        totalSupply = await nftContract.methods.totalSupply().call()
        hasTotalSupply = true
      } catch (err) {
        console.log('Fail fetch total supply')
      }
      // MAX SUPPLY
      try {
        maxSupply = await nftContract.methods.MAX_SUPPLY().call()
        hasMaxSupply = true
      } catch (err) {
        console.log('Fail fetch max supply')
      }
      console.log('hasMaxSupply', hasMaxSupply)
      console.log('hasTotalSupply', hasTotalSupply)
      console.log('maxSupply', maxSupply)
      console.log('totalSupply', totalSupply)
      if (hasMaxSupply || hasTotalSupply) {
        setCanListOwnedNfts(true)
        const ownerCalls = []
        for (let checkTokenId = 1; checkTokenId<=((hasTotalSupply) ? totalSupply : maxSupply); checkTokenId++) {
          ownerCalls.push({
            target: nftDropContractAddress,
            callData: ERC721_INTERFACE.encodeFunctionData('ownerOf', [checkTokenId])
          })
        }
        mcContract.methods.aggregate(ownerCalls).call().then((ownerAnswers) => {
          const _userTokenIds = []
          ownerAnswers.returnData.forEach((retData, _tokenId) => {
            const tokenOwner = ERC721_INTERFACE.decodeFunctionResult('ownerOf', retData)[0]
            if (tokenOwner === address) _userTokenIds.push(_tokenId+1)
          })
          setOwnedNfts(_userTokenIds)
          setOwnedNftsLoading(false)
          setOwnedNftsUrisFetching(true)
          fetchTokenUris(_userTokenIds).then((tokenUris) => {
            setOwnedNftsUris(tokenUris)
            setOwnedNftsUrisFetching(false)
          }).catch((e) => {
            setOwnedNftsUrisFetching(false)
          })
        }).catch((err) => {
          console.log('>>> fetchUserNfts', err)
          setOwnedNftsLoadError(true)
          processError(err, fetchUserNfts)
        })
      }
    }
  }

  useEffect(() => {
    fetchUserNfts()
    if (!farmStatus && !farmStatusFetched && !farmStatusFetching) {
      fetchFarmStatus()
    }
  }, [address, nftContract, mcContract, farmContract, stakedNftsLoading])


  

  const fetchFarmStatus = () => {
    if (farmContract && mcContract) {
      setFarmStatusFetched(false)
      setFarmStatusFetching(true)
      farmContract.methods.version().call().then((farmVersion) => {
        console.log('>>> farmVersion', farmVersion)
        const farmAddress = storageData.farmContract

        const mcCalls = {
          version: {
            func: `version`,
            args: []
          },
          ...((farmVersion >=2) ? 
            {
              rewardsPerHour: {
                func: `rewardsPerHour`,
                args: []
              },
            } : {}
          ),
          ...((farmVersion >=3) ?
            {
              lockEnabled: {
                func: `lockEnabled`,
                args: []
              },
              lockTime: {
                func: `lockTime`,
                args: []
              },
            } : {}
          )
        }
        callMulticall({
          multicall: mcContract,
          target: storageData.farmContract,
          encoder: FARM_INTERFACE,
          calls: mcCalls
        }).then((answer) => {
          setFarmStatus(answer)
          setFarmStatusFetched(true)
          setFarmStatusFetching(false)
          console.log(answer)
        }).catch((err) => {
          setFarmStatusFetching(false)
          console.log('>>> err', err)
        })
      }).catch((e) => {
        setFarmStatusFetching(false)
        console.log('>>> fail fetchFarmStatus', e)
      })
    }
  }

  const fetchRewardTokenInfoAndBalance = () => {
    if(rewardTokenContract) {
      setRewardTokenBalanceLoadError(false)
      setRewardTokenInfoLoadError(false)
      setRewardTokenInfoLoading(true)
      rewardTokenContract.methods.decimals().call().then((decimals) => {
        rewardTokenContract.methods.symbol().call().then((symbol) => {
          setRewardTokenInfoLoading(false)
          setRewardTokenDecimals(decimals)
          setRewardTokenSymbol(symbol)
          fetchTotalRewardBalance()
        }).catch((e) => {
          console.log('>>> reward token info - fail fetch symbol')
          setRewardTokenBalanceLoadError(true)
          setRewardTokenInfoLoadError(true)
        })
      }).catch((e) => {
        console.log('>>> reward token info - fail fetch decimals')
        setRewardTokenBalanceLoadError(true)
        setRewardTokenInfoLoadError(true)
      })
    }
  }

  useEffect(() => {
    if(rewardTokenContract) {
      debugLog('on useEffect rewardTokenContract')
      fetchRewardTokenInfoAndBalance()
    }
  }, [rewardTokenContract])

  useEffect(() => {
    if (farmStatusFetched && farmStatus) fetchStakedNfts()
  }, [ farmStatusFetched ])

  useEffect(() => {
    if (farmContract && address) {
      debugLog('on useEffect farmContract && address')
      fetchAvailableReward()
      // fetchFarmStatus()
    }
  }, [address, farmContract])

  useEffect(() => {
    if (address && nftContract) {
      debugLog('on useEffect address && nftContract')
      fetchIsApproved()
    }
  }, [address, nftContract])

  const initOnWeb3Ready = async () => {
    if (activeWeb3 && (`${activeChainId}` == `${chainId}`)) {
      activeWeb3.eth.getAccounts().then((accounts) => {
        setAddress(accounts[0])
        const _mcContract = new activeWeb3.eth.Contract(MulticallAbi, MULTICALL_CONTRACTS[activeChainId])
        console.log(_mcContract)
        setMcContract(_mcContract)
        const _nftContract = new activeWeb3.eth.Contract(ERC721Abi, nftDropContractAddress)
        setNftContract(_nftContract)
        const _rewardTokenContract = new activeWeb3.eth.Contract(TokenAbi, tokenContractAddress)
        setRewardTokenContract(_rewardTokenContract)
        const _farmContract = new activeWeb3.eth.Contract(FarmContractData.abi, stakingContractAddress)
        setFarmContract(_farmContract)
      }).catch((err) => {
        console.log('>>> initOnWeb3Ready', err)
        processError(err)
      })
    } else {
      const _isConnected = await isMetamaskConnected()
      if (_isConnected) connectWithMetamask()
    }
  }

  useEffect(() => {
    debugLog('on useEffect activeWeb3 initOnWeb3Ready')
    if (chainId
      && nftDropContractAddress
      && tokenContractAddress
      && stakingContractAddress
    ) {
      initOnWeb3Ready()
    }
  }, [activeWeb3, chainId, nftDropContractAddress, tokenContractAddress, stakingContractAddress])

  async function claimRewards() {
    if (address && farmContract) {
      setIsClaimbleRewards(true)
      addNotify(`Confirm transaction...`)
      const sendArgs = await calcSendArgWithFee(address, farmContract, "claimRewards", [])
      const gasPrice = await activeWeb3.eth.getGasPrice()
      sendArgs.gasPrice = gasPrice
      farmContract.methods.claimRewards().send(sendArgs).then((res) => {
        fetchAvailableReward()
        fetchTotalRewardBalance()
        setIsClaimbleRewards(false)
        addNotify(`Reward claimed`, `success`)
      }).catch((err) => {
        setIsClaimbleRewards(false)
        console.log('>>> claimRewards', err)
        processError(err)
        addNotify(`Fail claim reward`, `error`)
      })
    }
  }

  async function stakeNft(id: BigNumber) {
    if (address && farmContract && nftContract) {
      const _doStake = async () => {
        try {
          setIsStakingDo(true)
          setIsStakingId(id)
          addNotify(`Confirm stake transaction`)
          const stakeTxData = await calcSendArgWithFee(address, farmContract, "stake", [id])
          const gasPrice = await activeWeb3.eth.getGasPrice()
          stakeTxData.gasPrice = gasPrice
          farmContract.methods.stake(id).send(stakeTxData).then(() => {
            const _stakedNfts = stakedNfts
            _stakedNfts.push(id)
            setStakedNfts(_stakedNfts)
            setStakedNftsUtx((prev) => {
              return {
                ...prev,
                [`${id}`]: getUnixTimestamp()
              }
            })
            setStakedNftsUris({
              ...stakedNftsUris,
              [`${id}`]: ownedNftsUris[id],
            })
            setOwnedNfts(ownedNfts.filter((tokenId) => { return `${tokenId}` !== `${id}` }))
            setOwnedNftsUris({
              ...ownedNftsUris,
              [`${id}`]: false,
            })

            setIsStakingDo(false)
            setIsStakingId(false)
            addNotify(`NFT Staked!`,`success`)
          }).catch((err) => {
            addNotify(`Stake transaction failed`, `error`)
            console.log('>> stakeNft', err)
            processError(err)

            setIsStakingDo(false)
            setIsStakingId(false)
          })
        } catch (err) {
          addNotify(`Stake transaction failed`, `error`)
          console.log('>> stakeNft calc gas', err)
          processError(err)

          setIsStakingDo(false)
          setIsStakingId(false)
        }
      }
      if (!isApproved) {
        setIsApproveId(id)
        setIsApproveDo(true)
        addNotify(`Confirm approve transaction`)
        try {
          const approveTxData = await calcSendArgWithFee(address, nftContract, "setApprovalForAll", [stakingContractAddress, true]);
          nftContract.methods.setApprovalForAll(stakingContractAddress, true).send(approveTxData).then(async (ok) => {
            setIsApproved(true)
            setIsApproveDo(false)
            addNotify(`Successfull approved!`,`success`)
            _doStake()
          }).catch((err) => {
            addNotify(`Fail approve transaction`,`error`)
            console.log('>> stakeNft do approve', err)
            setIsApproveDo(false)
            processError(err)
          })
        } catch (err) {
          addNotify(`Fail approve transaction`,`error`)
          console.log('>>> stakeNft do approve calc gas', err)
          setIsApproveDo(false)
          processError(err)
        }
      } else {
        _doStake()
      }
    }
  }

  async function withdraw(id: BigNumber) {
    if (address && farmContract) {
      try {
        setIsDeStakingDo(true)
        setIsDeStakingId(id)
        addNotify(`Confirm withdraw transaction`)
        const sendArgs = await calcSendArgWithFee(address, farmContract, "withdraw", [id])
        const gasPrice = await activeWeb3.eth.getGasPrice()
        sendArgs.gasPrice = gasPrice
        farmContract.methods.withdraw(id).send(sendArgs).then((res) => {
          const _ownedNtfs = ownedNfts
          _ownedNtfs.push(id)
          setOwnedNfts(_ownedNtfs)
          setStakedNftsUtx((prev) => {
            return {
              ...prev,
              [`${id}`]: 0
            }
          })
          setStakedNfts(stakedNfts.filter((tokenId) => { return tokenId !== id }))
          setOwnedNftsUris({
            ...ownedNftsUris,
            [`${id}`]: stakedNftsUris[id],
          })
          setStakedNftsUris({
            ...stakedNftsUris,
            [`${id}`]: false,
          })

          setIsDeStakingDo(false)
          setIsDeStakingId(false)
          addNotify(`NFT withdrawed`,`success`)
        }).catch((err) => {
          console.log('>>> withdraw', err)
          processError(err)

          setIsDeStakingDo(false)
          setIsDeStakingId(false)
          addNotify(`Withdraw NFT transaction failed`, `error`)
        })
      } catch (err) {
        console.log('>>> withdraw calc gas', err)
        processError(err)

        setIsDeStakingDo(false)
        setIsDeStakingId(false)
        addNotify(`Withdraw NFT transaction failed`, `error`)
      }
    }
  }

  const connectWithMetamask = async () => {
    console.log('>>> connectWithMetamask', chainId)
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

  const doStakeCustomNft = () => {
    if (customTokenId) {
      console.log('>>> stake custom nft', customTokenId)
      stakeNft(BigNumber.from(customTokenId).toNumber())
    }
  }

  const stakeCustomNft = (
    <div className={`${styles.stakeCustomNftHolder}`}>
      <b>Stake NFT by TokenId</b>
      <input type="number" onChange={(v) => setCustomTokenId(v.target.value)} />
      <button
        className={`${styles.mainButton} ${styles.spacerBottom} primaryButton`}
        onClick={doStakeCustomNft}
        disabled={isApproveDo || isStakingDo || isDeStakingDo}
      >
        {isApproved ? 'Stake' : 'Approve & Stake'}
      </button>
    </div>
  )

  const errorBlock = (options) => {
    const {
      message,
      onReload,
    } = options

    return (
      <b>{message}</b>
    )
  }

  return (
    <div className={styles.container}>
      {navBlock(`stake`)}
      {logoBlock({
        getText,
        getDesign
      })}
      <h1 className={`${styles.h1} pageTitle`}>
        {getText(`StakePage_Title`, `Stake Your NFTs - Earn ERC20`)}
      </h1>

      <hr className={`${styles.divider} ${styles.spacerTop}`} />

      {!address ? (
        <>
          <div className="stakeBeforeConnectWallet">
            {getText('StakePage_BeforeConnect_Text')}
          </div>
          <button disabled={isWalletConecting} className={`${styles.mainButton} primaryButton`} onClick={connectWithMetamask}>
            {isWalletConecting ? `Connecting` : `Connect Wallet`}
          </button>
          <div className="stakeAfterConnectWallet">
            {getText('StakePage_AfterConnect_Text')}
          </div>
        </>
      ) : (
        <>
          <div className="stakeBeforeYourReward">
            {getText('StakePage_BeforeYourReward_Text')}
          </div>
          <h2 className="stakeYourRewardLabel">
            {getText('StakePage_YourRewardLabel', 'Your reward')}
          </h2>
          <div className="stakeAfterYourReward">
            {getText('StakePage_AfterYourReward_Text')}
          </div>

          <div className={styles.tokenGrid}>
            <div className={`${styles.tokenItem} stakeRewardAndBank`}>
              <h3 className={styles.tokenLabel}>Claimable Rewards</h3>
              <p className={styles.tokenValue}>
                {claimableRewardsError ? (
                  <>{errorBlock({ message: `ERROR` })}</>
                ) : (
                  <b>
                    {(!claimableRewards || (rewardTokenDecimals === false) || (rewardTokenSymbol === false))
                      ? "Loading..."
                      : `${ethers.utils.formatUnits(claimableRewards, rewardTokenDecimals)} ${rewardTokenSymbol}`
                    }
                  </b>
                )}
              </p>
            </div>
            <div className={`${styles.tokenItem} stakeRewardAndBank`}>
              <h3 className={styles.tokenLabel}>Stake Farm balance</h3>
              <p className={styles.tokenValue}>
                {rewardTokenBalanceLoadError ? (
                  <>{errorBlock({ message: `ERROR` })}</>
                ) : (
                  <b>
                    {(rewardTokenBalanceLoading || !rewardTokenBalance || (rewardTokenDecimals === false) || (rewardTokenSymbol === false))
                      ? "Loading..."
                      : `${ethers.utils.formatUnits(rewardTokenBalance, rewardTokenDecimals)} ${rewardTokenSymbol}`
                    }
                  </b>
                )}
              </p>
            </div>
          </div>

          <hr className={`${styles.divider} ${styles.spacerTop}`} />
          <b className="stakePageConnectedWallet">Connected wallet {address}</b>
          <button
            disabled={isClaimbleRewards}
            className={`${styles.mainButton} ${styles.spacerTop} primaryButton`}
            onClick={() => claimRewards()}
          >
            {isClaimbleRewards ? `Receiving an award...` : `Claim Rewards`}
          </button>

          <hr className={`${styles.divider} ${styles.spacerTop}`} />

          <h2 className="stakeYourStakedNfts">
            {getText('StakePage_YourStakedNfts', 'Your Staked NFTs')}
          </h2>
          <div className="stakeYourStakedNftsDesc">
            {getText('StakePage_YourStakedNfts_Desc')}
          </div>
          <div className={styles.nftBoxGrid}>
            {stakedNftsLoading ? (
              <p className={styles.tokenValue}>
                <b>Loading...</b>
              </p>
            ) : (
              <>
                {stakedNfts.length > 0 ? (
                  <>
                    {stakedNfts?.map((tokenId) => {
                      return nftToken({
                        tokenId,
                        tokenUri: stakedNftsUris[tokenId] ? stakedNftsUris[tokenId] : false,
                        isApproved,
                        onDeStake: () => withdraw(tokenId),
                        onStake: null,
                        isFetchUri: stakedNftsUrisFetching,
                        deStakeId: isDeStakingId,
                        stakeId: isStakingId,
                        isStaking: isStakingDo,
                        isDeStaking: isDeStakingDo,
                        isApproveDo,
                        isApproveId,
                        farmStatus,
                        tokenUtx: stakedNftsUtx[tokenId] ? stakedNftsUtx[tokenId] : false,
                        openConfirmWindow,
                      })
                    })}
                  </>
                ) : (
                  <p className={styles.tokenValue}>
                    <b>You dont have staked NFTs.</b>
                  </p>
                )}
              </>
            )}
          </div>

          <hr className={`${styles.divider} ${styles.spacerTop}`} />
          <h2 className="stakeYourUnstakedNfts">
            {getText('StakePage_YourUnStakedNfts', 'Your Unstaked NFTs')}
          </h2>
          <div className="stakeYourUnstakedNftsDesc">
            {getText('StakePage_YourUnStakedNfts_Desc')}
          </div>
          {/*stakeCustomNft*/}
          <div className={styles.nftBoxGrid}>
            {ownedNftsLoading ? (
              <p className={styles.tokenValue}>
                <b>Loading...</b>
              </p>
            ) : (
              <>
                {ownedNfts.length > 0 ? (
                  <>
                    {ownedNfts?.map((tokenId) => {
                      return nftToken({
                        tokenId,
                        tokenUri: ownedNftsUris[tokenId] ? ownedNftsUris[tokenId] : false,
                        isApproved,
                        onDeStake: null,
                        onStake: () => stakeNft(tokenId),
                        isFetchUri: ownedNftsUrisFetching,
                        deStakeId: isDeStakingId,
                        stakeId: isStakingId,
                        isStaking: isStakingDo,
                        isDeStaking: isDeStakingDo,
                        isApproveDo,
                        isApproveId,
                      })
                    })}
                  </>
                ) : (
                  <p className={styles.tokenValue}>
                    <b>You dont have Unstaked NFTs.</b>
                  </p>
                )}
              </>
            )}
          </div>
        </>
      )}
      {showDebugPanel && (
        <div className={`${styles.debugBlock} ${(isDebugOpened) ? styles.opened : ''}`} >
          <button onClick={() => { toggleDebug() }}>{`${(isDebugOpened) ? 'Close debug info' : 'Open debug info'}`}</button>
          {claimableRewardsError && (<div>claimableRewardsError</div>)}
          {rewardTokenInfoLoadError && (<div>rewardTokenInfoLoadError</div>)}
          {rewardTokenBalanceLoadError && (<div>rewardTokenBalanceLoadError</div>)}
          {stakedNftsLoadError && (<div>stakedNftsLoadError</div>)}
          {stakedNftsUrisLoadError && (<div>stakedNftsUrisLoadError</div>)}
          {ownedNftsLoadError && (<div>ownedNftsLoadError</div>)}
          {ownedNftsUrisLoadError && (<div>ownedNftsUrisLoadError</div>)}
          {claimableRewardsLoading && (<div>claimableRewardsLoading</div>)}
          {rewardTokenInfoLoading && (<div>rewardTokenInfoLoading</div>)}
          {rewardTokenBalanceLoading && (<div>rewardTokenBalanceLoading</div>)}
          {stakedNftsLoading && (<div>stakedNftsLoading</div>)}
          {stakedNftsUrisFetching && (<div>stakedNftsUrisFetching</div>)}
          {ownedNftsLoading && (<div>ownedNftsLoading</div>)}
          {ownedNftsUrisFetching && (<div>ownedNftsUrisFetching</div>)}
          {isStakingDo && (<div>isStakingDo</div>)}
          {isDeStakingDo && (<div>isDeStakingDo</div>)}
          {isApproveDo && (<div>isApproveDo</div>)}
          {isWalletConecting && (<div>isWalletConecting</div>)}
        </div>
      )}
    </div>
    
  );
};

export default Stake;
