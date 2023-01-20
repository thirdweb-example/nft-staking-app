import { useEffect, useState } from "react"
import InputColor from 'react-input-color'

export default function ColorPicker(options) => {
  const {
    value,
  } = options

  const [ color, setColor ] = useState({ rgba: value })

  return (
    <InputColor
      initialValue={value}
      onChange={setColor}
      placement="right"
    />
  )
}