import { generateRelation } from './global'
import type { IndexField, OptionField } from './global'

/** 阴阳 */
export type YinYang = OptionField<{
  name: YinYangName
  value: YinYangValue
}>
/** 五行 */
export type WuXing = IndexField<{
  name: WuXingName
  numbers: number[]
  sheng: ReturnType<typeof woSheng>
  shengWo: ReturnType<typeof shengWo>
  ke: ReturnType<typeof woKe>
  keWo: ReturnType<typeof keWo>
  wuzang: string
  liuFu: string
  SHENG: typeof woSheng
  SHENG_WO: typeof shengWo
  KE: typeof woKe
  KE_WO: typeof keWo
}>
/** 阴阳 */
export type YinYangName = (typeof YIN_YANG_NAME)[number]
export type YinYangValue = -1 | 1
export const YIN_YANG_NAME = ['阴', '阳'] as const
/** 五行 */
export type WuXingName = (typeof WX_NAME)[number]
export const WX_NAME = ['木', '火', '土', '金', '水'] as const
/** 五行数字 */
export const WX_NUMBERS = [
  /** 五行数字 */
  [3, 8], // 木
  [2, 7], // 火
  [5, 10], // 土
  [4, 9], // 金
  [1, 6], // 水
]
/** 五常 */
export const WU_CHANG_NAME = ['仁', '礼', '信', '义', '智'] as const
/** 五志 */
export const WU_ZHI_NAME = ['怒', '喜', '思', '悲', '恐'] as const
/** 五脏 */
export const WU_ZANG_NAME = ['肝', '心', '脾', '肺', '肾'] as const
/** 六腑 */
export const WU_FU_NAME = ['胆', '小肠', '胃', '大肠', '膀胱', '三焦'] as const
/** 五色 */
export const WU_SE_NAME = ['青', '赤', '黄', '白', '黑'] as const
/** 五味 */
export const WU_WEI_NAME = ['酸', '苦', '甘', '辛', '咸'] as const
/** 五音 */
export const WU_YIN_NAME = ['角', '徵', '宫', '商', '羽'] as const
/** 五声 */
export const WU_SHENG_NAME = ['呼', '笑', '歌', '哭', '呻'] as const
/** 五气 */
export const WU_QI_NAME = ['嘘', '呵', '呼', '呬', '吹'] as const
/** 五华 */
export const WU_HUA_NAME = ['面', '舌', '唇', '毛', '发'] as const
/** 五体 */
export const WU_TI_NAME = ['筋', '脉', '肉', '皮', '骨'] as const
/** 五神 */
export const WU_SHEN_NAME = ['魂', '神', '意', '魄', '志'] as const
/** 五窍 */
export const WU_QIAO_NAME = ['目', '舌', '口', '鼻', '耳'] as const
/** 五脉 */
export const WUMAI = ['太阳脉', '少阳脉', '阴维脉', '少阴脉', '厥阴脉'] as const

/** 阴阳 */
export const yinYangs: YinYang[] = YIN_YANG_NAME.map<YinYang>((name, index) => ({
  name,
  value: index === 0 ? -1 : 1,
}))

/** 我生 */
export const woSheng = generateRelation<WuXing, WuXing>([...WX_NAME], function (this: WuXing, targetIndex: number) {
  return (this.index + 1) % 5 === targetIndex
})
/** 生我 */
export const shengWo = generateRelation<WuXing, WuXing>([...WX_NAME], function (this: WuXing, targetIndex: number) {
  return (this.index - 1 + 5) % 5 === targetIndex
})
/** 我克 */
export const woKe = generateRelation<WuXing, WuXing>([...WX_NAME], function (this: WuXing, targetIndex: number) {
  return (this.index - targetIndex + 5) % 5 === 3
})
/** 克我 */
export const keWo = generateRelation<WuXing, WuXing>([...WX_NAME], function (this: WuXing, targetIndex: number) {
  return (targetIndex - this.index + 5) % 5 === 3
})
/** 五行 */
export const wuxings: WuXing[] = WX_NAME.map((name, index) => {
  const wuxing = {
    name,
    index,
    numbers: WX_NUMBERS[index],
    SHENG: woSheng,
    SHENG_WO: shengWo,
    KE: woKe,
    KE_WO: keWo,
  } as WuXing

  wuxing.sheng = woSheng.call(wuxing, WX_NAME[(index + 1) % 5])
  wuxing.shengWo = shengWo.call(wuxing, WX_NAME[(index - 1 + 5) % 5])
  wuxing.ke = woKe.call(wuxing, WX_NAME[(index - 3 + 5) % 5])
  wuxing.keWo = keWo.call(wuxing, WX_NAME[(index + 3) % 5])

  return wuxing
})
/** 根据名称获取五行 */
export const getWuXing = (name: string): WuXing | undefined => wuxings.find(item => item.name === name)
console.log('五行：', wuxings)
