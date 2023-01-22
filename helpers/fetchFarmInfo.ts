import FarmContractData from "../contracts/source/artifacts/Farm.json"
import Web3 from 'web3'

import { CHAIN_INFO } from "../helpers/constants"

const fetchFarmInfo = (address, chainId) => {
  return new Promise((resolve, reject) => {
    const chainInfo = CHAIN_INFO(chainId)
    if (chainInfo) {
      try {
        const web3 = new Web3(chainInfo.rpcUrls[0])
        const contract = new web3.eth.Contract(FarmContractData.abi, address)
        contract.methods.nftCollection().call().then((nftCollection) => {
          contract.methods.rewardsToken().call().then((rewardsToken) => {
            contract.methods.owner().call().then((owner) => {
              contract.methods.version().call().then((version) => {
                if (version >= 2) {
                  contract.methods.rewardsPerHour().call().then( async (rewardsPerHour) => {
                    if (version >=3) {
                      try {
                        const lockEnabled = await contract.methods.lockEnabled().call()
                        const lockTime = await contract.methods.lockTime().call()
                        resolve({
                          address,
                          chainId,
                          nftCollection,
                          rewardsToken,
                          owner,
                          version,
                          rewardsPerHour,
                          lockEnabled,
                          lockTime,
                        })
                      } catch (err) {
                        reject(err)
                      }
                    } else {
                      resolve({
                        address,
                        chainId,
                        nftCollection,
                        rewardsToken,
                        owner,
                        version,
                        rewardsPerHour,
                      })
                    }
                  }).catch((err) => {
                    reject(err)
                  })
                } else {
                  resolve({
                    address,
                    chainId,
                    nftCollection,
                    rewardsToken,
                    owner,
                    version,
                  })
                }
              }).catch((err) => {
                reject(err)
              })
            }).catch((err) => {
              reject(err)
            })
          }).catch((err) => {
            reject(err)
          })
        }).catch((err) => {
          reject(err)
        })
      } catch (err) {
        reject(err)
      }
    } else {
      reject(`NOT_SUPPORTED_CHAIN`)
    }
  })
}

export default fetchFarmInfo