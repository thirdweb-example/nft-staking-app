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
        code: `MainPage_AfterTitle`,
        desc: `Text block after title`,
        value: `**hello**`,
        markdown: true,
        multiline: true,
      },
      {
        code: `MainPage_AfterSections`,
        desc: `Text block after sections`,
        value: `**hello**`,
        markdown: true,
        multiline: true,
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
        code: 'StakePage_BeforeConnect_Text',
        desc: 'Text before connect wallet button',
        value: '**hello**',
        multiline: true,
        markdown: true,
      },
      {
        code: 'StakePage_AfterConnect_Text',
        desc: 'Text after connect wallet button',
        value: '**hello**',
        multiline: true,
        markdown: true,
      },
      {
        code: `MintPage_TextBeforePrice`,
        desc: 'Text before Price block',
        value: '**hello**',
        multiline: true,
        markdown: true,
      },
      {
        code: `MintPage_Managed_PriceInfo`,
        desc: `Info about mint price (%amount%, %currency%)`,
        value: `Mint price is %amount% %currency%`,
        multiline: true,
        markdown: true,
      },
      {
        code: 'MintPage_TextAfterPrice',
        desc: 'Text after Price block',
        value: '**hello**',
        multiline: true,
        markdown: true,
      }
    ]
  },
  {
    title: `Stake page`,
    items: [
      {
        code: 'StakePage_BeforeConnect_Text',
        desc: 'Text before connect wallet button',
        value: '**hello**',
        multiline: true,
        markdown: true,
      },
      {
        code: 'StakePage_AfterConnect_Text',
        desc: 'Text after connect wallet button',
        value: '**hello**',
        multiline: true,
        markdown: true,
      },
      {
        code: `StakePage_Title`,
        desc: `Stake page title`,
        value: `Stake Your NFTs - Earn ERC20`
      },
      {
        code: 'StakePage_BeforeYourReward_Text',
        desc: 'Text before label "Your reward"',
        value: '**hello**',
        multiline: true,
        markdown: true,
      },
      {
        code: 'StakePage_YourRewardLabel',
        desc: 'Label "Your reward"',
        value: 'Your reward',
      },
      {
        code: 'StakePage_AfterYourReward_Text',
        desc: 'Text after label "Your reward"',
        value: '**hello**',
        multiline: true,
        markdown: true,
      },
      {
        code: 'StakePage_YourStakedNfts',
        desc: 'Label "Your Staked NFTs"',
        value: 'Your Staked NFTs',
      },
      {
        code: 'StakePage_YourStakedNfts_Desc',
        desc: 'Text after "Your Staked NFTs"',
        value: '**hello**',
        multiline: true,
        markdown: true
      },
      {
        code: 'StakePage_YourUnStakedNfts',
        desc: 'Label "Your Unstaked NFTs"',
        value: 'Your Unstaked NFTs',
      },
      {
        code: 'StakePage_YourUnStakedNfts_Desc',
        desc: 'Text after "Your Unstaked NFTs"',
        value: '**hello**',
        multiline: true,
        markdown: true
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
