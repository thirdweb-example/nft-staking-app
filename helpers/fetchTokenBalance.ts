import TokenAbi from 'human-standard-token-abi'
import Web3 from 'web3'
import { toWei, fromWei } from "./wei"
import { CHAIN_INFO } from "../helpers/constants"

const fetchTokenBalance = (wallet, tokenAddress, chainId) => {
  return new Promise((resolve, reject) => {
    const chainInfo = CHAIN_INFO(chainId)
    if (chainInfo) {
      try {
        const web3 = new Web3(chainInfo.rpcUrls[0])

        const contract = new web3.eth.Contract(TokenAbi, tokenAddress)
        contract.methods.decimals().call().then((decimals) => {
          contract.methods.balanceOf(wallet).call().then((balance) => {
            const normalized = fromWei(balance, decimals)
            resolve({
              wallet,
              tokenAddress,
              chainId,
              decimals,
              wei: balance,
              normalized,
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

export default fetchTokenBalance