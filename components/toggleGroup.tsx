import styles from "../styles/Home.module.css"
import FaIcon from "./FaIcon"

export default function toggleGroup(options) {
  const {
    title,
    isOpened,
    content,
    onToggle
  } = {
    onToggle: () => {},
    ...options
  }

  return (
    <div className={`${styles.adminToggleGroup} ${isOpened ? styles.adminToggleGroupOpened : ''}`}>
      <div className={styles.adminToggleGroupHeader} onClick={() => { onToggle(!isOpened) }}>
        <h3>{title}</h3>
        <a>
          <FaIcon icon={(!isOpened) ? 'arrow-down' : 'arrow-up'} />
        </a>
      </div>
      {isOpened && (
        <div className={styles.adminToggleGroupContent}>{content}</div>
      )}
    </div>
  )
}