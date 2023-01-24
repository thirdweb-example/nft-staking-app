import NftContractData from "../contracts/source/artifacts/StakeNFT.json"
import { calcSendArgWithFee } from "./calcSendArgWithFee"
import { BigNumber } from 'bignumber.js'

const deployNft = (options) => {
  return new Promise((resolve, reject) => {
    const {
      activeWeb3,
      symbol,
      name,
      maxSupply,
      allowTrade,
      allowUserSale,
      allowedERC20,
      tradeFee,
      allowMint,
      mintPrice,
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

/*
maxSupply: nftMaxSupply,
allowTrade: (nftAllowTrade == 1),
allowUserSale: (nftAllowUserSale == 1),
tradeFee: nftTradeFee,
allowedERC20: nftAllowedERC20,
allowMint: (nftAllowMint == 1),
mintPrice: toWei(`${nftMintPrice}`, 18)

string memory __symbol,
string memory __name,
uint256 __maxSupply,
uint256 __mintPrice,
bool __allowTrade,
bool __allowUserSale,
uint __tradeFee,
bool __allowMint,
address[] memory _erc20fortrade
*/
        const _arguments = [
          symbol,
          name,
          maxSupply,
          mintPrice,
          allowTrade,
          allowUserSale,
          tradeFee,
          allowMint,
          allowedERC20
        ]
console.log('>> _arguments', _arguments)
        const gasAmountCalculated = await nftContract.deploy({
          arguments: _arguments,
          data: NftContractData.data.bytecode.object
        }).estimateGas(txArguments)

        const gasAmounWithPercentForSuccess = new BigNumber(
          new BigNumber(gasAmountCalculated)
            .multipliedBy(1.05) // + 5% -  множитель добавочного газа, если будет фейл транзакции - увеличит (1.05 +5%, 1.1 +10%)
            .toFixed(0)
        ).toString(16)

        txArguments.gas = '0x' + gasAmounWithPercentForSuccess

        nftContract.deploy({
          data: '0x' + NftContractData.data.bytecode.object,
          arguments: _arguments,
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
      console.log('>>> deployNft', err)
      reject(err)
    })
  })
}

export default deployNft