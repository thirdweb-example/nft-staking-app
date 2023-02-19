import { infuraUpload as IpfsUpload } from "./ipfs/infuraUpload"

export const createNftMetadata = (options) => {
  const {
    imageData,
    name,
    desc,
    ownMetadata
  } = {
    ownMetadata: {},
    ...options
  }
  console.log('>> options', options)
  return new Promise((resolve, reject) => {
    console.log(imageData)
    IpfsUpload(imageData).then((imageCid) => {
      const json = {
        image: `ipfs://${imageCid}`,
        name,
        desc,
        ...ownMetadata
      }
      IpfsUpload(JSON.stringify(json)).then((jsonCID) => {
        resolve(`ipfs://${jsonCID}`)
      }).catch((err) => {
        console.log('>>> err', err)
        reject(err)
      })
    }).catch((err) => {
      console.log('>>> err', err)
      reject(err)
    })
  })
}
