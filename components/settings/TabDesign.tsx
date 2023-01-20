import styles from "../../styles/Home.module.css"
import { useEffect, useState } from "react"
import { useStateUri, useStateUint } from "../../helpers/useState"
import { defaultDesign } from "../../helpers/defaultDesign"
import { getUnixTimestamp } from "../../helpers/getUnixTimestamp"

import toggleGroup from "../toggleGroup"
import iconButton from "../iconButton"
import InputColor from 'react-input-color'


const useStateColor = useStateUri

export default function TabDesign(options) {
  const {
    setDoReloadStorage,
    saveStorageConfig,
    openConfirmWindow,
    addNotify,
    getActiveChain,
    storageDesign,
  } = options

  const _lsPreviewMode = localStorage.getItem(`-nft-stake-preview-mode`)
  let _lsPreviewDesign = localStorage.getItem(`-nft-stake-preview-design`)
  try {
    _lsPreviewDesign = JSON.parse(_lsPreviewDesign)
    _lsPreviewDesign = {
      ...defaultDesign,
      ..._lsPreviewDesign,
    }
  } catch (e) {
    _lsPreviewDesign = defaultDesign
  }

  const [ isPreviewMode, setIsPreviewMode ] = useState(_lsPreviewMode !== null)

  const initialDesign = {
    ...defaultDesign,
    ...storageDesign,
  }

  const [ designValues, setDesignValues ] = useState(_lsPreviewMode ? _lsPreviewDesign : initialDesign)
  const [ isSaveDesign, setIsSaveDesign ] = useState(false)


  const renderColor = (options) => {
    const {
      title,
      target,
    } = options

    const onChange = (newColor) => {
      setDesignValues((prevValue) => {
        return {
          ...prevValue,
          [`${target}`]: newColor.hex,
        }
      })
    }

    return (
      <div className={styles.infoRow}>
        <label>{title}:</label>
        <span>
          <div>
            <InputColor
              initialValue={designValues[target]}
              onChange={onChange}
              placement="right"
            />
          </div>
        </span>
      </div>
    )
  }

  const renderUri = (options) => {
    const {
      title,
      target,
      placeholder,
    } = options

    const onChange = (value) => {
      setDesignValues((prevValue) => {
        return {
          ...prevValue,
          [`${target}`]: value,
        }
      })
    }
    
    return (
      <div className={styles.infoRow}>
        <label>{title}:</label>
        <span>
          <div>
            <input
              placeholder={placeholder}
              type="text" value={designValues[target]} onChange={(e) => { onChange(e.target.value) }}
            />
            {iconButton({
              title: `Open in new tab`,
              href: designValues[target],
              target: `_blank`
            })}
          </div>
        </span>
      </div>
    )
  }

  const renderNumber = (options) => {
    const {
      title,
      target,
      unit,
    } = options

    const onChange = (value) => {
      setDesignValues((prevValue) => {
        return {
          ...prevValue,
          [`${target}`]: value,
        }
      })
    }
    
    return (
      <div className={styles.infoRow}>
        <label>{title}:</label>
        <span>
          <div>
            <input
              type="number" value={designValues[target]} onChange={(e) => { onChange(e.target.value) }}
            />
            <strong>{unit}</strong>
          </div>
        </span>
      </div>
    )
  }

  const onPreviewDesign = () => {
    openConfirmWindow({
      title: `Switch to preview mode`,
      message: `Switch to preview mode? You can look changes before save`,
      onConfirm: () => {
        addNotify(`Preview mode on. Go to site for check it`, `success`)
        localStorage.setItem(`-nft-stake-preview-mode`, true)
        localStorage.setItem(`-nft-stake-preview-design`, JSON.stringify(designValues))
        setIsPreviewMode(true)
      }
    })
  }

  const offPreviewDesign = () => {
    addNotify(`Preview mode turn off`, `success`)
    localStorage.removeItem(`-nft-stake-preview-mode`)
    localStorage.removeItem(`-nft-stake-preview-design`)
    setIsPreviewMode(false)
  }
  useEffect(() => {
    if (isPreviewMode) {
      localStorage.setItem(`-nft-stake-preview-design`, JSON.stringify(designValues))
      localStorage.setItem(`-nft-stake-preview-utx`, getUnixTimestamp())
    }
  }, [designValues])

  const doSaveDesign = () => {
    const newDesign = designValues
    const newConfig = {
      design: newDesign
    }
    saveStorageConfig({
      onBegin: () => {
        addNotify(`Confirm transaction for save changed texts`)
      },
      onReady: () => {
        addNotify(`Texts successfull saved`, `success`)
      },
      onError: (err) => {
        addNotify(`Fail save texts`, `error`)
      },
      newData: newConfig
    })
  }

  const [ openedTabs, setOpenedTabs ] = useState({})

  const toggleTab = (tab) => {
    setOpenedTabs((prev) => {
      return {
        ...prev,
        [`${tab}`]: (prev[tab]) ? !prev[tab] : true,
      }
    })
  }

  return {
    render: () => {
      return (
        <div className={styles.adminForm}>
          <div className={styles.subFormInfo}>
            {toggleGroup({
              title: 'Main settings',
              isOpened: openedTabs?.mainSettings,
              onToggle: () => { toggleTab('mainSettings') },
              content: (
                <>
                  {renderUri({ title: 'Logo uri', target: 'logoUri' })}
                  {renderNumber({ title: 'Logo max width', target: 'logoMaxWidth', unit: 'px' })}
                  {renderColor({ title: 'Background color', target: 'backgroundColor' })}
                  {renderUri({ title: 'Background image', target: 'backgroundImage' })}
                  {renderColor({ title: 'Base text color', target: 'baseTextColor' })}
                  {renderColor({ title: 'Page title color', target: 'pageTitleColor' })}
                  {renderColor({ title: 'HR line color', target: 'hrColor' })}
                  <h5>Primary button</h5>
                  {renderColor({ title: 'Background color #1', target: 'prButtonBg1' })}
                  {renderColor({ title: 'Background color #2', target: 'prButtonBg2' })}
                  
                  {renderColor({ title: 'Text color', target: 'prButtonColor' })}
                  {renderColor({ title: 'Background (disabled)', target: 'prButtonDisabledBg' })}
                  {renderColor({ title: 'Text color (disabled)', target: 'prButtonDisabledColor' })}
                  {renderNumber({ title: 'Border radius', target: 'prButtonBorderRadius', unit: 'px' })}
                </>
              )
            })}
            {toggleGroup({
              title: 'Header Navigate menu',
              isOpened: openedTabs?.headerNav,
              onToggle: () => { toggleTab('headerNav') },
              content: (
                <>
                  {renderColor({ title: 'Background color', target: 'navMenuBgColor' })}
                  {renderColor({ title: 'Link color', target: 'navMenuColor' })}
                  {renderColor({ title: 'Link hover color', target: 'navMenuHoverColor' })}
                  {renderColor({ title: 'Active item color', target: 'navMenuActiveColor' })}
                  {renderColor({ title: 'Bottom line color', target: 'navMenuBottomLineColor' })}
                  {renderNumber({ title: 'Bottom line size', target: 'navMenuBottomLineSize' })}
                </>
              )
            })}
            {toggleGroup({
              title: 'Footer',
              isOpened: openedTabs?.footer,
              onToggle: () => { toggleTab('footer') },
              content: (
                <>
                  {renderColor({ title: 'Top line color', target: 'footerTopLineColor' })}
                  {renderNumber({ title: 'Top line size', target: 'footerTopLineSize' })}
                  {renderColor({ title: 'Background color', target: 'footerBgColor' })}
                  {renderColor({ title: 'Text color', target: 'footerTextColor' })}
                  {renderColor({ title: 'Link color', target: 'footerLinkColor' })}
                  {renderColor({ title: 'Link color (hover)', target: 'footerLinkHoverColor' })}
                </>
              )
            })}
            {toggleGroup({
              title: 'Main page',
              isOpened: openedTabs?.mainPage,
              onToggle: () => { toggleTab('mainPage') },
              content: (
                <>
                  {renderColor({ title: 'After title text color', target: 'mainPageTextAfterTitleColor' })}
                  <h5>Main page sections</h5>
                  {renderColor({ title: 'Background color', target: 'mainPageSectionBackground' })}
                  {renderColor({ title: 'Border color', target: 'mainPageSectionBorderColor' })}
                  {renderColor({ title: 'Title color', target: 'mainPageSectionTitleColor' })}
                  {renderColor({ title: 'Descripton color', target: 'mainPageSectionDescColor' })}
                  <hr />
                  {renderColor({ title: 'After sections text color', target: 'mainPageTextAfterSectionsColor' })}
                </>
              )
            })}
            {toggleGroup({
              title: 'NFT Token design',
              isOpened: openedTabs?.nftToken,
              onToggle: () => { toggleTab('nftToken') },
              content: (
                <>
                  {renderColor({ title: 'Background color', target: 'nftBackgroundColor' })}
                  {renderColor({ title: 'Border color', target: 'nftBorderColor' })}
                  {renderColor({ title: 'TokenId color', target: 'nftIdColor' })}
                  {renderNumber({ title: 'Border radius', target: 'nftBorderRadius', unit: 'px' })}
                  {renderNumber({ title: 'Border size', target: 'nftBorderSize', unit: 'px' })}
                  {renderNumber({ title: 'Image max-height', target: 'nftMaxHeight', unit: 'px' })}
                </>
              )
            })}
            {toggleGroup({
              title: 'Mint page',
              isOpened: openedTabs?.mintPage,
              onToggle: () => { toggleTab('mintPage') },
              content: (
                <>
                  <h5>Connect wallet section</h5>
                  {renderColor({ title: 'Color of text before connect wallet button', target: 'mintBeforeConnectColor'})}
                  {renderColor({ title: 'Color of text after connect wallet button', target: 'mintAfterConnectColor'})}
                  <h5>Main section</h5>
                  {renderColor({ title: 'Color of subtitle "Mint NFT"', target: 'mintPageSubTitleColor'})}
                  {renderColor({ title: 'Color of text before price', target: 'mintPageBeforePriceColor' })}
                  {renderColor({ title: 'Color of mint price', target: 'mintPagePriceColor'})}
                  {renderColor({ title: 'Color of text after price', target: 'mintPageAfterPriceColor' })}
                </>
              )
            })}
            {toggleGroup({
              title: 'Stake page',
              isOpened: openedTabs?.stakePage,
              onToggle: () => { toggleTab('stakePage') },
              content: (
                <>
                  <h5>Connect wallet section</h5>
                  {renderColor({ title: 'Color of text before connect wallet button', target: 'stakeBeforeConnectColor'})}
                  {renderColor({ title: 'Color of text after connect wallet button', target: 'stakeAfterConnectColor'})}
                  {renderColor({ title: 'Connected wallet label color', target: 'stakeConnectWalletColor' })}
                  <h5>Reward section and bank section</h5>
                  {renderColor({ title: 'Color of text before label', target: 'stakeBeforeYourRewardColor' })}
                  {renderColor({ title: '"Your reward" label color', target: 'stakeYourRewardColor' })}
                  {renderColor({ title: 'Color of text after label', target: 'stakeAfterYourRewardColor' })}
                  <hr />
                  {renderColor({ title: 'Background color', target: 'stakeRewardBackground' })}
                  {renderColor({ title: 'Title color', target: 'stakeRewardTitleColor' })}
                  {renderColor({ title: 'Amount color', target: 'stakeRewardAmountColor' })}
                  {renderColor({ title: 'Border color', target: 'stakeRewardBorderColor' })}
                  {renderNumber({ title: 'Border size', target: 'stakeRewardBorderSize', unit: 'px'})}
                  {renderNumber({ title: 'Border radius', target: 'stakeRewardBorderRadius', unit: 'px'})}
                  <h5>Stake and unstake section</h5>
                  {renderColor({ title: '"Your staked NFTs" color', target: 'stakeYourStakedColor' })}
                  {renderColor({ title: 'Color of text after "Your staked NFTs"', target: 'stakeYourStakedDescColor' })}
                  {renderColor({ title: '"Your Unstaked NFTs" color', target: 'stakeYourUnstakedColor' })}
                  {renderColor({ title: 'Color of text after "Your Unstaked NFTs"', target: 'stakeYourUnstakedDescColor' })}
                </>
              )
            })}
            
            
            <div className={styles.actionsRow}>
              {isPreviewMode ? (
                <>
                  <button onClick={offPreviewDesign}>
                    Turn off preview mode
                  </button>
                </>
              ) : (
                <button onClick={onPreviewDesign}>
                  Turn on preview mode
                </button>
              )}
              <button onClick={doSaveDesign}>
                Save changes
              </button>
            </div>
          </div>
        </div>
      )
    }
  }
}