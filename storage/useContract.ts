import { useMemo } from 'react'
import Web3 from 'web3'
import STORAGE from '../contracts/Storage.json'
import { getStorageInfo } from "./"

export function useStorageContract(): Contract | null {
  try {
    const {
      storageRpc,
      storageAddress,
    } = getStorageInfo()
    const web3 = new Web3(storageRpc)

    return new web3.eth.Contract(STORAGE.abi, storageAddress)
  } catch (error) {
    console.error('Failed to get Storage contract', error)
  }

  return null

}