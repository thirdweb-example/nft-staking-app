import { useEffect, useState } from "react"
import { useStateUint } from "../../helpers/useState"
import styles from "../../styles/Home.module.css"
import iconButton from "../iconButton"
import FaIcon from "../FaIcon"
import ImageInput from "../ImageInput"
import callNftMethod from "../../helpers/callNftMethod"
import {
  CHAIN_INFO,
  ZERO_ADDRESS
} from "../../helpers/constants"
import { fromWei, toWei } from "../../helpers/wei"


export default function MintManyNftForSale(options) {
  const {
    allowedERC20Info,
    chainId,
    getActiveChain,
    nftAddress,
    openConfirmWindow,
    addNotify,
  } = options

  const { nativeCurrency } = CHAIN_INFO(chainId)
  const [ items, setItems ] = useState([])
  const [ isMinting, setIsMinting ] = useState(false)
  
  const doMintItems = () => {
    const uris = []
    const prices = []
    const currencies = []
    /* ToDo - check errors */
    items.forEach((item) => {
      uris.push(item.uri)
      currencies.push(item.currency)
      prices.push(toWei(
        item.price,
        (item.currency == ZERO_ADDRESS)
          ? nativeCurrency.decimals
          : allowedERC20Info[item.currency].decimals
      ))
    })
    openConfirmWindow({
      title: `Mint NFTs for sale`,
      message: `Mint these NFT items and put up its to sale?`,
      onConfirm: () => {
        setIsMinting(true)
        addNotify(`Minting NFTs. Confirm transaction`)
        const { activeWeb3 } = getActiveChain()
        callNftMethod({
          activeWeb3,
          contractAddress: nftAddress,
          method: `mintNFTForSell`,
          args: [
            uris,
            currencies,
            prices,
            ZERO_ADDRESS
          ],
          onTrx: (txHash) => {
            addNotify(`Mint NFTs for sale TX ${txHash}`, `success`)
            console.log('>> onTrx', txHash)
          },
          onSuccess: (receipt) => {
            addNotify(`Broadcast Mint NFTs TX`, `success`)
            console.log('>> onSuccess', receipt)
          },
          onError: (err) => {
            addNotify(`Fail mint NFTs. ${err.message ? err.message : ''}`, `error`)
            setIsMinting(false)
            console.log('>> onError', err)
          },
          onFinally: (answer) => {
            const newTokenIds = answer.events.Mint.map((rv) => {
              return rv.returnValues.tokenId
            })
            addNotify(`NFTs is minted! NTFs ids is ${newTokenIds.join(', ')}`, `success`)
            setIsMinting(false)
            setItems([])
            console.log('>> onFinally', answer)
          }
        })
      }
    })
  }

  const updateUri = (index, newValue) => {
    setItems((prev) => {
      prev[index].uri = newValue
      return [...prev]
    })
  }
  const updatePrice = (index, newValue) => {
    setItems((prev) => {
      prev[index].price = newValue
      return [...prev]
    })
  }
  const updateCurrency = (index, newValue) => {
    setItems((prev) => {
      prev[index].currency = newValue
      return [...prev]
    })
  }
  const removeItem = (index) => {
    setItems((prev) => {
      prev.splice(index, 1)
      return [...prev]
    })
  }
  const addItem = () => {
    setItems((prev) => {
      return [
        ...prev,
        {
          uri: ``,
          price: 0,
          currency: ZERO_ADDRESS,
          hasError: false,
        }
      ]
    })
  }
  
  return (
    <>
      <style jsx>
      {`
        .mintManyNft {
          display: block;
        }
        .mintManyNft THEAD {
          font-size: 10pt;
          font-weight: bold;
          background: gray;
        }
        .mintManyNft THEAD TD {
          padding: 4px;
          text-align: left;
        }
        .mintManyNft TR.hasError {
          background: #c72525;
        }
        .mintManyNft TD.priceCell {
          min-width: 150px;
        }
        .mintManyNft TD.currencyCell {
          min-width: 150px;
        }
        .mintManyNft TD.optionsCell {
          min-width: 30px;
        }
        .mintManyNft TD.uriCell {
          width: 100%;
        }
        .mintManyNft TD.empty {
          text-align: center;
          padding: 4px;
          font-weight: bold;
        }
        .mintManyNft INPUT,
        .mintManyNft SELECT {
          width: 100%;
          padding: 2px;
          line-height: 20px;
        }
        .mintManyNft>DIV {
          width: 100%;
          margin-top: 2px;
          padding-top: 4px;
          border-top: 1px solid #FFF;
          text-align: right;
        }
      `}
      </style>
      <div className="mintManyNft">
        <table>
          <thead>
            <tr>
              <td className="uriCell">Url</td>
              <td className="priceCell">Price</td>
              <td className="currencyCell">Currency</td>
              <td className="optionsCell"></td>
            </tr>
          </thead>
          <tbody>
            {items.length > 0 ? (
              <>
                {items.map((item, itemKey) => {
                  return (
                    <tr key={itemKey}>
                      <td>
                        <ImageInput value={items[itemKey].uri} onChange={(value) => { updateUri(itemKey, value) }} />
                      </td>
                      <td>
                        <input type="number" min="0" value={items[itemKey].price} onChange={(e) => { updatePrice(itemKey, e.target.value) }} />
                      </td>
                      <td>
                        <select value={items[itemKey].currency} onChange={(e) => { updateCurrency(itemKey, e.target.value) }} >
                          <option value={ZERO_ADDRESS}>{nativeCurrency.symbol}</option>
                          {allowedERC20Info && (
                            <>
                              {Object.keys(allowedERC20Info).map((erc20key) => {
                                return (
                                  <option value={erc20key} key={erc20key}>
                                    {allowedERC20Info[erc20key].symbol}
                                  </option>
                                )
                              })}
                            </>
                          )}
                        </select>
                      </td>
                      <td>
                        {iconButton({
                          title: `Remove item`,
                          icon: 'remove',
                          onClick: () => { removeItem(itemKey) }
                        })}
                      </td>
                    </tr>
                  )
                })}
              </>
            ) : (
              <tr>
                <td colSpan="4" className="empty">Mint list for sale is empty</td>
              </tr>
            )}
          </tbody>
        </table>
        <div>
          <a className={styles.buttonWithIcon} onClick={addItem}>
            <FaIcon icon="add" />
            Add new item
          </a>
        </div>
        <div className={styles.actionsRow}>
          <button disabled={isMinting || items.length == 0} onClick={doMintItems}>
            {isMinting ? `Minting...` : `Mint NFTs`}
          </button>
        </div>
      </div>
    </>
  )
}