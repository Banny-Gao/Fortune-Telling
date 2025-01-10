import { wuxings, yinYangs, getWuXing } from '../wuxing'
import { SEASON_NAME } from '../date'
import { gans } from './gan'

import { getRelation, generateNamesProp, equalName } from '../global'

import type { WuXing, YinYang, WuXingName } from '../wuxing'
import type { SeasonName } from '../date'
import type { GanName } from './gan'
/** 十二地支 */
export type ZhiName = NameConst<typeof ZHI_NAME>
export const ZHI_NAME = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const
/** 生肖 */
export type AnimalName = NameConst<typeof ANIMAL_NAME>
export const ANIMAL_NAME = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'] as const
/** 地理 */
export type GeoName = NameConst<typeof GEO_NAME>
export const GEO_NAME = ['墨池', '柳岸', '广谷', '琼林', '草泽', '大驿', '烽堠', '花园', '名都', '寺钟', '烧原', '悬河'] as const
/** 获取地支的阴阳 */
export const getZhiYinYang = (index: Zhi['index']): YinYang => yinYangs[(index + 1) % 2]
/** 获取地支的五行 */
export const getZhiWuxing = (index: Zhi['index']): WuXing => {
  // 子丑为冬寅为春，通过四季定五行
  const offsetIndex = (-2 + 12 + index) % 12
  // 三个月为一季，季末为土， 寅卯辰 offsetIndex 0,1,2
  const isTu = offsetIndex % 3 === 2
  // 一年四季，春夏秋冬, 五行为木火土金水，夏季后为秋金
  let seasonIndex = Math.floor(offsetIndex / 3) % 4
  seasonIndex = seasonIndex >= 2 ? seasonIndex + 1 : seasonIndex

  const wuxingIndex = isTu ? 2 : seasonIndex

  return wuxings[wuxingIndex]
}
/** 四正|四旺（子午卯酉）旺：水火木金 */
export type SizhengName = (typeof ZHENG_ZHI_NAME)[number][0]
export const ZHENG_ZHI_NAME = [
  ['子', '水'],
  ['午', '火/土'],
  ['卯', '木'],
  ['酉', '金'],
] as const
/** 四隅|四长生（寅申巳亥）长生：火水金木 */
export type SiyuName = (typeof SI_YU_NAME)[number][0]
export const SI_YU_NAME = [
  ['寅', '火'],
  ['申', '水'],
  ['巳', '金'],
  ['亥', '木'],
] as const
/** 四库｜四墓（辰戌丑未）, 皆属土 墓： 水 火 金 木 */
export type SikuName = (typeof SI_KU_NAME)[number][0]
export const SI_KU_NAME = [
  ['辰', '水'],
  ['戌', '火'],
  ['丑', '金'],
  ['未', '木'],
] as const

/** 判断是否属于四正 */
export const isSiZheng = (name: Zhi['name']): boolean => ZHENG_ZHI_NAME.some(([n]) => n === name)
/** 判断是否属于四隅 */
export const isSiYu = (name: Zhi['name']): boolean => SI_YU_NAME.some(([n]) => n === name)
/** 判断是否属于四库 */
export const isSiku = (name: Zhi['name']): boolean => SI_KU_NAME.some(([n]) => n === name)
/** 四正四隅四库统称八宅 */
export const getBazhaiWuxing = (name: Zhi['name']): WuXing[] | undefined => {
  const [_, wuxingName] = [...SI_KU_NAME, ...ZHENG_ZHI_NAME, ...SI_YU_NAME].find(([n]) => n === name) ?? []
  return wuxingName?.split('/').map(wuxing => getWuXing(wuxing as WuXingName) as WuXing)
}
/** 获取三个地支的关系 */
const reflectionOfThree = <T extends readonly (readonly string[])[], M extends RelationField<Zhi, string>>(zhi: Zhi, nameArray: T): M | undefined => {
  for (const item of nameArray) {
    const [hua, ...targetNames] = [...item].reverse()
    if (targetNames.includes(zhi.name)) {
      return {
        index: zhi.index,
        name: zhi.name,
        targetNames: targetNames.filter(name => name !== zhi.name) as ZhiName[],
        wuxing: getWuXing(hua as WuXingName) as WuXing,
        description: hua,
      } as M
    }
  }
}
type RelationField<T extends IndexField, D> = {
  index: number
  name: T['name']
  targetNames: T['name'][]
  wuxing: WuXing
  description: D
}
/** 地支三会 */
export const ZHI_SAN_HUI = [
  ['寅', '卯', '辰', '木'],
  ['巳', '午', '未', '火'],
  ['申', '酉', '戌', '金'],
  ['亥', '子', '丑', '水'],
] as const
export type ZhihuiDescription = (typeof ZHI_SAN_HUI)[number][3]
export type Zhihui = RelationField<Zhi, ZhihuiDescription>
export function zhiHui(this: Zhi): Zhihui | undefined {
  return reflectionOfThree(this, [...ZHI_SAN_HUI])
}
/** 地支三合 */
export const ZHI_SAN_HE = [
  ['申', '子', '辰', '水'],
  ['寅', '午', '戌', '火'],
  ['巳', '酉', '丑', '金'],
  ['亥', '卯', '未', '木'],
] as const
export type ZhiSanHeDescription = (typeof ZHI_SAN_HE)[number][3]
export type ZhiSanHe = RelationField<Zhi, ZhiSanHeDescription>
export function zhiSanHe(this: Zhi): ZhiSanHe | undefined {
  return reflectionOfThree(this, [...ZHI_SAN_HE])
}
/** 地支藏干 */
export const CANG_GAN = [
  ['子', '癸', null, null],
  ['丑', '己', '辛', '癸'],
  ['寅', '甲', '丙', '戊'],
  ['卯', '乙', null, null],
  ['辰', '戊', '癸', '乙'],
  ['巳', '丙', '庚', '戊'],
  ['午', '丁', '己', null],
  ['未', '己', '乙', '丁'],
  ['申', '庚', '壬', '戊'],
  ['酉', '辛', null, null],
  ['戌', '戊', '丁', '辛'],
  ['亥', '壬', '甲', null],
] as const
/** 本气
 * 1. 相同五行属性
 * 2. 四旺为阴，四长生为阳，四墓阴阳与自身相同
 * */
type QiName = GanName | null
const getBenQi = (zhi: Zhi): QiName => {
  const { wuxing, yinYang } = zhi
  const isSiWang = isSiZheng(zhi.name)
  const isSiChangSheng = isSiYu(zhi.name)

  const targetYinYang = isSiWang ? yinYangs[0] : isSiChangSheng ? yinYangs[1] : yinYang
  const benQi = gans.find(gan => equalName(gan.wuxing, wuxing) && equalName(gan.yinYang, targetYinYang))

  return benQi?.name as QiName
}
/**
 * 余气
 * 1. 四旺与水无余气
 * 2. 上支为四旺，余气为上支本气
 * 3.
 */
const getYuQi = (zhi: Zhi): QiName => {
  const { wuxing, index } = zhi
  const isSiWang = isSiZheng(zhi.name)
  const isShui = equalName(wuxing, '水')
  // 四旺与水无余气
  if (isSiWang || isShui) {
    return null
  }
  const prevIndex = index - 1
  const prevZhiName = ZHI_NAME[prevIndex]
  const prevWuxing = getZhiWuxing(prevIndex)
  const prevYinYang = getZhiYinYang(prevIndex)

  // 上支为四旺，余气为上支本气, 本支肯定是四墓
  if (isSiZheng(prevZhiName))
    return getBenQi({
      name: prevZhiName,
      wuxing: prevWuxing,
      yinYang: prevYinYang,
    } as Zhi)

  // 上支为四墓，余气皆为土，阴阳与本气取法相同，长生为阳
  if (isSiku(prevZhiName)) return gans.find(gan => equalName(gan.wuxing, '土') && equalName(gan.yinYang, '阳'))?.name as QiName

  return null
}
/**
 * 中气
 * 1. 本支为四墓, 五行为墓库，取阴
 * 2. 本支四长生，中气五行为我生，取阳
 */
const getZhongQi = (zhi: Zhi): QiName => {
  const { wuxing } = zhi
  // 本支为四墓, 五行为墓库，取阴
  if (isSiku(zhi.name)) {
    const [targetWuxing] = getBazhaiWuxing(zhi.name) ?? []
    return gans.find(gan => equalName(gan.wuxing, targetWuxing) && equalName(gan.yinYang, '阴'))?.name as QiName
  }

  // 本支四长生，中气五行为我生，取阳
  const isSiChangSheng = isSiYu(zhi.name)
  if (isSiChangSheng) {
    // 巳火为阴火,土皆为墓库，生土不合适，火土同宫，所以这里看做土生金
    const targetName = equalName(zhi, '巳') ? '金' : wuxing.sheng.targetName
    return gans.find(gan => equalName(gan.wuxing, targetName as WuXingName) && equalName(gan.yinYang, '阳'))?.name as QiName
  }

  // 本支为四旺，无中气, 但火土同宫, 均为帝旺，火生土助土，所以土为午的中气, 同本气取阴阳，四旺为阴
  if (equalName(zhi, '午')) return gans.find(gan => equalName(gan.wuxing, '土') && equalName(gan.yinYang, '阴'))?.name as QiName

  return null
}
export function getZhiCangGan(this: Zhi): [QiName, QiName, QiName] {
  return [getBenQi(this), getZhongQi(this), getYuQi(this)]
}

/** 掌诀 原点为 中指末关节 和 无名指末关节 中间
 * 子: [1, 0] 丑: [-1, 0]
 */
export type FingerPosition = (typeof FINGER_POSITION)[number]
export const FINGER_POSITION = [
  [1, 0], // 子
  [-1, 0], // 丑
  [-3, 0], // 寅
  [-3, 1], // 卯
  [-3, 2], // 辰
  [-3, 3], // 巳
  [-1, 3], // 午
  [1, 3], // 未
  [3, 3], // 申
  [3, 2], // 酉
  [3, 1], // 戌
  [3, 0], // 亥
] as const

/** 地支六合 */
const ZHI_HE = [
  ['子', '丑', '土/水', '泥合'],
  ['寅', '亥', '木', '义合'],
  ['卯', '戌', '火', '淫合'],
  ['辰', '酉', '金', '融合'],
  ['巳', '申', '水', '刑合'],
  ['午', '未', '土/火', '和合'],
] as const
export type ZhiHeDescription = (typeof ZHI_HE)[number][3]
export type ZhiHe = TargetField<{
  name: ZhiName
  targetName: ZhiName
  hua: WuXing
  huaTwo?: WuXing
  description: ZhiHeDescription
}>

export const getZhiHeTargetIndexByFingerPosition = ([x, y]: FingerPosition): number => FINGER_POSITION.findIndex(([tx, ty]) => tx === -x && ty === y)
// export const getZhiHeTargetNameByWuxing = (zhi: Zhi): ZhiName => {
//   const { name, wuxing, yinYang } = zhi
//   /**
//    * 四正 四库 合
//    *
//    */
//   if (isSiZheng(name) || isSiku(name)) {
//     return
//   }
//   if (isSiYu(name)) {
//     return
//   }
// }

export function zhiHe(this: Zhi, target?: Zhi | ZhiName): ZhiHe | undefined {
  const targetIndex = getZhiHeTargetIndexByFingerPosition(this.fingerPosition)
  target ??= ZHI_NAME[targetIndex]

  const transform = ([_, _name2, huas, description]: string[]): Required<Omit<ZhiHe, keyof TargetField>> => {
    const [hua, huaTwo] = huas.split('/')
    return {
      description: description as ZhiHeDescription,
      hua: getWuXing(hua as WuXingName) as WuXing,
      huaTwo: huaTwo ? (getWuXing(huaTwo as WuXingName) as WuXing) : undefined,
    } as Required<Omit<ZhiHe, keyof TargetField>>
  }

  return getRelation.call(this, {
    target,
    nameArray: [...ZHI_NAME],
    relationArray: ZHI_HE.map(item => [...item]),
    transform,
  }) as ZhiHe
}

/** 地支接口 */
export type Zhi = IndexField<{
  name: ZhiName
  yinYang: YinYang
  wuxing: WuXing
  season: SeasonName
  animal: AnimalName
  fingerPosition: FingerPosition
  HE: typeof zhiHe
  he: ReturnType<typeof zhiHe>
  hui: ReturnType<typeof zhiHui>
  sanHe: ReturnType<typeof zhiSanHe>
  CANG_GAN: typeof getZhiCangGan
  cangGan: ReturnType<typeof getZhiCangGan>
}>
/** 十二地支 */
export const zhis: Zhi[] = ZHI_NAME.map((name, index) => {
  const zhi = {
    ...generateNamesProp(
      {
        animal: ANIMAL_NAME,
        geo: GEO_NAME,
        fingerPosition: FINGER_POSITION,
      },
      index
    ),
    name,
    index,
    yinYang: getZhiYinYang(index),
    wuxing: getZhiWuxing(index),
    season: [...SEASON_NAME][Math.floor(((index - 2 + 12) % 12) / 3)],
    HE: zhiHe,
    CANG_GAN: getZhiCangGan,
  } as Zhi
  //  掌诀 横合 竖害 斜冲
  zhi.he = zhiHe.call(zhi)
  // 地支三会
  zhi.hui = zhiHui.call(zhi)
  // 地支三合
  zhi.sanHe = zhiSanHe.call(zhi)
  // 地支藏干
  zhi.cangGan = getZhiCangGan.call(zhi)

  return zhi
})
console.log('十二地支：', zhis)
// console.log(getZhiHeTargetNameByWuxing(zhis[2]))
