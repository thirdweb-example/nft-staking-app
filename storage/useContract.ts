import { useMemo } from 'react'
import Web3 from 'web3'
import STORAGE from '../contracts/Storage.json'


const storageChainId = 5
const storageRpc = 'https://goerli.infura.io/v3/5ffc47f65c4042ce847ef66a3fa70d4c'
const storageAddress = '0xafb8f27df1f629432a47214b4e1674cbcbdb02df' // 5
// '0xF0BCf27a2203E7E8c1e9D36F40EF2C5A8a6E7D0B' BSC testnet
// 0xa7472f384339D37EfE505a1A71619212495A973A  BSC mainnet

export function useStorageContract(chainId: number): Contract | null {
  if (!chainId) return null

  try {
    const web3 = new Web3(storageRpc)

    return new web3.eth.Contract(STORAGE.abi, storageAddress)
  } catch (error) {
    console.error('Failed to get Storage contract', error)
  }

  return null

}