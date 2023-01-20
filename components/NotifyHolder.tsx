import { useEffect, useState } from "react"
import styles from "../styles/Home.module.css"
import { getUnixTimestamp } from "../helpers/getUnixTimestamp"
import NotifyBlock from "./NotifyBlock"


export default function NotifyHolder(options) {
  const [ items, setItems ] = useState([])
  const [ idCounter, setIdCounter ] = useState(0)

  const addItem = (newItem) => {
    setIdCounter((curId) => {
      
      setItems((prevItems) => {
        return [
          ...prevItems,
          {
            ...newItem,
            id: curId,
          }
        ]
      })
      return curId + 1
    })
  }

  const onRemove = (id) => {
    setItems((prevItems) => prevItems.filter((prevItem) => prevItem.id !== id))
  }

  return {
    addItem,
    render: () => {
      return (
        <>
          <div className={styles.notifyHolder}>
            {items.map((block,blockIndex) => {
              return (
                <NotifyBlock
                  {...block}
                  key={block.id}
                  onRemove={onRemove}
                />
              )
            })}
          </div>
        </>
      )
    }
  }
}