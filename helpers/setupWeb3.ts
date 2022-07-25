import Web3 from 'web3'
import { AVAILABLE_NETWORKS_INFO } from './constants'

const switchOrAddChain = async (neededChainId) => {
  const {
    chainId,
    chainName,
    rpcUrls,
    blockExplorerUrls,
    nativeCurrency,
  } = getChainInfoById(neededChainId)

  const params = [
    {
      chainId,
      chainName,
      rpcUrls,
      blockExplorerUrls,
      nativeCurrency,
    }
  ]

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${Number(chainId).toString(16)}` }],
    });
  } catch (switchError) {
    // This error code indicates that the chain has not been added to MetaMask.
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params,
        });
      } catch (addError) {
        // handle "add" error
      }
    } else {
      console.error('Switch chain error: ', switchError.message)
    }

  }
}

const getChainInfoById = (chainId: string) => AVAILABLE_NETWORKS_INFO.find(networkInfo => networkInfo.networkVersion === chainId)

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


export {
  switchOrAddChain,
  setupWeb3
}

export default setupWeb3
