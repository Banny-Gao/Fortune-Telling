import { YinYang, WuXing } from './types'

/** 阴阳 */
export const YIN_YANG_NAME: YinYang['name'][] = ['阴', '阳']

export const yinYangs: YinYang[] = YIN_YANG_NAME.map((name, index) => ({
  name,
  value: index === 0 ? -1 : 1,
}))

export const WX_NAME = ['木', '火', '土', '金', '水']

/** 五行数字 */
export const WX_NUMBERS = [
  [3, 8], // 木
  [2, 7], // 火
  [5, 10], // 土
  [4, 9], // 金
  [1, 6], // 水
]

/** 五行 */
export const wuxings: WuXing[] = WX_NAME.map((name, index) => ({
  name,
  index,
  numbers: WX_NUMBERS[index],
}))
