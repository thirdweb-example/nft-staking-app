export default function StorageStyles(options) {
  const { getDesign } = options;
  const _d = getDesign
  
  const getBodyBgImage = () => {
    const bgImage = getDesign('backgroundImage', 'uri')
    if (bgImage) {
      return `
        background-image: url(${bgImage});
        background-position: center;
        background-repeat: no-repeat;
        background-size: cover;
      `
    } else return ``
  }
  return (
    <style>
      {`
         BODY {
          background: ${getDesign('backgroundColor', 'color')};
          color: ${getDesign('baseTextColor', 'color')};
          ${getBodyBgImage()}
        }
        .logoAddParams A IMG {
          max-width: ${getDesign('logoMaxWidth', 'int')}px;
        }
        .headerNavMenu {
          background: ${getDesign('navMenuBgColor', 'color')};
          border-color: ${getDesign('navMenuBottomLineColor', 'color')};
          border-bottom-width: ${getDesign('navMenuBottomLineSize', 'int')}px;
        }
        .headerNavMenu A {
          color: ${getDesign('navMenuColor', 'color')};
        }
        .headerNavMenu A:hover {
          color: ${getDesign('navMenuHoverColor', 'color')};
        }
        .headerNavMenu A.headerNavActive,
        .headerNavMenu A.headerNavActive:hover {
          color: ${getDesign('navMenuActiveColor', 'color')};
        }
        .mainFooter {
          background: ${getDesign('footerBgColor', 'color')};
          color: ${getDesign('footerTextColor', 'color')};
          border-color: ${getDesign('footerTopLineColor', 'color')};
          border-top-width: ${getDesign('footerTopLineSize', 'int')}px;
        }
        .mainFooter A {
          color: ${getDesign('footerLinkColor', 'color')};
        }
        .mainFooter A:hover {
          color: ${getDesign('footerLinkHoverColor', 'color')};
        }
        .mainFooter {
          
        }
        HR {
          border-color: ${getDesign('hrColor', 'color')} !important;
        }
        .primaryButton {
          background-image: linear-gradient(
            to left,
            ${getDesign('prButtonBg1', 'color')} 0%,
            ${getDesign('prButtonBg2', 'color')} 101.52%
          );
          color: ${getDesign('prButtonColor', 'color')};
          border-radius: ${getDesign('prButtonBorderRadius', 'int')}px;
        }
        .primaryButton[disabled],
        .primaryButton[disabled]:hover {
          background: ${getDesign('prButtonDisabledBg', 'color')};
          color: ${getDesign('prButtonDisabledColor', 'color')};
        }
        .mainPageSection {
          background: ${getDesign('mainPageSectionBackground', 'color')};
          border-color: ${getDesign('mainPageSectionBorderColor', 'color')};
        }
        .mainPageSection>A>H2 {
          color: ${getDesign('mainPageSectionTitleColor', 'color')};
        }
        .mainPageSection>A>P {
          color: ${getDesign('mainPageSectionDescColor', 'color')};
        }
        
        .nftTokenBox {
          background: ${getDesign('nftBackgroundColor', 'color')};
          border-color: ${getDesign('nftBorderColor', 'color')};
          border-radius: ${getDesign('nftBorderRadius', 'int')}px;
          border-width: ${getDesign('nftBorderSize')}px;
        }
        .nftTokenBox H3 {
          color: ${getDesign('nftIdColor', 'color')};
        }
        .nftTokenBox IMG {
          max-height: ${getDesign('nftMaxHeight', 'int')}px;
        }
        
        .stakeRewardAndBank {
          background: ${getDesign('stakeRewardBackground', 'color')};
          border-color: ${getDesign('stakeRewardBorderColor', 'color')};
          border-width: ${getDesign('stakeRewardBorderSize', 'int')}px;
          border-radius: ${getDesign('stakeRewardBorderRadius', 'int')}px;
        }
        .stakeRewardAndBank H3 {
          color: ${getDesign('stakeRewardTitleColor', 'color')};
        }
        .stakeRewardAndBank P {
          color: ${getDesign('stakeRewardAmountColor', 'color')};
        }
        
        .pageTitle {
          color: ${getDesign('pageTitleColor', 'color')};
        }
        .stakeBeforeYourReward {
          width: 50%;
          padding-top: 10px;
          padding-bottom: 10px;
          color: ${getDesign('stakeBeforeYourRewardColor', 'color')};
        }
        .stakeAfterYourReward {
          width: 50%;
          padding-top: 10px;
          padding-bottom: 10px;
          color: ${getDesign('stakeAfterYourRewardColor', 'color')};
        }
        .stakeYourRewardLabel {
          color: ${getDesign('stakeYourRewardColor', 'color')};
          margin-top: 0px;
          margin-bottom: 0px;
        }
        .mainPageTextAfterTitle {
          width: 50%;
          padding-top: 10px;
          color: ${getDesign('mainPageTextAfterTitleColor', 'color')};
        }
        .mainPageTextAfterSections {
          width: 50%;
          padding-top: 30px;
          color: ${getDesign('mainPageTextAfterSectionsColor', 'color')};
        }
        .mintPageSubTitle {
          color: ${getDesign('mintPageSubTitleColor', 'color')};
        }
        .mintPagePrice {
          color: ${getDesign('mintPagePriceColor', 'color')};
          padding-top: 10px;
          padding-bottom: 10px;
          width: 50%;
        }
        .mintPageTextBeforePrice {
          width: 50%;
          padding-top: 20px;
          color: ${getDesign('mintPageBeforePriceColor', 'color')};
        }
        .mintPageTextAfterPrice {
          width: 50%;
          padding-bottom: 20px;
          color: ${getDesign('mintPageAfterPriceColor', 'color')};
        }
        .mintBeforeConnectWallet {
          width: 50%;
          padding-top: 20px;
          padding-bottom: 20px;
          color: ${getDesign('mintBeforeConnectColor', 'color')};
        }
        .mintAfterConnectWallet {
          width: 50%;
          padding-top: 20px;
          padding-bottom: 20px;
          color: ${getDesign('mintAfterConnectColor', 'color')};
        }
        
        .stakeYourStakedNfts {
          color: ${getDesign('stakeYourStakedColor', 'color')};
        }
        .stakeYourUnstakedNfts {
          color: ${getDesign('stakeYourUnstakedColor', 'color')};
        }
        .stakeYourStakedNftsDesc {
          width: 50%;
          color: ${getDesign('stakeYourStakedDescColor', 'color')};
        }
        .stakeYourUnstakedNftsDesc {
          width: 50%;
          color: ${getDesign('stakeYourUnstakedDescColor', 'color')};
        }
        
        .stakePageConnectedWallet {
          color: ${getDesign('stakeConnectWalletColor', 'color')};
        }
        
        .stakeBeforeConnectWallet {
          width: 50%;
          padding-top: 20px;
          padding-bottom: 20px;
          color: ${getDesign('stakeBeforeConnectColor', 'color')};
        }
        .stakeAfterConnectWallet {
          width: 50%;
          padding-top: 20px;
          padding-bottom: 20px;
          color: ${getDesign('stakeAfterConnectColor', 'color')};
        }
        @media only screen and (max-width: 1300px) {
          .stakeBeforeYourReward,
          .stakeAfterYourReward,
          .mainPageTextAfterTitle,
          .mainPageTextAfterSections,
          .mintPagePrice,
          .mintPageTextBeforePrice,
          .mintPageTextAfterPrice,
          .mintBeforeConnectWallet,
          .mintAfterConnectWallet,
          .stakeYourStakedNftsDesc,
          .stakeYourUnstakedNftsDesc,
          .stakeBeforeConnectWallet,
          .stakeAfterConnectWallet {
            width: 80%;
          }
        }
        @media only screen and (max-width: 1100px) {
          .stakeBeforeYourReward,
          .stakeAfterYourReward,
          .mainPageTextAfterTitle,
          .mainPageTextAfterSections,
          .mintPagePrice,
          .mintPageTextBeforePrice,
          .mintPageTextAfterPrice,
          .mintBeforeConnectWallet,
          .mintAfterConnectWallet,
          .stakeYourStakedNftsDesc,
          .stakeYourUnstakedNftsDesc,
          .stakeBeforeConnectWallet,
          .stakeAfterConnectWallet {
            width: 100%;
          }
        }
        
      `}
    </style>
  )
}