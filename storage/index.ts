import { useStorageContract } from './useContract'
import { useEffect, useState } from 'react'
import { getCurrentDomain } from "../helpers/getCurrentDomain"
import { getConnectedAddress } from "../helpers/setupWeb3"

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

const parseInfo = (info) => {
  const parsed = {
    chainId: '',
    nftCollection: '',
    rewardToken: '',
    farmContract: '',
    texts: {}
  }
  const result = JSON.parse(info)

  Object.keys(parsed).forEach((optKey) => {
    if (result[optKey]) parsed[optKey] = result[optKey]
  })
  return parsed
}

export default function useStorage() {
  const [storageData, setStorageData] = useState(null)
  const [storageIsLoading, setStorageIsLoading] = useState(true)
  const [storageTexts, setStorageTexts] = useState({})
  const [isOwner, setIsOwner] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [error, setError] = useState(null)

  const storage = useStorageContract(97)
  
  const [ doReloadStorage, setDoReloadStorage ] = useState(true)

  useEffect(() => {
    if (doReloadStorage) {
      const fetchData = async () => {
        if (!storage) {
          console.log('>>> no storage')
          return
        }
        
        setError(null)
        setStorageIsLoading(true)
        
        let parsed: any
        let owner

        try {
          storageData = await storage.methods.getData(getCurrentDomain()).call()
          parsed = parseInfo(storageData.info || '{}')
        } catch (error) {
          console.log('>>> error', error)
          setError(error)
        }
        console.log('>>> storageData parsed', parsed)
        if (parsed) {
          const { owner } = storageData

          const isBaseConfigReady = (
            parsed.chainId !== ''
            && parsed.nftCollection !== ''
            && parsed.rewardToken !== ''
            && parsed.farmContract !== ''
          )

          setStorageData({
            ...parsed,
            owner: owner === ZERO_ADDRESS ? '' : owner,
            isBaseConfigReady,
            isInstalled: !(owner === ZERO_ADDRESS),
          })
          setIsInstalled(!(owner === ZERO_ADDRESS))
          setStorageTexts(parsed.texts)
          const connectedWallet = await getConnectedAddress()
          if (connectedWallet && connectedWallet.toLowerCase() === owner.toLowerCase()) {
            setIsOwner(true)
          }
        }
        
        setStorageIsLoading(false)
      }
      fetchData()
      setDoReloadStorage(false)
    }
  }, [ doReloadStorage ])

  return {
    storageIsLoading,
    storageData,
    isOwner,
    isInstalled,
    error,
    storageTexts,
    setDoReloadStorage,
  }
}