import { textGroups } from "./textGroups"

export const getText = (textKey, storageTexts, sourceText) => {
  if (storageTexts && storageTexts[textKey]) return storageTexts[textKey]
  return sourceText
}

export const getStorageText = (storageTexts) => {
  return (textKey, sourceText) => {
    return getText(textKey, storageTexts, sourceText)
  }
}