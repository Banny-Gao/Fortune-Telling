import { generateRelation, getObjectByName, generateNamesProp, flushAsync } from './global'

/** 阴阳 */
export type YinYang = OptionField<{
  name: YinYangName
  value: YinYangValue
  opposite?: YinYang
}>
export type YinYangName = NameConst<typeof YIN_YANG_NAME>
export type YinYangValue = -1 | 1
export const YIN_YANG_NAME = ['阴', '阳'] as const
export const yinYangs: YinYang[] = YIN_YANG_NAME.map<YinYang>((name, index) => ({
  name,
  value: index === 0 ? -1 : 1,
  opposite: {
    name: index === 0 ? '阳' : '阴',
    value: index === 0 ? 1 : -1,
  },
}))

/** 五行 */
export type WuXingName = NameConst<typeof WX_NAME>
export const WX_NAME = ['木', '火', '土', '金', '水'] as const

/** 五行数字 */
export type WuXingNumbers = (typeof WX_NUMBERS)[number]
export const WX_NUMBERS = [
  /** 五行数字 */
  [3, 8], // 木
  [2, 7], // 火
  [5, 10], // 土
  [4, 9], // 金
  [1, 6], // 水
] as const

/** 方位 */
export type DirectionName = NameConst<typeof DIRECTION_NAME>
export const DIRECTION_NAME = ['东', '南', '中', '西', '北'] as const

/** 五常 */
export type WuChangName = NameConst<typeof WU_CHANG_NAME>
export const WU_CHANG_NAME = ['仁', '礼', '信', '义', '智'] as const

/** 五脏 */
export type WuZangName = NameConst<typeof WU_ZANG_NAME>
export const WU_ZANG_NAME = ['肝', '心', '脾', '肺', '肾'] as const

/** 六腑 */
export type WuFuName = NameConst<typeof WU_FU_NAME>
export const WU_FU_NAME = ['胆', '小肠', '胃', '大肠', '膀胱'] as const

/** 五色 */
export type WuSeName = NameConst<typeof WU_SE_NAME>
export const WU_SE_NAME = ['青', '赤', '黄', '白', '黑'] as const

/** 五味 */
export type WuWeiName = NameConst<typeof WU_WEI_NAME>
export const WU_WEI_NAME = ['酸', '苦', '甘', '辛', '咸'] as const

/** 五志 */
export type WuZhiName = NameConst<typeof WU_ZHI_NAME>
export const WU_ZHI_NAME = ['怒', '喜', '思', '悲', '恐'] as const

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
export type WuXing = IndexField<{
  name: WuXingName
  numbers: WuXingNumbers
  sheng: ReturnType<typeof woSheng>
  shengWo: ReturnType<typeof shengWo>
  ke: ReturnType<typeof woKe>
  keWo: ReturnType<typeof keWo>
  wuzang: WuZangName
  liuFu: WuFuName
  wuzhi: WuZhiName
  wuwei: WuWeiName
  wuse: WuSeName
}>
export const wuxings: WuXing[] = WX_NAME.map((name, index) => {
  const wuxing = {
    ...generateNamesProp(
      {
        fangwei: DIRECTION_NAME,
        wuzang: WU_ZANG_NAME,
        liuFu: WU_FU_NAME,
        wuzhi: WU_ZHI_NAME,
        wuwei: WU_WEI_NAME,
        wuse: WU_SE_NAME,
      },
      index
    ),
    name,
    index,
  } as WuXing

  flushAsync([
    () => {
      wuxing.sheng = woSheng.call(wuxing, WX_NAME[(index + 1) % 5])
      wuxing.shengWo = shengWo.call(wuxing, WX_NAME[(index - 1 + 5) % 5])
      wuxing.ke = woKe.call(wuxing, WX_NAME[(index - 3 + 5) % 5])
      wuxing.keWo = keWo.call(wuxing, WX_NAME[(index + 3) % 5])
    },
  ])

  return wuxing
})

/** 根据名称获取五行 */
export const getWuXing = (name: WuXingName): WuXing | undefined => getObjectByName(wuxings, name)
console.log('五行：', wuxings)
