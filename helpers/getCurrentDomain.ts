export function getCurrentDomain() {
  //return 'shendel.github.io'
  return window.location.hostname || document.location.host || ''
}