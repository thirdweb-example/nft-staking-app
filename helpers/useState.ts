import { useState } from "react"


export const useStateString = (defValue, options = {}) => {
  const {
    notEmpty
  } = options
  let _defHasError = false
  if (notEmpty && defValue === ``) _defHasError = true
  const [ value, setValue ] = useState(defValue)
  const [ hasError, setHasError ] = useState(_defHasError)

  const onSetValue = (val) => {
    let _setValue = val
    if (val?.target) _setValue = val.target.value

    if (notEmpty && _setValue === ``) {
      setHasError(true)
    } else {
      setHasError(false)
    }
    setValue(_setValue)
  }

  return [ value, onSetValue, hasError, setHasError ]
}

export const useStateUri = (defValue, options = {}) => {
  const {
    notEmpty
  } = options
  let _defHasError = false
  if (notEmpty && defValue === ``) _defHasError = true
  const [ value, setValue ] = useState(defValue)
  const [ hasError, setHasError ] = useState(_defHasError)

  const onSetValue = (val) => {
    let _setValue = val
    if (val?.target) _setValue = val.target.value

    if (notEmpty && _setValue === ``) {
      setHasError(true)
    } else {
      setHasError(false)
    }
    console.log('_setValue', _setValue)
    setValue(_setValue)
  }

  return [ value, onSetValue, hasError, setHasError ]
}

export const useStateUint = (defValue, options = {}) => {
  const {
    notZero
  } = options

  const _isCorrectValue = (val) => {
    let _hasError = false
    try {
      const v = parseInt(val)
      if (v >= 0) {
        if (notZero && v == 0) {
          _hasError = true
        }
      } else {
        _hasError = true
      }
    } catch (e) {
      _hasError = true
    }
    return _hasError
  }

  let _defHasError = _isCorrectValue(defValue)
  
  const [ value, setValue ] = useState(defValue)
  const [ hasError, setHasError] = useState(_defHasError)

  const setCorrectValue = (val) => {
    let _setValue = val
    if (val?.target) _setValue = val.target.value
    setHasError(_isCorrectValue(_setValue))

    setValue(_setValue)
  }

  return [ value, setCorrectValue, hasError, setHasError ]
}

export const useStateCurrency = (defValue, options = {}) => {
  const {
    notZero
  } = options

  const _isCorrectValue = (val) => {
    let _hasError = false
    try {
      const v = parseFloat(val.replace(',','.'))
      if (v >= 0) {
        if (notZero && v == 0) {
          _hasError = true
        }
      } else {
        _hasError = true
      }
    } catch (e) {
      _hasError = true
    }
    return _hasError
  }

  let _defHasError = _isCorrectValue(defValue)
  
  const [ value, setValue ] = useState(defValue)
  const [ hasError, setHasError] = useState(_defHasError)

  const setCorrectValue = (val) => {
    let _setValue = val
    if (val?.target) _setValue = val.target.value
    setHasError(_isCorrectValue(_setValue))
    try {
      setValue(_setValue.replace(',','.'))
    } catch (e) {
      setValue(_setValue)
    }
  }

  return [ value, setCorrectValue, hasError, setHasError ]
}