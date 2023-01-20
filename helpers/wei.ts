import { BigNumber, ethers } from "ethers"

export const fromWei = (amount, decimals) => {
  return ethers.utils.formatUnits(amount, decimals)
}

export const toWei = (amount, decimals) => {
  return ethers.utils.parseUnits(`${amount}`, decimals)
}