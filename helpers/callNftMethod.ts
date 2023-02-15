import NftContractData from "../contracts/source/artifacts/StakeNFT.json"
import Web3 from 'web3'
import { calcSendArgWithFee } from "./calcSendArgWithFee"
import { BigNumber } from 'bignumber.js'

const callNftMethod = (options) => {
  return new Promise((resolve, reject) => {
    const {
      activeWeb3,
      contractAddress,
      method,
      args,
      weiAmount
    } = options
    const onTrx = options.onTrx || (() => {})
    const onSuccess = options.onSuccess || (() => {})
    const onError = options.onError || (() => {})
    const onFinally = options.onFinally || (() => {})

    activeWeb3.eth.getAccounts().then(async (accounts) => {
      if (accounts.length>0) {
        const activeWallet = accounts[0]
        const nftContract = new activeWeb3.eth.Contract(NftContractData.abi, contractAddress)

        console.log('>> amount', weiAmount)
        const sendArgs = await calcSendArgWithFee(
          activeWallet,
          nftContract,
          method,
          args || [],
          weiAmount
        )
        const gasPrice = await activeWeb3.eth.getGasPrice()
        sendArgs.gasPrice = gasPrice
        console.log('>> amount 2', weiAmount, sendArgs)

        nftContract.methods[method](...(args || []))
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
      console.log('>>> callNftMethod', err)
      reject(err)
    })
  })
        
}


export default callNftMethod