import { BigNumber } from 'bignumber.js'
export const calcSendArgWithFee = async (account, contract, method, args) => {
  const txArguments = {
    from: account,
    gas: '0'
  }

  const gasAmountCalculated = await contract.methods
    [method](...args)
    .estimateGas(txArguments)

  const gasAmounWithPercentForSuccess = new BigNumber(
    new BigNumber(gasAmountCalculated)
      .multipliedBy(1.05) // + 5% -  множитель добавочного газа, если будет фейл транзакции - увеличит (1.05 +5%, 1.1 +10%)
      .toFixed(0)
  ).toString(16)

  txArguments.gas = '0x' + gasAmounWithPercentForSuccess
  return txArguments
}