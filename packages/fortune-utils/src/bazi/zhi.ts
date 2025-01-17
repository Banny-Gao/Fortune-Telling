import { getWuxings, getYinYangs, getWuXing } from '../wuxing'
import { SEASON_NAME } from '../date'
import { getGans } from './gan'
import { getCache, CacheKey } from '../utils/caches'
import { getShishen } from './shishen'
import { getRelation, generateNamesProp, equalName, asyncExec } from '../global'

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
export const getZhiYinYang = (index: Zhi['index']): YinYang => getYinYangs()[(index + 1) % 2]

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

  return getWuxings()[wuxingIndex]
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
/** 获取八宅五行 */
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
        hua: getWuXing(hua as WuXingName) as WuXing,
        description: hua,
      } as M
    }
  }
}
type RelationField<T extends IndexField, D> = {
  index: number
  name: T['name']
  targetNames: T['name'][]
  hua: WuXing
  description: D
}

/** 地支三会 */
export const ZHI_SAN_HUI = [
  ['寅', '卯', '辰', '木'],
  ['巳', '午', '未', '火'],
  ['申', '酉', '戌', '金'],
  ['亥', '子', '丑', '水'],
] as const
export type ZhiHuiDescription = (typeof ZHI_SAN_HUI)[number][3]
export type ZhiHui = RelationField<Zhi, ZhiHuiDescription>
export function zhiHui(this: Zhi): ZhiHui | undefined {
  return reflectionOfThree(this, [...ZHI_SAN_HUI])
}

/** 地支三合 */
export const ZHI_SAN_HE = [
  ['亥', '卯', '未', '木'],
  ['寅', '午', '戌', '火'],
  ['巳', '酉', '丑', '金'],
  ['申', '子', '辰', '水'],
] as const
export type ZhiSanHeDescription = (typeof ZHI_SAN_HE)[number][3]
export type ZhiSanHe = RelationField<Zhi, ZhiSanHeDescription>
export function zhiSanHe(this: Zhi): ZhiSanHe | undefined {
  return reflectionOfThree(this, [...ZHI_SAN_HE])
}

/** 地支半合 */
/** 生旺半合 */
export const SHENG_WANG = [
  ['申', '子', '水'],
  ['寅', '午', '火'],
  ['亥', '卯', '木'],
  ['巳', '酉', '金'],
] as const
/** 墓旺半合 */
export const MU_WANG = [
  ['子', '辰', '水'],
  ['午', '戌', '火'],
  ['卯', '未', '木'],
  ['酉', '丑', '金'],
] as const
/** 生墓拱合 */
export const SHENG_MU = [
  ['申', '辰', '水'],
  ['寅', '戌', '火'],
  ['巳', '丑', '金'],
  ['亥', '未', '木'],
] as const
enum ZhiBanHeDescription {
  ShengWang = '生旺半合',
  MuWang = '墓旺半合',
  ShengMu = '生墓拱合',
}
export type ZhiBanHe = TargetField<{
  name: ZhiName
  targetName: ZhiName
  wuxing: WuXing
  description: ZhiBanHeDescription
}>
const getGroups = (nameArraies: (readonly string[])[]): string[][] =>
  nameArraies.reduce<string[][]>((acc, cur) => {
    acc.push([...cur.slice(0, 2)])
    return acc
  }, [])
const getTargetName = (item: string[], name: string): string => {
  const [name1, name2] = item
  return name1 === name ? name2 : name1
}
export function zhiBanHe(this: Zhi, target?: Zhi | ZhiName): ZhiBanHe | ZhiBanHe[] | undefined {
  const groups = getGroups([...SHENG_WANG, ...MU_WANG, ...SHENG_MU])

  if (!target) {
    const targetNames = groups
      .filter(item => item.includes(this.name))
      .map(item => getTargetName(item, this.name))
      .flat() as ZhiName[]
    return targetNames.map(name => zhiBanHe.call(this, name)) as [ZhiBanHe, ZhiBanHe]
  }
  const isEqual = (a: readonly (readonly string[])[], b: ZhiName[]): boolean => a.some(item => item.slice(0, 2).sort().toString() === b.sort().toString())

  const isShengwang = (names: ZhiName[]): boolean => isEqual(SHENG_WANG, names)
  const isMuwang = (names: ZhiName[]): boolean => isEqual(MU_WANG, names)
  const isShengmu = (names: ZhiName[]): boolean => isEqual(SHENG_MU, names)
  const getDescription = (names: ZhiName[]): ZhiBanHeDescription | undefined => {
    if (isShengwang(names)) return ZhiBanHeDescription.ShengWang
    if (isMuwang(names)) return ZhiBanHeDescription.MuWang
    if (isShengmu(names)) return ZhiBanHeDescription.ShengMu
    return undefined
  }

  const transform = ([name1, name2, hua]: string[]): Required<Omit<ZhiBanHe, keyof TargetField>> =>
    ({
      description: getDescription([name1, name2] as ZhiName[]),
      wuxing: getWuXing(hua as WuXingName) as WuXing,
    }) as Required<Omit<ZhiBanHe, keyof TargetField>>

  return getRelation.call(this, {
    target,
    nameArray: [...ZHI_NAME],
    relationArray: [...SHENG_WANG, ...MU_WANG, ...SHENG_MU].map(item => [...item]),
    transform,
  }) as ZhiBanHe
}

/** 地支藏干 */
export const CANG_GAN_NAME = [
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
  const gans = getGans()
  const yinYangs = getYinYangs()
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
  const gans = getGans()
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
  const gans = getGans()
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
/** 藏干 */
export type ZhiCangGan = [QiName, QiName, QiName]
export function getZhiCangGan(this: Zhi): ZhiCangGan {
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
/** 掌诀获取索引， 横合 */
export const getZhiHeTargetIndexByFingerPosition = ([x, y]: FingerPosition): number => FINGER_POSITION.findIndex(([tx, ty]) => tx === -x && ty === y)
/** 三合中看六合 */
export const getZhiHeTargetName = (zhi: Zhi): ZhiName => {
  /**
   * 六合可从三合局看
   * 我为阳，合者局生助我局，我为阴，我生助合者局
   * 长生自合，墓旺相合，均衡
   */
  const { name, yinYang } = zhi
  const sanHe = zhiSanHe.call(zhi)
  const hua = yinYang.name === '阳' ? sanHe?.hua.shengWo : sanHe?.hua.sheng
  const targetSanhe = [...ZHI_SAN_HE].find(item => item[3] === hua?.targetName)
  const i = isSiYu(name) ? 0 : isSiZheng(name) ? 2 : 1

  return targetSanhe?.[i] as ZhiName
}
export function zhiHe(this: Zhi, target?: Zhi | ZhiName): ZhiHe | undefined {
  // const targetIndex = getZhiHeTargetIndexByFingerPosition(this.fingerPosition)
  // target ??= ZHI_NAME[targetIndex]
  const targetName = getZhiHeTargetName(this)
  target ??= targetName

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

/** 地支六冲*/
export const ZHI_CHONG = [
  ['子', '午'],
  ['丑', '未'],
  ['寅', '申'],
  ['卯', '酉'],
  ['辰', '戌'],
  ['巳', '亥'],
] as const
export type ZhiChong = TargetField<{
  name: ZhiName
  targetName: ZhiName
}>
export function zhiChong(this: Zhi, target?: Zhi | ZhiName): ZhiChong | undefined {
  target ??= ZHI_NAME[(this.index + 6) % 12]
  return getRelation.call(this, {
    target,
    nameArray: [...ZHI_NAME],
    relationArray: ZHI_CHONG.map(item => [...item]),
  }) as ZhiChong
}

/**
 * 地支相穿(害)
 * 不影响格局，但损六亲
 * */
export const ZHI_HAI = [
  ['子', '未', '势家相害'],
  ['丑', '午', '官鬼相害'],
  ['寅', '巳', '临官相害'],
  ['卯', '辰', '凌长相害'],
  ['申', '亥', '争进相害'],
  ['酉', '戌', '嫉妒相害'],
] as const
export type ZhiHaiDescription = (typeof ZHI_HAI)[number][2]
export type ZhiHai = TargetField<{
  name: ZhiName
  targetName: ZhiName
  description: ZhiHaiDescription
}>
/** 竖害 */
export const getZhiHaiTargetIndexByFingerPosition = ([x, y]: FingerPosition): number => FINGER_POSITION.findIndex(([tx, ty]) => tx === x && ty === 3 - y)
/** 三合中看六害 */
export const getZhiHaiTargetName = (zhi: Zhi): ZhiName => {
  /**
   * 六害从三合局看
   * 我为阳，害我者我生，我生为土看我克
   * 我为阴，害我者生我，生我为土看克我
   * 长生自害，墓旺相害，均衡
   */
  const { name, yinYang } = zhi
  const sanHe = zhiSanHe.call(zhi)
  const hua =
    yinYang.name === '阳'
      ? sanHe?.hua.sheng.targetName !== '土'
        ? sanHe?.hua.sheng
        : sanHe?.hua.ke
      : sanHe?.hua.shengWo.targetName !== '土'
        ? sanHe?.hua.shengWo
        : sanHe?.hua.keWo

  const targetSanhe = [...ZHI_SAN_HE].find(item => item[3] === hua?.targetName)
  const i = isSiYu(name) ? 0 : isSiZheng(name) ? 2 : 1

  return targetSanhe?.[i] as ZhiName
}
export function zhiHai(this: Zhi, target?: Zhi | ZhiName): ZhiHai | undefined {
  // const targetIndex = getZhiHaiTargetIndexByFingerPosition(this.fingerPosition)
  // target ??= ZHI_NAME[targetIndex]
  target ??= getZhiHaiTargetName(this)

  const transform = ([_, _name2, description]: string[]): Required<Omit<ZhiHai, keyof TargetField>> =>
    ({
      description: description as ZhiHaiDescription,
    }) as Required<Omit<ZhiHai, keyof TargetField>>

  return getRelation.call(this, {
    target,
    nameArray: [...ZHI_NAME],
    relationArray: ZHI_HAI.map(item => [...item]),
    transform,
  }) as ZhiHai
}

/** 地支六破 */
export const ZHI_PO = [
  ['子', '酉'],
  ['午', '卯'],
  ['寅', '亥'],
  ['巳', '申'],
  ['辰', '丑'],
  ['戌', '未'],
] as const
export type ZhiPo = TargetField<{
  name: ZhiName
  targetName: ZhiName
}>
/** 三合中看六害 */
export const getZhiPoTargetName = (zhi: Zhi): ZhiName => {
  /**
   * 六破从三合局看
   * 我为阳，破我者生我。我为阴，破我者我生
   * 与我同方
   */
  const { name, yinYang } = zhi
  const sanHe = zhiSanHe.call(zhi)
  const hua = yinYang.name === '阳' ? sanHe?.hua.shengWo : sanHe?.hua.sheng

  const targetSanhe = [...ZHI_SAN_HE].find(item => item[3] === hua?.targetName)
  const i = isSiYu(name) ? 0 : isSiZheng(name) ? 1 : 2

  return targetSanhe?.[i] as ZhiName
}
export function zhiPo(this: Zhi, target?: Zhi | ZhiName): ZhiPo | undefined {
  target ??= getZhiPoTargetName(this)
  return getRelation.call(this, {
    target,
    nameArray: [...ZHI_NAME],
    relationArray: ZHI_PO.map(item => [...item]),
  }) as ZhiPo
}

/** 地支三刑 */
export const ZHI_XING = [
  ['寅', '巳', '无恩之刑'],
  ['巳', '申', '无恩之刑'],
  ['申', '寅', '无恩之刑'],
  ['丑', '戌', '恃势之刑'],
  ['戌', '未', '恃势之刑'],
  ['未', '丑', '恃势之刑'],
  ['子', '卯', '无礼之刑'],
  ['卯', '子', '无礼之刑'],
  ['辰', '辰', '自刑之刑'],
  ['午', '午', '自刑之刑'],
  ['酉', '酉', '自刑之刑'],
  ['亥', '亥', '自刑之刑'],
] as const
export type ZhiSanXingDescription = (typeof ZHI_XING)[number][2]
export type ZhiSanXing = TargetField<{
  name: ZhiName
  targetName: ZhiName
  description: ZhiSanXingDescription
}>
export const getZhiXingTargetName = (zhi: Zhi): ZhiName => {
  /** 三合、三会论三刑
   * 火金看同我，水看我生，木看生我
   */
  const { name } = zhi
  const sanHe = zhiSanHe.call(zhi)
  let hua: string | undefined
  switch (sanHe?.hua.name) {
    case '水':
      hua = sanHe?.hua.sheng.targetName
      break
    case '木':
      hua = sanHe?.hua.shengWo.targetName
      break
    default:
      hua = sanHe?.hua.name
      break
  }

  const targetSanhe = [...ZHI_SAN_HUI].find(item => item[3] === hua)
  const i = isSiYu(name) ? 0 : isSiZheng(name) ? 1 : 2

  return targetSanhe?.[i] as ZhiName
}
export function zhiXing(this: Zhi, target?: Zhi | ZhiName): ZhiSanXing | undefined {
  target ??= getZhiXingTargetName(this)
  const transform = ([_, _name2, description]: string[]): Required<Omit<ZhiSanXing, keyof TargetField>> =>
    ({
      description: description as ZhiSanXingDescription,
    }) as Required<Omit<ZhiSanXing, keyof TargetField>>

  return getRelation.call(this, {
    target,
    nameArray: [...ZHI_NAME],
    relationArray: ZHI_XING.map(item => [...item]),
    transform,
  }) as ZhiSanXing
}

/** 地支暗合 */
export const ZHI_AN_HE = [
  ['寅', '丑', '通合'],
  ['亥', '午', '通合'],
  ['卯', '申', '通禄合'],
  ['巳', '酉', '通禄合'],
  ['子', '巳', '通禄合'],
  ['寅', '午', '通禄合'],
] as const
export type ZhiAnHeDescription = (typeof ZHI_AN_HE)[number][2]
export type ZhiAnHe = TargetField<{
  name: ZhiName
  targetName: ZhiName
  description: ZhiAnHeDescription
}>

export function zhiAnHe(this: Zhi, target?: Zhi | ZhiName): ZhiAnHe | ZhiAnHe[] | undefined {
  if (!target) {
    const groups = getGroups([...ZHI_AN_HE])

    const targetNames = groups
      .filter(item => item.includes(this.name))
      .map(item => getTargetName(item, this.name))
      .flat() as ZhiName[]
    target = targetNames[0]
    if (!target) return void 0
    if (targetNames.length > 1) return targetNames.map(name => zhiAnHe.call(this, name)) as ZhiAnHe[]
  }

  const transform = ([_, _name2, description]: string[]): Required<Omit<ZhiAnHe, keyof TargetField>> =>
    ({
      description: description as ZhiAnHeDescription,
    }) as Required<Omit<ZhiAnHe, keyof TargetField>>

  return getRelation.call(this, {
    target,
    nameArray: [...ZHI_NAME],
    relationArray: ZHI_AN_HE.map(item => [...item]),
    transform,
  }) as ZhiAnHe
}

/** 地支接口 */
export type Zhi = IndexField<{
  name: ZhiName
  yinYang: YinYang
  wuxing: WuXing
  season: SeasonName
  animal: AnimalName
  fingerPosition: FingerPosition
  he: ReturnType<typeof zhiHe>
  hui: ReturnType<typeof zhiHui>
  sanHe: ReturnType<typeof zhiSanHe>
  banHe: ReturnType<typeof zhiBanHe>
  cangGan: ReturnType<typeof getZhiCangGan>
  chong: ReturnType<typeof zhiChong>
  hai: ReturnType<typeof zhiHai>
  po: ReturnType<typeof zhiPo>
  xing: ReturnType<typeof zhiXing>
  anHe: ReturnType<typeof zhiAnHe>
  shishen: ReturnType<typeof getShishen>
}>
/** 十二地支 */
export const getZhis = (): Zhi[] =>
  getCache(CacheKey.DI_ZHI, () =>
    ZHI_NAME.map((name, index) => {
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
      } as Zhi

      zhi.he = zhiHe.call(zhi)
      zhi.hui = zhiHui.call(zhi)
      zhi.sanHe = zhiSanHe.call(zhi)
      // 地支半合
      zhi.banHe = zhiBanHe.call(zhi)
      // 地支藏干
      zhi.cangGan = getZhiCangGan.call(zhi)
      // 地支六冲
      zhi.chong = zhiChong.call(zhi)
      // 地支相穿
      zhi.hai = zhiHai.call(zhi)
      // 地支六破
      zhi.po = zhiPo.call(zhi)
      // 地支三刑
      zhi.xing = zhiXing.call(zhi)
      // 地支暗合
      zhi.anHe = zhiAnHe.call(zhi)

      asyncExec(() => {
        // 十神
        zhi.shishen = getShishen.call(zhi)
      })

      return zhi
    })
  )
