const IPFS_GATEWAY = `https://skywalker.infura-ipfs.io/ipfs/` //`https://ipfs.io/ipfs/`

export const ipfsUrl = (url) => {
  if (url.startsWith(`ipfs://`)) {
    return `${IPFS_GATEWAY}${url.substring(7)}`
  }
  return url
}