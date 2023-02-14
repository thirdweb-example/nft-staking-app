import {
  INFURA_AUTHORIZATION,
  INFURA_API_ENDPOINT
} from "../../appconfig/ipfsInfura"

import { create as ipfsHttpClient } from "ipfs-http-client"

const InfuraIPFS = ipfsHttpClient({
  url: INFURA_API_ENDPOINT,
  headers: {
    authorization: INFURA_AUTHORIZATION,
  },
})

export const infuraUpload = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log( {
        authorization: INFURA_AUTHORIZATION,
      })
      
      const result = await InfuraIPFS.add(data)
      resolve(result.path)
    } catch (err) {
      reject(err)
    }
  })
}
