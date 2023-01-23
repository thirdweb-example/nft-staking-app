import { BigNumber } from 'bignumber.js'
export const calcSendArgWithFee = async (account, contract, method, args, weiAmount) => {
  const txArguments = {
    from: account,
    gas: '0'
  }

  if (weiAmount) txArguments.value = new BigNumber(weiAmount)

  const gasAmountCalculated = await contract.methods
    [method](...args)
    .estimateGas(txArguments)

  const gasAmounWithPercentForSuccess = new BigNumber(
    new BigNumber(gasAmountCalculated)
      .multipliedBy(1.15) // + 15% -  множитель добавочного газа, если будет фейл транзакции - увеличит (1.05 +5%, 1.1 +10%)
      .toFixed(0)
  ).toString(16)

  txArguments.gas = '0x' + gasAmounWithPercentForSuccess
  return txArguments
}