import { defaultDesign } from "./defaultDesign"

export const getDesign = () => {
  
}

export const getStorageDesign = (storageDesign) => {
  
  return (key, _type, defValue) => {
    defValue = defValue || defaultDesign[key]
    const ret = (storageDesign && storageDesign[key]) ? storageDesign[key] : defValue
    // check types
    if (_type == `uri` && ret == ``) return defValue
    if (_type == `int`) {
      try {
        const _check = parseInt(ret)
      } catch (e) {
        return defValue
      }
    }
    
    return ret
  }
}