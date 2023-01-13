export const getLink = (url) => {
  if (url == `index`) {
    return (process.env.NODE_ENV && process.env.NODE_ENV !== 'production') ? `/NFTFARMBUILDURL/` : `./index.html`
  }
  return (process.env.NODE_ENV && process.env.NODE_ENV !== 'production') ? `/NFTFARMBUILDURL/${url}` : `./${url}.html`
}
