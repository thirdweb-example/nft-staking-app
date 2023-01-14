import FarmContractData from "../contracts/source/artifacts/Farm.json"
import FarmAbi from '../contracts/FarmAbi.json'
import { calcSendArgWithFee } from "./calcSendArgWithFee"
import { BigNumber } from 'bignumber.js'

const deployFarmContract = (options) => {
  return new Promise((resolve, reject) => {
    const {
      activeWeb3,
      nftCollection,
      rewardsToken,
      rewardsPerHour,
    } = options
    const onTrx = options.onTrx || (() => {})
    const onSuccess = options.onSuccess || (() => {})
    const onError = options.onError || (() => {})
    const onFinally = options.onFinally || (() => {})

    activeWeb3.eth.getAccounts().then(async (accounts) => {
      if (accounts.length>0) {
        const activeWallet = accounts[0]
        const farmContract = new activeWeb3.eth.Contract(FarmAbi)

        const txArguments = {
          from: activeWallet,
          gas: '0'
        }

        const gasAmountCalculated = await farmContract.deploy({
          arguments: [ nftCollection, rewardsToken, rewardsPerHour ],
          data: FarmContractData.data.bytecode.object
        }).estimateGas(txArguments)

        const gasAmounWithPercentForSuccess = new BigNumber(
          new BigNumber(gasAmountCalculated)
            .multipliedBy(1.05) // + 5% -  множитель добавочного газа, если будет фейл транзакции - увеличит (1.05 +5%, 1.1 +10%)
            .toFixed(0)
        ).toString(16)

        txArguments.gas = '0x' + gasAmounWithPercentForSuccess

        farmContract.deploy({
          data: '0x' + FarmContractData.data.bytecode.object,
          arguments: [ nftCollection, rewardsToken, rewardsPerHour ],
        })
          .send(txArguments)
          .on('transactionHash', (hash) => {
            console.log('transaction hash:', hash)
            onTrx(hash)
          })
          .on('error', (error) => {
            console.log('transaction error:', error)
            onError(error)
          })
          .on('receipt', (receipt) => {
            console.log('transaction receipt:', receipt)
            onSuccess(receipt.contractAddress)
          })
          .then(() => {
            onFinally()
          })
      } else {
        reject('NO_ACTIVE_ACCOUNT')
      }
    }).catch((err) => {
      console.log('>>> initOnWeb3Ready', err)
      reject(err)
    })
  })
}

export default deployFarmContract