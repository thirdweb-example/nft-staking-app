import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import * as icons from '@fortawesome/free-solid-svg-icons'

export default function FaIcon(options) {
  const {
    icon,
  } = options

  const formatIconName = (str) => {
    str = `fa-${str}`
    str = str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(word, index) {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    }).replace(/\s+/g, '')
    return str.replaceAll(`-`,``)
  }
  const _icon = formatIconName(icon)

  return (
    <FontAwesomeIcon icon={icons[_icon]} />
  )
}