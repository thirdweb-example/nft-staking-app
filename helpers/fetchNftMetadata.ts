import  fetch from "node-fetch"
import { ipfsUrl } from "../helpers/ipfsUrl"

export const fetchNftMetadata = (url) => {
  return new Promise((resolve, reject) => {
    fetch(ipfsUrl(url))
      .then((res) => {
        return res.text()
      })
      .then((text) => {
        try {
            // UTF-8 BOM
          return JSON.parse(text.slice(1))
        } catch (e) {
          try {
            return JSON.parse(text)
          } catch (e) {
            reject(e)
          }
        }
      })
      .then((json) => {
        if (json && json.image) json.image = ipfsUrl(jsom.image)
        resolve(json)
      })
      .catch((err) => {
        reject(err)
      })
  })
}
