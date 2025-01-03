import { IndexField, OptionField } from './types'

export const YIN_YANG_NAME = ['阴', '阳']
export const WX_NAME = ['木', '火', '土', '金', '水']
export const WX_NUMBERS = [
  /** 五行数字 */
  [3, 8], // 木
  [2, 7], // 火
  [5, 10], // 土
  [4, 9], // 金
  [1, 6], // 水
]

/** 阴阳 */
export type YinYang = OptionField<{}>
export const yinYangs: YinYang[] = YIN_YANG_NAME.map((name, index) => ({
  name,
  value: index === 0 ? -1 : 1,
}))

/** 五行 */
export type WuXing = IndexField<{
  numbers: number[]
}>
export const wuxings: WuXing[] = WX_NAME.map((name, index) => ({
  name,
  index,
  numbers: WX_NUMBERS[index],
}))
