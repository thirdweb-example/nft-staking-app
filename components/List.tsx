import styles from "../styles/Home.module.css"
import { useEffect, useState } from "react"
import FaIcon from "./FaIcon"
import iconButton from "./iconButton"

export default function List(options) {
  const {
    labelEmpty,
    labelAddItem,
    onChange
  } = options

  const [ items, setItems ] = useState(options?.items ? [ ...options.items] : [])

  useEffect(() => {
    if (onChange) onChange(items)
  }, [items])

  const onAddItem = () => {
    items.push(``)
    setItems([...items])
  }
  
  const onChangeItem = (index, value) => {
    items[index] = value
    setItems([...items])
  }
  
  const onRemoveItem = (index) => {
    items.splice(index,1)
    setItems([...items])
  }
  
  return (
    <>
      <style jsx>
      {`
        .adminList {
          width: 100%;
        }
        .adminList UL {
          display: block;
          padding: 0px;
          list-style: none;
          margin: 0px;
        }
        .adminList UL LI {
          display: flex;
        }
        .adminList .actions {
          text-align: right;
          padding-top: 5px;
        }
        .adminList .empty {
          font-weight: bold;
          padding: 5px;
          text-align: center;
          border: 1px solid #FFF;
        }
      `}
      </style>
      <div className="adminList">
        {items.length > 0 ? (
          <ul>
            {items.map((item, itemIndex) => {
              return (
                <li key={itemIndex}>
                  <input type="text" value={items[itemIndex]} onChange={(e) => { onChangeItem(itemIndex, e.target.value) }} />
                  {iconButton({
                    icon: `remove`,
                    title: `Remove item`,
                    onClick: () => { onRemoveItem(itemIndex) }
                  })}
                </li>
              )
            })}
          </ul>
        ) : (
          <div className="empty">{labelEmpty ? labelEmpty : `List is empty`}</div>
        )}
        <div className="actions">
          <a className={styles.buttonWithIcon} onClick={onAddItem}>
            <FaIcon icon="add" />
            {labelAddItem ? labelAddItem : `Add new item`}
          </a>
        </div>
      </div>
    </>
  )
}