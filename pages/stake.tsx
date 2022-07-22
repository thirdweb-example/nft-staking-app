/*
import {
  ThirdwebNftMedia,
  useAddress,
  useMetamask,
  useNFTDrop,
  useToken,
  useTokenBalance,
  useOwnedNFTs,
  useContract,
} from "@thirdweb-dev/react";
*/
import { BigNumber, ethers } from "ethers";
import type { NextPage } from "next";
import { useEffect, useState } from "react";
import styles from "../styles/Home.module.css";

import setupWeb3 from "../helpers/setupWeb3";
import { calcSendArgWithFee } from "../helpers/calcSendArgWithFee";

const chainId = 97;
const nftDropContractAddress = "0x7682598A861336359740C08b3D1C5981F9473979";
const tokenContractAddress = "0x703f112bda4cc6cb9c5fb4b2e6140f6d8374f10b";
const stakingContractAddress = "0xAcf15259F8B99094b7051679a9e60B2F270558ce";

import TokenAbi from 'human-standard-token-abi'
import ERC721Abi from '../contracts/ERC721Abi.json'
import FarmAbi from '../contracts/FarmAbi.json'
import MulticallAbi from '../contracts/MulticallAbi.json'

import { MULTICALL_CONTRACTS } from '../helpers/constants'
import { Interface as AbiInterface } from '@ethersproject/abi'

const ERC721_INTERFACE = new AbiInterface(ERC721Abi)

const Stake: NextPage = () => {
  const isLoading = false
  if (isLoading) {
    return <div>Loading</div>
  }

  const [activeChainId, setActiveChainId] = useState(false)
  const [activeWeb3, setActiveWeb3] = useState(false)
  const [address, setAddress] = useState(false)
  const [farmContract, setFarmContract] = useState(false)
  const [nftContract, setNftContract] = useState(false)
  const [mcContract, setMcContract] = useState(false)
  const [claimableRewards, setClaimableRewards] = useState(false)
  const [rewardTokenContract, setRewardTokenContract] = useState(false)
  const [rewardTokenSymbol, setRewardTokenSymbol] = useState(false)
  const [rewardTokenDecimals, setRewardTokenDecimals] = useState(false)
  const [rewardTokenBalance, setRewardTokenBalance] = useState(false)
  const [rewardTokenBalanceLoading, setRewardTokenBalanceLoading] = useState(true)

  const [isApproved, setIsApproved] = useState(false)
  const [isApproveCheck, setIsApproveCheck] = useState(true)
  const [stakedNftsLoading, setStakedNftsLoading] = useState(true)
  const [stakedNfts, setStakedNfts] = useState([])

  const [ownedNfts, setOwnedNfts] = useState([])
  const [ownedNftsLoading, setOwnedNftsLoading] = useState(true)
  const [canListOwnedNfts, setCanListOwnedNfts] = useState(false)

  const [customTokenId, setCustomTokenId] = useState(false)


  const processError = (error) => {
    console.log(error.message)
    switch (error.message) {
      case `execution reverted: You don't own this token!`:
        console.log(`You dont own this token`)
        break;
      case `MetaMask Tx Signature: User denied transaction signature.`:
        console.log('Transaction denied')
        break;
      default:
        console.log('Unkrnown error', error.message)
        break;
    }
  }
  const fetchAvailableReward = () => {
    farmContract.methods.availableRewards(address).call().then((rewardsWei) => {
      setClaimableRewards(rewardsWei)
    })
  }

  const fetchTotalRewardBalance = () => {
    setRewardTokenBalanceLoading(true)
    if (rewardTokenContract) {
      rewardTokenContract.methods.balanceOf(stakingContractAddress).call().then((balanceWei) => {
        setRewardTokenBalance(balanceWei)
        setRewardTokenBalanceLoading(false)
      }).catch((err) => {
        console.log('>>> fetchTotalRewardBalance', err)
        processError(err)
      })
    }
  }

  const fetchStakedNfts = () => {
    if (address && farmContract) {
      setStakedNftsLoading(true)
      farmContract.methods.getStakedTokens(address).call().then((userStackedTokens) => {
        userStackedTokens = userStackedTokens.map((stackInfo) => { return stackInfo.tokenId })

        setStakedNfts(userStackedTokens)
        setStakedNftsLoading(false)
      })
    }
  }

  const fetchIsApproved = async () => {
    setIsApproveCheck(true)
    nftContract.methods.isApprovedForAll(address, stakingContractAddress).call().then((_isApproved) => {
      setIsApproved(_isApproved)
      setIsApproveCheck(false)
    })
  }

  const fetchUserNfts = async () => {
    if (address && nftContract && mcContract && !stakedNftsLoading) {
      setOwnedNftsLoading(true)
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
        }).catch((err) => {
          console.log('>>> fetchUserNfts', err)
          processError(err)
        })
      }
    }
  }

  useEffect(() => {
    fetchUserNfts()
  }, [address, nftContract, mcContract, farmContract, stakedNftsLoading])

  useEffect(() => {
    if(rewardTokenContract) {
      rewardTokenContract.methods.decimals().call().then((decimals) => {
        rewardTokenContract.methods.symbol().call().then((symbol) => {
          setRewardTokenDecimals(decimals)
          setRewardTokenSymbol(symbol)
          fetchTotalRewardBalance()
        })
      })
    }
  }, [rewardTokenContract])

  useEffect(() => {
    if (farmContract && address) {
      fetchAvailableReward()
      fetchStakedNfts()
    }
  }, [address, farmContract])

  useEffect(() => {
    if (address && nftContract) {
      fetchIsApproved()
    }
  }, [address, nftContract])

  const initOnWeb3Ready = async () => {
    if (activeWeb3) {
      activeWeb3.eth.getAccounts().then((accounts) => {
        setAddress(accounts[0])
        const _mcContract = new activeWeb3.eth.Contract(MulticallAbi, MULTICALL_CONTRACTS[activeChainId])
        console.log(_mcContract)
        setMcContract(_mcContract)
        const _nftContract = new activeWeb3.eth.Contract(ERC721Abi, nftDropContractAddress)
        setNftContract(_nftContract)
        const _rewardTokenContract = new activeWeb3.eth.Contract(TokenAbi, tokenContractAddress)
        setRewardTokenContract(_rewardTokenContract)
        const _farmContract = new activeWeb3.eth.Contract(FarmAbi, stakingContractAddress)
        setFarmContract(_farmContract)
      }).catch((err) => {
        console.log('>>> initOnWeb3Ready', err)
        processError(err)
      })
    }
  }

  useEffect(() => {
    initOnWeb3Ready()
  }, [activeWeb3])

  async function claimRewards() {
    if (address && farmContract) {
      const sendArgs = await calcSendArgWithFee(address, farmContract, "claimRewards", [])
      farmContract.methods.claimRewards().send(sendArgs).then((res) => {
        fetchAvailableReward()
        fetchTotalRewardBalance()
      }).catch((err) => {
        console.log('>>> claimRewards', err)
        processError(err)
      })
    }
  }

  async function stakeNft(id: BigNumber) {
    if (address && farmContract && nftContract) {
      const _doStake = async () => {
        try {
          const stakeTxData = await calcSendArgWithFee(address, farmContract, "stake", [id])
          farmContract.methods.stake(id).send(stakeTxData).then(() => {
            const _stakedNfts = stakedNfts
            _stakedNfts.push(id)
            setStakedNfts(_stakedNfts)
            setOwnedNfts(ownedNfts.filter((tokenId) => { return tokenId !== id }))
          }).catch((err) => {
            console.log('>> stakeNft', err)
            processError(err)
          })
        } catch (err) {
          console.log('>> stakeNft calc gas', err)
          processError(err)
        }
      }
      if (!isApproved) {
        try {
          const approveTxData = await calcSendArgWithFee(address, nftContract, "setApprovalForAll", [stakingContractAddress, true]);
          nftContract.methods.setApprovalForAll(stakingContractAddress, true).send(approveTxData).then(async (ok) => {
            setIsApproved(true)
            _doStake()
          }).catch((err) => {
            console.log('>> stakeNft do approve', err)
            processError(err)
          })
        } catch (err) {
          console.log('>>> stakeNft do approve calc gas', err)
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
        const sendArgs = await calcSendArgWithFee(address, farmContract, "withdraw", [id])
        farmContract.methods.withdraw(id).send(sendArgs).then((res) => {
          const _ownedNtfs = ownedNfts
          _ownedNtfs.push(id)
          setOwnedNfts(_ownedNtfs)
          setStakedNfts(stakedNfts.filter((tokenId) => { return tokenId !== id }))
        }).catch((err) => {
          console.log('>>> withdraw', err)
          processError(err)
        })
      } catch (err) {
        console.log('>>> withdraw calc gas', err)
        processError(err)
      }
    }
  }

  const connectWithMetamask = async () => {
    await window.ethereum.enable()
    setupWeb3().then((answer) => {
      console.log(answer)
      const {
        activeChainId, web3
      } = answer
      setActiveChainId(activeChainId)
      setActiveWeb3(web3)
    }).catch((err) => {
      console.log(">>>> connectWithMetamask", err)
      processError(err)
    })
  }

  const doStakeCustomNft = () => {
    console.log(customTokenId)
    if (customTokenId) {
      stakeNft(customTokenId)
    }
  }

  const stakeCustomNft = (
    <div>
      <b>TokenId</b>
      <input type="number" onChange={(v) => setCustomTokenId(v.target.value)} />
      <button
        className={`${styles.mainButton} ${styles.spacerBottom}`}
        onClick={doStakeCustomNft}
      >
        {isApproved ? 'Stake' : 'Approve & Stake'}
      </button>
    </div>
  )

  return (
    <div className={styles.container}>
      <nav className={`${styles.mainNav}`}>
        <a href="#">About</a>
        <a href="#">Stake</a>
        <a href="#">Settings</a>
      </nav>
      <hr className={`${styles.divider} ${styles.spacerTop}`} />
      <h1 className={styles.h1}>Stake Your NFTs</h1>

      <hr className={`${styles.divider} ${styles.spacerTop}`} />

      {!address ? (
        <button className={styles.mainButton} onClick={connectWithMetamask}>
          Connect Wallet
        </button>
      ) : (
        <>
          <h2>Your Tokens</h2>

          <div className={styles.tokenGrid}>
            <div className={styles.tokenItem}>
              <h3 className={styles.tokenLabel}>Claimable Rewards</h3>
              <p className={styles.tokenValue}>
                <b>
                  {(!claimableRewards || (rewardTokenDecimals === false) || (rewardTokenSymbol === false))
                    ? "Loading..."
                    : `${ethers.utils.formatUnits(claimableRewards, rewardTokenDecimals)} ${rewardTokenSymbol}`
                  }
                </b>
              </p>
            </div>
            <div className={styles.tokenItem}>
              <h3 className={styles.tokenLabel}>Stake Farm balance</h3>
              <p className={styles.tokenValue}>
                <b>
                  {(rewardTokenBalanceLoading || !rewardTokenBalance || (rewardTokenDecimals === false) || (rewardTokenSymbol === false))
                    ? "Loading..."
                    : `${ethers.utils.formatUnits(rewardTokenBalance, rewardTokenDecimals)} ${rewardTokenSymbol}`
                  }
                </b>
              </p>
            </div>
          </div>

          <hr className={`${styles.divider} ${styles.spacerTop}`} />
          <b>Connected wallet {address}</b>
          <button
            className={`${styles.mainButton} ${styles.spacerTop}`}
            onClick={() => claimRewards()}
          >
            Claim Rewards
          </button>

          <hr className={`${styles.divider} ${styles.spacerTop}`} />

          <h2>Your Staked NFTs</h2>
          <div className={styles.nftBoxGrid}>
            {stakedNftsLoading ? (
              <p className={styles.tokenValue}>
                <b>Loading...</b>
              </p>
            ) : (
              <>
                {stakedNfts.length > 0 ? (
                  <>
                    {stakedNfts?.map((tokenId) => (
                      <div className={styles.nftBox} key={tokenId.toString()}>
                        {/*
                        <ThirdwebNftMedia
                          metadata={nft.metadata}
                          className={styles.nftMedia}
                        />
                        */}
                        <h3>#{tokenId}</h3>
                        <button
                          className={`${styles.mainButton} ${styles.spacerBottom}`}
                          onClick={() => withdraw(tokenId)}
                        >
                          Withdraw
                        </button>
                      </div>
                    ))}
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
          <h2>Your Unstaked NFTs</h2>
          {stakeCustomNft}
          <div className={styles.nftBoxGrid}>
            {ownedNftsLoading ? (
              <p className={styles.tokenValue}>
                <b>Loading...</b>
              </p>
            ) : (
              <>
                {ownedNfts.length > 0 ? (
                  <>
                    {ownedNfts?.map((tokenId) => (
                      <div className={styles.nftBox} key={tokenId.toString()}>
                        {/*
                        <ThirdwebNftMedia
                          metadata={nft.metadata}
                          className={styles.nftMedia}
                        />
                        */}
                        <h3>#{tokenId}</h3>
                        <button
                          className={`${styles.mainButton} ${styles.spacerBottom}`}
                          onClick={() => stakeNft(tokenId)}
                        >
                          {isApproved ? 'Stake' : 'Approve & Stake'}
                        </button>
                      </div>
                    ))}
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
    </div>
  );
};

export default Stake;
