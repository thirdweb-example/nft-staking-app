import styles from "../../styles/Home.module.css"
import { useEffect, useState } from "react"
import iconButton from "../iconButton"
import isImageUrl from "../../helpers/isImageUrl"
import ImageInput from "../ImageInput"

export default function ImagesList(options = {}) {
  const bottomButtons = options?.bottomButtons || null
  const [itemsList, setItemsList] = useState(options?.itemsList || [])

  const getItemsList = () => { return itemsList }

  const addItem = () => {
    itemsList.push('')
    setItemsList([...itemsList])
  }

  const updateItem = (imageKey, newValue) => {
    itemsList[imageKey] = newValue
    setItemsList([...itemsList])
  }

  const removeItem = (imageKey) => {
    const _doRemove = () => {
      itemsList.splice(imageKey, 1)
      setItemsList([...itemsList])
      if (options.addNotify) {
        options.addNotify(`Item removed`,`success`)
      }
    }
    if (options.openConfirmWindow) {
      options.openConfirmWindow({
        title: `Remove item`,
        message: `Do you want remove this item?`,
        onConfirm: _doRemove,
      })
    } else {
      _doRemove()
    }
  }

  return {
    getItemsList,
    setItemsList,
    render: (renderOptions) => {
      return (
        <div className={styles.adminImagesList}>
          {(itemsList.length > 0) ? (
            <ul>
              {itemsList.map((imageUri, imageKey) => {
                return (
                  <li key={imageKey} className={!isImageUrl(imageUri) ? styles.hasError : ''}>
                    <ImageInput value={itemsList[imageKey]} onChange={(v) => { updateItem(imageKey, v) }} />
                    {iconButton({
                      title: `Remove`,
                      onClick: () => { removeItem(imageKey) },
                      icon: `trash-can`,
                    })}
                  </li>
                )
              })}
            </ul>
          ) : (
            <>
              <span>{options?.emptyLabel || `Empty`}</span>
            </>
          )}
          <div>
            <button onClick={addItem}>{options?.addNewTitle || `Add new image`}</button>
            {bottomButtons && bottomButtons()}
            {renderOptions?.bottomButtons && renderOptions.bottomButtons()}
          </div>
        </div>
      )
    }
  }
}