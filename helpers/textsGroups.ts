export const textsGroups = [
  {
    title: `Main options`,
    items: [
      {
        code: `App_Title`,
        desc: `Application title`,
        value: `NFTStake - Stake NFT - earn ERC20`,
      },
      {
        code: `App_Description`,
        desc: `Application desctiption`,
        value: `NFTStake - Stake NFT - earn ERC20`,
      },
      {
        code: `App_Keywords`,
        desc: `Application keywords`,
        value: `NFT, Stake, ERC20, Blockchain`,
      },
      {
        code: `App_Footer`,
        desc: `Footer text`,
        multiline: true,
        markdown: true,
        value: `Powered by OnOut - [no-code tool to create NFTStake](https://onout.org/nftstake/)`
      }
    ]
  },
  {
    title: `Index page`,
    items: [
      {
        code: `MainPage_Header`,
        desc: `Index page title`,
        value: `Stake NFT - earn ERC20`,
      },
      {
        code: `MainPage_Mint_Title`,
        desc: `Mint section title`,
        value: `Mint demo NFT`,
      },
      {
        code: `MainPage_Mint_Desc`,
        desc: `Mint section desctiption`,
        value: `Use the NFT Drop Contract to claim an NFT from the collection.`,
        markdown: true,
        multiline: true,
      },
      {
        code: `MainPage_Stake_Title`,
        desc: `Stake section title`,
        value: `Stake Your NFTs`,
      },
      {
        code: `MainPage_Stake_Desc`,
        desc: `Stake section desctiption`,
        value: `By locking up NFTs on a platform, you can receive rewards depending on the annual interest rate, the staking duration, and the number of NFTs staked`,
        multiline: true,
        markdown: true,
      }
    ],
  },
  {
    title: `Mint page`,
    items: [
      {
        code: `MintPage_Title`,
        desc: `Mint page title`,
        value: `Mint Demo NFTs for test`,
      },
      {
        code: `MintPage_Managed_PriceInfo`,
        desc: `Info about mint price (%amount%, %currency%)`,
        value: `Mint price is %amount% %currency%`,
        multiline: true,
        markdown: true,
      }
    ]
  },
  {
    title: `Stake page`,
    items: [
      {
        code: `StakePage_Title`,
        desc: `Stake page title`,
        value: `Stake Your NFTs - Earn ERC20`
      }
    ],
  },
]

const prepareTextsGroups = () => {
  const _ret = {}
  Object.keys(textsGroups).forEach((k) => {
    Object.keys(textsGroups[k].items).forEach((kk) => {
      const _item = textsGroups[k].items[kk]
      _ret[_item.code] = _item
    })
  })
  
  return _ret;
}

export const TEXTS_GROUPS_ITEMS = prepareTextsGroups()
