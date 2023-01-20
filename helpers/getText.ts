import { textGroups, TEXTS_GROUPS_ITEMS } from "./textsGroups"
import  MarkdownIt from "markdown-it"
import parse from "html-react-parser"

const md = new MarkdownIt({
  html: true,
  breaks: true,
})
const mdInline = new MarkdownIt({
  html: true,
  breaks: false,
})

export const getText = (textKey, storageTexts, sourceText, replaces = {}) => {
  let _ret = sourceText
  if (storageTexts && storageTexts[textKey]) _ret = storageTexts[textKey]

  Object.keys(replaces).forEach((key) => {
    _ret = _ret.replaceAll(`%${key}%`, replaces[key])
  })
  return _ret
}

export const getStorageText = (storageTexts) => {
  
  return (textKey, sourceText, replaces = {}) => {
    const _item = (TEXTS_GROUPS_ITEMS && TEXTS_GROUPS_ITEMS[textKey]) ? TEXTS_GROUPS_ITEMS[textKey] : false

    const _ret = getText(textKey, storageTexts, _item.value || sourceText, replaces)

    if (_item.markdown && _ret) {
      return parse((_item.multiline) ? md.renderInline(_ret) : mdInline.renderInline(_ret))
    } else {
      return _ret
    }
  }
}