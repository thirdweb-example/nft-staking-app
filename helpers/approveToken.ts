import TokenAbi from 'human-standard-token-abi'
import Web3 from 'web3'

import { CHAIN_INFO } from "../helpers/constants"
import { calcSendArgWithFee } from "./calcSendArgWithFee"
import { BigNumber } from 'bignumber.js'

const approveToken = (options) => {
  return new Promise((resolve, reject) => {
    const {
      activeWeb3,
      chainId,
      tokenAddress,
      approveFor,
      weiAmount
    } = options

    const onTrx = options.onTrx || (() => {})
    const onSuccess = options.onSuccess || (() => {})
    const onError = options.onError || (() => {})
    const onFinally = options.onFinally || (() => {})

    activeWeb3.eth.getAccounts().then(async (accounts) => {
      if (accounts.length>0) {
        const activeWallet = accounts[0]
        const contract = new activeWeb3.eth.Contract(TokenAbi, tokenAddress)

        const sendArgs = await calcSendArgWithFee(
          activeWallet,
          contract,
          'approve',
          [ approveFor, weiAmount ]
        )

        contract.methods['approve'](...([ approveFor, weiAmount ]))
          .send(sendArgs)
          .on('transactionHash', (hash) => {
            console.log('transaction hash:', hash)
            onTrx(hash)
          })
          .on('error', (error) => {
            console.log('transaction error:', error)
            onError(error)
            reject(error)
          })
          .on('receipt', (receipt) => {
            console.log('transaction receipt:', receipt)
            onSuccess(receipt)
          })
          .then((res) => {
            resolve(res)
            onFinally(res)
          })
      } else {
        reject('NO_ACTIVE_ACCOUNT')
      }
    }).catch((err) => {
      console.log('>>> approveToken', err)
      reject(err)
    })
  })
        
}


export default approveToken