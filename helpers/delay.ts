export const delay = (ms) => {
  return new Promise((resolve) => {
    window.setTimeout(() => { resolve() }, ms)
  })
}