export const getLink = (url) => {
  if (url == `index`) {
    return (process.env.NODE_ENV && process.env.NODE_ENV !== 'production') ? `/_MYAPP/` : `./index.html`
  }
  return (process.env.NODE_ENV && process.env.NODE_ENV !== 'production') ? `/_MYAPP/${url}` : `./${url}.html`
}

export const sysMenus = {
  HOME: `index`,
  MINT: `mint`,
  MARKETPLACE: `marketplace`,
  STAKE: `stake`
}

export const defMenus = [
  {
    title: 'Home',
    target: 'HOME',
    link: '',
    blank: false,
  },
  {
    title: 'Mint NFT',
    target: 'MINT',
    link: '',
    blank: false
  },
  {
    title: 'Marketplace',
    target: 'MARKETPLACE',
    link: '',
    blank: false
  },
  {
    title: 'Stake',
    target: 'STAKE',
    link: '',
    blank: false
  }
]