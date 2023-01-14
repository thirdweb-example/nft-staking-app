import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUpRightFromSquare } from '@fortawesome/free-solid-svg-icons'
import styles from "../styles/Home.module.css"

export default function openInTab(href, title) {
  return (
    <a className={styles.openInNewTab} href={href} target="_blank" alt={title} title={title}>
      <FontAwesomeIcon icon={faUpRightFromSquare} />
    </a>
  )
}