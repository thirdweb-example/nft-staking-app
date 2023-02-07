import styles from "../styles/Home.module.css"

export default function AdminPopupWindow(options) {
  const {
    title,
    isOpened,
    children,
  } = options
  if (!isOpened) return null
  return (
    <div className={styles.adminPopupWindow}>
      <div>
        <h3>{title}</h3>
        {children}
      </div>
    </div>
  )
}