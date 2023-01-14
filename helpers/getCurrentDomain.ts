export function getCurrentDomain() {
  return window.location.hostname || document.location.host || ''
}