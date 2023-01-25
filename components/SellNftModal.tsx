import { useEffect, useState } from "react"
import styles from "../styles/Home.module.css"
import nftSaleToken from "./nftSaleToken"
import { CHAIN_INFO, ZERO_ADDRESS } from "../helpers/constants"
import { toWei, fromWei } from "../helpers/wei"
import callNftMethod from "../helpers/callNftMethod"
import BigNumber from "bignumber.js"

export default function SellNftModal(options) {
  const {
    activeWeb3,
    openConfirmWindow,
    addNotify,
    nftInfo,
    onClose,
    onSelled,
    allowedERC20Info,
    chainId,
    nftContract,
    tradeFee
  } = options

  const chainInfo = CHAIN_INFO(chainId)
  const nativeCurrency = chainInfo.nativeCurrency

  const [ sellCurrency, setSellCurrency ] = useState(ZERO_ADDRESS)
  const [ sellPrice, setSellPrice ] = useState(0)
  const [ sellPriceWithFee, setSellPriceWithFee ] = useState(0)
  const [ hasSellPriceError, setHasSellPriceError ] = useState(false)

  const updateSellPrice = (newValue) => {
    setHasSellPriceError(false)
    try {
      const parsed = parseFloat(newValue)
      if (parsed <= 0) {
        setHasSellPriceError(true)
      } else {
        const priceInWei = toWei(
          newValue,
          (sellCurrency == ZERO_ADDRESS)
            ? nativeCurrency.decimals
            : allowedERC20Info[sellCurrency].decimals
        ).toString()

        const feePart = new BigNumber(priceInWei).dividedBy(100).multipliedBy(tradeFee)
        const withFee = new BigNumber(priceInWei).minus(feePart)

        setSellPriceWithFee(fromWei(
          withFee.toFixed(),
          (sellCurrency == ZERO_ADDRESS)
            ? nativeCurrency.decimals
            : allowedERC20Info[sellCurrency].decimals
        ))
      }
    } catch (e) {
      setSellPriceWithFee(false)
      setHasSellPriceError(true)
    }
    setSellPrice(newValue)
  }

  const tradeCurrencySymbol = (sellCurrency == ZERO_ADDRESS)
    ? nativeCurrency.symbol
    : allowedERC20Info[sellCurrency].symbol

  const [ isSelling, setIsSelling ] = useState(false)
  
  const doSell = () => {
    if (sellPrice) { //&& !hasSellPriceError) {
      openConfirmWindow({
        title: `Selling NFT`,
        message: `Do you really want to sell NFT #${nftInfo.tokenId.toString()} for ${sellPrice} ${tradeCurrencySymbol}?`,
        onConfirm: () => {
          setIsSelling(true)
          addNotify(`Placing NFT to Marketplace. Confirm transaction`)
          callNftMethod({
            activeWeb3,
            contractAddress: nftContract,
            method: 'sellNFT',
            args: [
              nftInfo.tokenId.toString(),
              toWei(
                sellPrice,
                sellCurrency == ZERO_ADDRESS
                  ? nativeCurrency.decimals
                  : allowedERC20Info[sellCurrency].decimals
              ),
              sellCurrency
            ],
            onTrx: (txHash) => {
              console.log('>> onTrx', txHash)
              addNotify(`Placing NFT at Marketplace TX ${txHash}`, `success`)
            },
            onSuccess: (receipt) => {},
            onError: (err) => {
              console.log('>> onError', err)
              addNotify(`Fail place NFT at Marketplace. ${err.message ? err.message : ''}`, `error`)
              setIsSelling(false)
            },
            onFinally: (answer) => {
              addNotify(`NFT successfull placed at Marketplace`, `success`)
              setIsSelling(false)
              onSelled()
            }
          })
        }
      })
    } else {
      openConfirmWindow({
        title: `Selling NFT`,
        message: `Enter the correct price`,
        isOk: true,
      })
    }
  }

  return (
    <>
      <style jsx>
      {`
        .sellNftModal {
          
        }
        .sellNftModal>DIV {
          min-width: 700px;
        }
        .sellNftModal .nftHolder {
          width: auto;
        }
        .sellNftModal .sellForm {
          display: flex;
          align-items: center;
        }
        .sellNftModal .sellForm>DIV {
          width: 50%;
        }
        .sellNftModal .inputsHolder {
          text-align: left;
        }
        .sellNftModal .inputsHolder LABEL {
          display: block;
          font-weight: bold;
          font-size: 14pt;
        }
        .sellNftModal .inputsHolder SELECT,
        .sellNftModal .inputsHolder INPUT {
          display: block;
          width: 100%;
          font-size: 14pt;
          margin-bottom: 10px;
          line-height: 32px;
          height: 32px;
        }
        .sellNftModal .inputsHolder INPUT {
          margin-bottom: 0px;
        }
        .sellNftModal .inputsHolder .info LABEL {
          font-size: 10pt;
        }
        .sellNftModal .info STRONG {
          display: block;
          font-size: 10pt;
        }
        .sellNftModal .error {
          display: block;
          font-size: 10pt;
          color: #d90d0d;
        }
      `}
      </style>
      <div className={`${styles.confirmWindow} sellNftModal`}>
        <div>
          <h3>Selling NFT</h3>
          <span>Set up sales currencies and specify the desired price</span>
          <div className="sellForm">
            <div className={`${styles.nftBoxGrid} nftHolder`}>
              {nftSaleToken({
                tokenId: nftInfo.tokenId.toString(),
                tokenUri: nftInfo.tokenURI,
                isPreview: true,
              })}
            </div>
            <div className="inputsHolder">
              <div>
                <label>Currency:</label>
                <select value={sellCurrency} onChange={(e) => { setSellCurrency(e.target.value) }}>
                  <option value={ZERO_ADDRESS}>Native ({nativeCurrency.symbol})</option>
                  {Object.keys(allowedERC20Info).length > 0 && (
                    <>
                      {Object.keys(allowedERC20Info).map((key) => {
                        return (
                          <option value={key} key={key}>{allowedERC20Info[key].symbol}</option>
                        )
                      })}
                    </>
                  )}
                </select>
              </div>
              <div>
                <label>Price:</label>
                {hasSellPriceError && (
                  <strong className="error">Price must be a number greater than zero</strong>
                )}
                <input value={sellPrice} onChange={(e) => { updateSellPrice(e.target.value) }} type="number" min="0" step="0.001" />
              </div>
              {Number(tradeFee) > 0 && (
                <div className="info">
                  <label>Marketplace fee: {tradeFee}%</label>
                  {sellPriceWithFee > 0 && (
                    <strong>
                      {`You are got ${sellPriceWithFee} ${tradeCurrencySymbol}`}
                    </strong>
                  )}
                </div>
              )}
            </div>
          </div>
          <div>
            <button disabled={isSelling} className={`${styles.mainButton} primaryButton`} onClick={doSell}>
              Sell
            </button>
            <button disabled={isSelling} className={`${styles.mainButton} primaryButton`} onClick={onClose}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  )
}