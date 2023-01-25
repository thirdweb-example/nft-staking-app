import ERC721Abi from '../contracts/ERC721Abi.json'
import { CHAIN_INFO } from "./constants"
import { callMulticallGroup } from './callMulticall'
import MulticallAbi from '../contracts/MulticallAbi.json'
import { MULTICALL_CONTRACTS } from './constants'
import { Interface as AbiInterface } from '@ethersproject/abi'
import Web3 from 'web3'

const fetchUserNfts = (options) => {
  return new Promise( async (resolve, reject) => {
    const {
      chainId,
      walletAddress,
      nftAddress,
    } = options
    
    const chainInfo = CHAIN_INFO(chainId)
    if (chainInfo) {
      const web3 = new Web3(chainInfo.rpcUrls[0])

      const nftContract = new web3.eth.Contract(ERC721Abi, nftAddress)
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
      if (hasMaxSupply || hasTotalSupply) {
        const multicall = new web3.eth.Contract(MulticallAbi, MULTICALL_CONTRACTS[chainId])
        const abiI = new AbiInterface(ERC721Abi)
        const calls = []
        
        for (let checkTokenId = 1; checkTokenId<=((hasTotalSupply) ? totalSupply : maxSupply); checkTokenId++) {
          calls.push({
            group: checkTokenId,
            func: `ownerOf`,
            args: [ checkTokenId ],
            encoder: abiI,
            target: nftAddress,
          })
          calls.push({
            group: checkTokenId,
            func: `tokenURI`,
            args: [ checkTokenId ],
            encoder: abiI,
            target: nftAddress,
          })
        }
        callMulticallGroup({
          multicall,
          calls,
        }).then((mcAnswer) => {
          const userNfts = Object.keys(mcAnswer).map((tokenId) => {
            return {
              tokenId,
              ...mcAnswer[tokenId],
            }
          }).filter((tokenInfo) => {
            return (tokenInfo.ownerOf.toLowerCase() == walletAddress.toLowerCase())
          })
          resolve(userNfts)
        }).catch((err) => {
          console.log('>> err', err)
          reject(err)
        })
      } else {
        reject('NOT SUPPORTED')
      }
    } else {
      reject('UNKNOWN CHAIN')
    }
  })
}

export default fetchUserNfts