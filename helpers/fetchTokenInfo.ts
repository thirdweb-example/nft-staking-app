import TokenAbi from 'human-standard-token-abi'
import Web3 from 'web3'

import { CHAIN_INFO } from "../helpers/constants"

const fetchTokenInfo = (address, chainId) => {
  return new Promise((resolve, reject) => {
    const chainInfo = CHAIN_INFO(chainId)
    if (chainInfo) {
      try {
        const web3 = new Web3(chainInfo.rpcUrls[0])

        const contract = new web3.eth.Contract(TokenAbi, address)
        contract.methods.decimals().call().then((decimals) => {
          contract.methods.symbol().call().then((symbol) => {
            contract.methods.name().call().then((name) => {
              resolve({
                address,
                chainId,
                decimals,
                symbol,
                name,
              })
            }).catch((err) => {
              reject(err)
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

export default fetchTokenInfo