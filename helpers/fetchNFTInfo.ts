import NftContractData from "../contracts/source/artifacts/StakeNFT.json"
import Web3 from 'web3'
import MulticallAbi from '../contracts/MulticallAbi.json'

import { MULTICALL_CONTRACTS } from './constants'
import { Interface as AbiInterface } from '@ethersproject/abi'


import { CHAIN_INFO } from "./constants"

import { callMulticall } from './callMulticall'


const fetchNftInfo = (address, chainId) => {
  return new Promise((resolve, reject) => {
    const chainInfo = CHAIN_INFO(chainId)
    const NFTAbi = NftContractData.abi
    if (chainInfo && chainInfo.rpcUrls) {
      try {
        const web3 = new Web3(chainInfo.rpcUrls[0])

        const contract = new web3.eth.Contract(NFTAbi, address)
        contract.methods.symbol().call().then((symbol) => {
          contract.methods.name().call().then((name) => {
            const baseInfo = {
              address,
              chainId,
              symbol,
              name,
            }

            contract.methods.isNFTStakeToken().call().then((isNFTStakeToken) => {
              try {
                console.log('>>> begin')
                const multicall = new web3.eth.Contract(MulticallAbi, MULTICALL_CONTRACTS[chainId])
                const abiI = new AbiInterface(NFTAbi)
                callMulticall({
                  multicall,
                  target: address,
                  encoder: abiI,
                  calls: {
                    owner:            { func: 'owner' },
                    version:          { func: 'version', _isBigNumber: true },
                    totalSupply:      { func: 'totalSupply', _isBigNumber: true },
                    maxSupply:        { func: 'MAX_SUPPLY', _isBigNumber: true },
                    allowMint:        { func: 'getAllowMint' },
                    allowMintOwn:     { func: 'getAllowMintOur' }, // @to-do - fix name in contract
                    mintOwnPrice:     { func: 'getMintOwnPrice', _isBigNumber: true },
                    mintPrice:        { func: 'getMintPrice', _isBigNumber: true },
                    mintUris:         { func: 'getMintUris' },
                    allowTrade:       { func: 'getAllowTrade' },
                    allowUserSale:    { func: 'getAllowUserSale' },
                    tradeFee:         { func: 'getTradeFee', _isBigNumber: true },
                    tokensAtSale:     { func: 'getTokensAtSale' },
                    allowedERC20:     { func: 'getAllowedERC20' },
                    
                  }
                }).then((mcAnswer) => {
                  resolve({
                    ...baseInfo,
                    isNFTStakeToken: true,
                    NFTStakeInfo: mcAnswer,
                  })
                }).catch((err) => {
                  console.log('>>> Fail fetch all NFT info', err)
                  resolve(baseInfo)
                })
              } catch (e) {
                console.log(e)
                resolve(baseInfo)
              }
            }).catch((err) => {
              resolve(baseInfo)
            })
          }).catch((err) => {
            reject(err)
          })
        }).catch((err) => {
          reject(err)
        })
      } catch (err) {
        reject(err)
      }
    } else {
      reject(`NOT_SUPPORTED_CHAIN`)
    }
  })
}

export default fetchNftInfo