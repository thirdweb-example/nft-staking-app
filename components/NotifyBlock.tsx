import styles from "../styles/Home.module.css"
import { useCallback, useEffect, useState, useRef } from "react"

export default function NotifyBlock(options) {
  const {
    style,
    blockIndex,
    msg,
    onRemove,
    id,
  } = options
  const timer = useRef<number>()
  const removeHandler = useRef(onRemove)

  const handleRemove = useCallback(() => removeHandler.current(id), [id, removeHandler])

  useEffect(() => {
    if (timer.current) {
      clearTimeout(timer.current)
    }

    timer.current = window.setTimeout(() => {
      handleRemove()
    }, 5000)

    return () => {
      clearTimeout(timer.current)
    }
  }, [timer])

  return (
    <div className={`${(style) ? styles[style] : styles.info}`}>
      {msg}
    </div>
  )
}