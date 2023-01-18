import NftContractData from "../contracts/source/artifacts/StakeNFT.json"
import Web3 from 'web3'
import MulticallAbi from '../contracts/MulticallAbi.json'

import { MULTICALL_CONTRACTS } from './constants'
import { Interface as AbiInterface } from '@ethersproject/abi'


import { CHAIN_INFO } from "./constants"

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
                const abiI = new AbiInterface(NFTAbi)
                const encode = (method, args = []) => {
                  return abiI.encodeFunctionData(method, args)
                }
                const prepareCall = (key, method, args = [], isBigNumber) => {
                  return {
                    target: address,
                    key,
                    method,
                    isBigNumber,
                    callData: encode(method, args)
                  }
                }
                // Fetch all info with multicall
                const _mc = new web3.eth.Contract(MulticallAbi, MULTICALL_CONTRACTS[chainId])
          
                const _calls = [
                  prepareCall('owner', 'owner'),
                  prepareCall('totalSupply', 'totalSupply', [], true),
                  prepareCall('MAX_SUPPLY', 'MAX_SUPPLY', [], true),
                  prepareCall('allowMint', 'getAllowMint'),
                  prepareCall('allowTrade', 'getAllowTrade'),
                  prepareCall('mintPrice', 'getMintPrice', [], true),
                  prepareCall('mintUris', 'getMintUris'),
                  prepareCall('tokensAtSale', 'getTokensAtSell'),
                  prepareCall('version', 'version', [], true)
                ]

                const moreInfo = {}
                _mc.methods.aggregate(_calls).call().then((_answers) => {
                  _answers.returnData.forEach((retData, _indexInCall) => {
                    const answer = abiI.decodeFunctionResult(
                      _calls[_indexInCall].method,
                      retData
                    )[0]

                    moreInfo[_calls[_indexInCall].key] = (_calls[_indexInCall].isBigNumber)
                      ? `${answer}`
                      : answer
                  })
                  console.log('>>> moreInfo', moreInfo)
                  resolve({
                    ...baseInfo,
                    isNFTStakeToken: true,
                    NFTStakeInfo: moreInfo,
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