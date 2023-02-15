import NftContractData from "../contracts/source/artifacts/DemoNFT.json"
import { calcSendArgWithFee } from "./calcSendArgWithFee"
import { BigNumber } from 'bignumber.js'

const deployDemoNft = (options) => {
  return new Promise((resolve, reject) => {
    const {
      activeWeb3,
    } = options

    const onTrx = options.onTrx || (() => {})
    const onSuccess = options.onSuccess || (() => {})
    const onError = options.onError || (() => {})
    const onFinally = options.onFinally || (() => {})

    activeWeb3.eth.getAccounts().then(async (accounts) => {
      if (accounts.length>0) {
        const activeWallet = accounts[0]
        const nftContract = new activeWeb3.eth.Contract(NftContractData.abi)

        const txArguments = {
          from: activeWallet,
          gas: '0'
        }

        const gasAmountCalculated = await nftContract.deploy({
          arguments: [],
          data: NftContractData.data.bytecode.object
        }).estimateGas(txArguments)

        const gasAmounWithPercentForSuccess = new BigNumber(
          new BigNumber(gasAmountCalculated)
            .multipliedBy(1.05) // + 5% -  множитель добавочного газа, если будет фейл транзакции - увеличит (1.05 +5%, 1.1 +10%)
            .toFixed(0)
        ).toString(16)
        
        const gasPrice = await activeWeb3.eth.getGasPrice()
        txArguments.gasPrice = gasPrice
        txArguments.gas = '0x' + gasAmounWithPercentForSuccess

        nftContract.deploy({
          data: '0x' + NftContractData.data.bytecode.object,
          arguments: [],
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
      console.log('>>> deployDemoNft', err)
      reject(err)
    })
  })
}

export default deployDemoNft