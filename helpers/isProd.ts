const devDomains = [
  'localhost',
  'localhost.nftstake',
  'nftstakedemo.localhost',
  'shendel.github.io',
  'vkmp.localhost'
]

const isProd = () => {
  if (typeof window === 'undefined') return ''
  const curDomain = window.location.hostname || document.location.host || ''
  return devDomains.indexOf(curDomain) === -1
}


export default isProd