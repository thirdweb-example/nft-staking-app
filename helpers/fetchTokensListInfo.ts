import TokenAbi from 'human-standard-token-abi'
import { callMulticallGroup } from './callMulticall'
import MulticallAbi from '../contracts/MulticallAbi.json'
import { MULTICALL_CONTRACTS } from './constants'
import { Interface as AbiInterface } from '@ethersproject/abi'
import { CHAIN_INFO } from "./constants"
import Web3 from 'web3'


const fetchTokensListInfo = (options) => {
  const {
    erc20list,
    chainId,
    withAllowance,
  } = options

  const {
    allowanceFrom,
    allowanceTo
  } = withAllowance || {}

  return new Promise((resolve, reject) => {
    const chainInfo = CHAIN_INFO(chainId)
    if (chainInfo) {
      try {
        const web3 = new Web3(chainInfo.rpcUrls[0])
        const multicall = new web3.eth.Contract(MulticallAbi, MULTICALL_CONTRACTS[chainId])
        const abiI = new AbiInterface(TokenAbi)

        let calls = []
        erc20list.forEach((erc20address) => {
          calls = [
            ...calls,
            {
              group: erc20address,
              func: `name`,
              encoder: abiI,
              target: erc20address
            },
            {
              group: erc20address,
              func: `symbol`,
              encoder: abiI,
              target: erc20address
            },
            {
              group: erc20address,
              func: `decimals`,
              encoder: abiI,
              target: erc20address
            },
            ...(withAllowance ? [
              {
                group: erc20address,
                func: `allowance`,
                args: [ allowanceFrom, allowanceTo ],
                encoder: abiI,
                target: erc20address,
              }
            ] : [])
          ]
        })
        callMulticallGroup({
          multicall,
          calls,
        }).then((mcAnswer) => {
          resolve(mcAnswer)
        }).catch((err) => {
          console.log('>>> err', err)
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

export default fetchTokensListInfo