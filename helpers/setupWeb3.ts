import Web3 from 'web3'
import { AVAILABLE_NETWORKS_INFO } from './constants'


const setupWeb3 = () => new Promise((resolve, reject) => {
  if (window.ethereum) {
    // @ts-ignore
    const activeChainId = window.ethereum && window.ethereum.networkVersion
    const activeNetworkExists = AVAILABLE_NETWORKS_INFO.filter((netInfo) => {
      return netInfo.networkVersion == activeChainId
    })

    if (activeNetworkExists.length) {
      const activeNetwork = activeNetworkExists[0]

      // @ts-ignore
      const web3 = new Web3(window.ethereum || Web3.givenProvider || new Web3.providers.HttpProvider(activeNetwork.rpcUrls))

      if (web3) {
        resolve({
          activeChainId,
          web3
        })
      } else {
        reject('FAIL_SETUP_WEB3')
      }
    }
  } else {
    reject('NOT_INSTALLED')
  }
})


export default setupWeb3
