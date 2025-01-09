import { wuxings, yinYangs, getWuXing } from '../wuxing'
import { SOLAR_TERM, SEASON_NAME, getSolarTerms, getSolarAndLunarDate } from '../date'

import { lcm } from '../utils/math'
import { getRelation, generateNamesProp } from '../global'

import type { WuXing, YinYang, WuXingName } from '../wuxing'
import type { SeasonName, LunarDate } from '../date'
import type { GanZhiShishen } from './shishen'

/** 十天干 */
export type GanName = NameConst<typeof GAN_NAME>
export const GAN_NAME = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const

/** 天干五合 */
export const GAN_HE = [
  ['甲', '己', '土', '中正'],
  ['乙', '庚', '金', '仁义'],
  ['丙', '辛', '水', '威制'],
  ['丁', '壬', '木', '淫慝'],
  ['戊', '癸', '火', '无情'],
] as const
export type GanHeDescription = (typeof GAN_HE)[number][3]
export type GanHe = TargetField<{
  name: GanName
  description: GanHeDescription
  hua?: WuXing
}>
/** thisArg, 不可为箭头函数 */
export function ganHe(this: Gan, target?: Gan | GanName): GanHe | undefined {
  target ??= GAN_NAME[(this.index + 5) % 10]
  const transform = ([_, _name2, hua, description]: string[]): Required<Omit<GanHe, keyof TargetField>> =>
    ({
      description: description as GanHeDescription,
      hua: getWuXing(hua as WuXingName) as WuXing,
    }) as Required<Omit<GanHe, keyof TargetField>>

  return getRelation.call(this, {
    target,
    nameArray: [...GAN_NAME],
    relationArray: GAN_HE.map(item => [...item]),
    transform,
  }) as GanHe
}

/** 天干相冲 */
export const GAN_CHONG = [
  ['甲', '庚'],
  ['乙', '辛'],
  ['丙', '壬'],
  ['丁', '癸'],
] as const
export type GanChong = TargetField<{
  name: GanName
  targetName: GanName
}>
export function ganChong(this: Gan, target?: Gan | GanName): GanChong | undefined {
  target ??= GAN_NAME[(this.index + 6) % 10]
  return getRelation.call(this, {
    target,
    nameArray: [...GAN_NAME],
    relationArray: GAN_CHONG.map(item => [...item]),
  }) as GanChong
}

/** 十二长生 todo */
export type TwelveLongLifeName = NameConst<typeof TWELVE_LONG_LIFE_NAME>
export const TWELVE_LONG_LIFE_NAME = ['长生', '沐浴', '冠带', '临官', '帝旺', '衰', '病', '死', '墓', '绝', '胎', '养'] as const

/** 天干接口 */
export type Gan = IndexField<{
  name: GanName
  /** 天干
   * 阴阳交替
   * 甲乙东方木，丙丁南方火，戊己中央土，庚辛西方金，壬癸北方水
   */
  yinYang: YinYang
  wuxing: WuXing
  /*
   * 五虎遁: 年上起月，表示正月天干
   * 甲己之年丙作首，乙庚之岁戊为头，丙辛之岁寻庚起，丁壬壬位顺行流，戊癸何方发，壬子是真途
   * targetName: 正月天干
   */
  wuhudun: TargetField
  /**
   * 五鼠遁: 日上起时，表示子时天干
   * 甲己还加甲，乙庚丙作初，丙辛从戊起，丁壬庚子居，戊癸何方发，壬子是真途
   * targetName: 子时天干
   */
  wushudun: TargetField
  /** 合 */
  he: ReturnType<typeof ganHe>
  HE: typeof ganHe
  /** 冲 */
  chong: ReturnType<typeof ganChong>
  CHONG: typeof ganChong
}>
/** 十天干 */
export const gans: Gan[] = GAN_NAME.map((name, index) => {
  const gan = {
    index,
    name,
    yinYang: yinYangs[(index + 1) % 2],
    wuxing: wuxings[Math.floor(index / 2) % 5],
    wuhudun: {
      name,
      index,
      targetName: GAN_NAME[((index + 1) % 5) * 2],
      targetIndex: ((index + 1) % 5) * 2,
    },
    wushudun: {
      name,
      index,
      targetName: GAN_NAME[(index % 5) * 2],
      targetIndex: (index % 5) * 2,
    },
    HE: ganHe,
    CHONG: ganChong,
  } as Gan
  gan.he = ganHe.call(gan, GAN_NAME[(gan.index + 5) % 10])
  gan.chong = ganChong.call(gan, GAN_NAME[(gan.index + 6) % 10])

  return gan
})
console.log('十天干：', gans)

/** 十二地支 */
export type ZhiName = NameConst<typeof ZHI_NAME>
export const ZHI_NAME = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const
/** 生肖 */
export type AnimalName = NameConst<typeof ANIMAL_NAME>
export const ANIMAL_NAME = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'] as const
/** 地理 */
export type GeoName = NameConst<typeof GEO_NAME>
export const GEO_NAME = ['墨池', '柳岸', '广谷', '琼林', '草泽', '大驿', '烽堠', '花园', '名都', '寺钟', '烧原', '悬河'] as const

/** 地支三会 */
export const ZHI_SAN_HUI = [
  ['寅', '卯', '辰', '木'],
  ['巳', '午', '未', '火'],
  ['申', '酉', '戌', '金'],
  ['亥', '子', '丑', '水'],
] as const
export type ZhihuiDescription = (typeof ZHI_SAN_HUI)[number][3]
export type Zhihui = {
  index: number
  name: ZhiName
  targetNames: ZhiName[]
  wuxing: WuXing
  description: ZhihuiDescription
}
export function zhiHui(this: Zhi): Zhihui | undefined {
  for (const item of ZHI_SAN_HUI) {
    const [hua, ...targetNames] = [...item].reverse()
    if (targetNames.includes(this.name)) {
      return {
        index: this.index,
        name: this.name,
        targetNames: targetNames.filter(name => name !== this.name) as ZhiName[],
        wuxing: getWuXing(hua as WuXingName) as WuXing,
        description: hua as ZhihuiDescription,
      }
    }
  }
}
/** 四正|四旺（子午卯酉）旺：水火木金 */
export type SizhengName = NameConst<typeof ZHENG_ZHI_NAME>
export const ZHENG_ZHI_NAME = ['子', '午', '卯', '酉'] as const
/** 四隅|四长生（寅申巳亥）长生：火水金木 */
export type SiyuName = NameConst<typeof SI_YU_NAME>
export const SI_YU_NAME = ['寅', '申', '巳', '亥'] as const
/** 四库｜四墓（辰戌丑未）, 皆属土 墓： 水 火 金 木 */
export type SikuName = NameConst<typeof SI_KU_NAME>
export const SI_KU_NAME = ['辰', '戌', '丑', '未'] as const

/** 判断是否属于四正 */
export const isSiZheng = (name: Zhi['name']): boolean => ZHENG_ZHI_NAME.includes(name as SizhengName)
/** 判断是否属于四隅 */
export const isSiYu = (name: Zhi['name']): boolean => SI_YU_NAME.includes(name as SiyuName)
/** 判断是否属于四库 */
export const isSiku = (name: Zhi['name']): boolean => SI_KU_NAME.includes(name as SikuName)

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
  } as Zhi
  //  掌诀 横合 竖害 斜冲
  zhi.he = zhiHe.call(zhi)
  // 地支三会
  zhi.hui = zhiHui.call(zhi)

  return zhi
})
console.log('十二地支：', zhis)
// console.log(getZhiHeTargetNameByWuxing(zhis[2]))

/** 获取十神 */
export type Shishen = TargetField<{
  name: GanName | ZhiName
  targetName: GanName | ZhiName
  forTarget?: GanZhiShishen
  forMe?: GanZhiShishen
}>

/** 纳音五行 */
export type GanZhiName = (typeof NAYIN_WUXING)[number][0 | 1]
export type NayinName = (typeof NAYIN_WUXING)[number][2]
export type GanZhi = IndexField<{
  name: GanZhiName
  gan: Gan
  zhi: Zhi
  nianYin: NayinName
}>
export const NAYIN_WUXING = [
  ['甲子', '乙丑', '海中金'],
  ['丙寅', '丁卯', '炉中火'],
  ['戊辰', '己巳', '大林木'],
  ['庚午', '辛未', '路旁土'],
  ['壬申', '癸酉', '剑锋金'],
  ['甲戌', '乙亥', '山头火'],
  ['丙子', '丁丑', '涧下水'],
  ['戊寅', '己卯', '城头土'],
  ['庚辰', '辛巳', '白蜡金'],
  ['壬午', '癸未', '杨柳木'],
  ['甲申', '乙酉', '泉中水'],
  ['丙戌', '丁亥', '屋上土'],
  ['戊子', '己丑', '霹雳火'],
  ['庚寅', '辛卯', '松柏木'],
  ['壬辰', '癸巳', '长流水'],
  ['甲午', '乙未', '沙中金'],
  ['丙申', '丁酉', '山下火'],
  ['戊戌', '己亥', '平地木'],
  ['庚子', '辛丑', '壁上土'],
  ['壬寅', '癸卯', '金箔金'],
  ['甲辰', '乙巳', '覆灯火'],
  ['丙午', '丁未', '天河水'],
  ['戊申', '己酉', '大驿土'],
  ['庚戌', '辛亥', '钗钏金'],
  ['壬子', '癸丑', '桑柘木'],
  ['甲寅', '乙卯', '太溪水'],
  ['丙辰', '丁巳', '沙中土'],
  ['戊午', '己未', '天上火'],
  ['庚申', '辛酉', '石榴木'],
  ['壬戌', '癸亥', '大海水'],
] as const

/** 获取干支纳音 */
export const getNianYin = (name: GanZhiName): NayinName => {
  let result
  for (const [item1, item2, nayin] of NAYIN_WUXING) {
    if ([item1, item2].includes(name)) {
      result = nayin
      break
    }
  }

  return result as NayinName
}
/** 获取干支组合 */
export const getGanZhiByIndex = (index: number): GanZhi => {
  const gan = gans[index % 10]
  const zhi = zhis[index % 12]
  const name = `${gan.name}${zhi.name}` as GanZhiName
  const nianYin = getNianYin(name)

  return {
    index,
    name,
    gan,
    zhi,
    nianYin,
  }
}
/** 根据干支名获取在六十干支中的索引 */
export const getGanZhiIndexByName = (name: string): number => {
  const index = SIXTY_JIAZI.findIndex(jiazi => jiazi.name === name)
  return index
}
export const composeGanZhi = (gan: Gan, zhi: Zhi): GanZhi => {
  const name = `${gan.name}${zhi.name}` as GanZhiName
  const index = getGanZhiIndexByName(name)
  const nianYin = getNianYin(name)
  return {
    index,
    name,
    gan,
    zhi,
    nianYin,
  }
}
/** 六十干支组合对象表 */
export const generateSixtyJiaZi = (): GanZhi[] => {
  const length = lcm(GAN_NAME.length, ZHI_NAME.length)
  return Array.from({ length }, (_, i) => getGanZhiByIndex(i))
}
/** 六十干支 */
export const SIXTY_JIAZI: GanZhi[] = generateSixtyJiaZi()

/** 获取年的天干 */
export const getYearGan = (year: number): Gan => {
  const index = (year - 4) % 10
  return gans[index]
}
/**获取年的地支 */
export const getYearZhi = (year: number): Zhi => {
  const index = (year - 4) % 12
  return zhis[index]
}
/** 节气对应的月干偏移 */
export const SOLAR_TERM_OFFSET: Record<string, number> = Object.fromEntries(SOLAR_TERM.map((term, index) => [term, Math.floor(index / 2)]))
/** 获取某年某月某日节气的月干偏移 */
export const getMonthGanOffset = (lunarDate: LunarDate): number => {
  const [currentSolarTerm] = getSolarTerms(lunarDate)
  const solarTermOffset = SOLAR_TERM_OFFSET[currentSolarTerm.name]
  return solarTermOffset
}
/** 获取农历某月某天所在的月的天干 */
export const getMonthGan = (lunarDate: LunarDate, yearGan: Gan): Gan => {
  // 正月天干的序号
  const firstMonthGanIndex = yearGan.wuhudun.targetIndex
  // 月干偏移
  const monthOffset = getMonthGanOffset(lunarDate)

  const index = (firstMonthGanIndex + monthOffset) % 10
  return gans[index]
}
/** 获取农历某月某天所在的月的地支 */
export const getMonthZhi = (lunarDate: LunarDate): Zhi => {
  // 月干偏移
  const monthOffset = getMonthGanOffset(lunarDate)

  // 正月对应寅月，需要加上2个偏移
  const index = (monthOffset + 2) % 12
  return zhis[index]
}
/** 获取农历某月某天所在的日的干支 */
export const getDayGanZhi = (lunarDate: LunarDate): GanZhi => {
  // 1900年1月1日的干支是"甲戌"，即第10个干支
  const BASE_JIAZI_INDEX = 10

  // 使用北京时间进行计算
  const date = new Date(
    lunarDate.solarDate.getFullYear(),
    lunarDate.solarDate.getMonth(),
    lunarDate.solarDate.getDate(),
    12, // 使用正午12点来避免跨日问题
    0,
    0
  )
  // 转换为北京时间的时间戳
  const timestamp = date.getTime()

  // 计算与1900年1月1日的天数差
  const baseDate = new Date(1900, 0, 1, 12, 0, 0)
  const baseDateTimestamp = baseDate.getTime()

  const offset = Math.floor((timestamp - baseDateTimestamp) / (24 * 60 * 60 * 1000))

  // 计算干支索引
  const jiaziIndex = (offset + BASE_JIAZI_INDEX) % 60

  return SIXTY_JIAZI[jiaziIndex]
}
/** 获取时辰索引：23:00-00:59 为子时(0)，01:00-02:59 为丑时(1)，以此类推 */
export const getZhiShiIndex = (hour: number): number => Math.floor(((hour + 1) % 24) / 2)
/** 获取农历某月某天某时的天干：日上起时，五鼠遁 */
export const getHourGan = (lunarDate: LunarDate, dayGan: Gan): Gan => {
  const hourIndex = getZhiShiIndex(lunarDate.hour)
  return gans[(dayGan.wushudun.targetIndex + hourIndex) % 10]
}
/** 获取农历某月某天某时的地支 */
export const getHourZhi = (lunarDate: LunarDate): Zhi => {
  return zhis[getZhiShiIndex(lunarDate.hour)]
}

/** 八字接口 */
export interface Bazi {
  sizhu: GanZhi[]
  tiangan: Gan[]
  dizhi: Zhi[]
  canggan?: Gan[]
}

/** 获取八字 */
export const getBazi = async (date: Date, address?: number | string): Promise<Bazi> => {
  const lunarDate = await getSolarAndLunarDate(date, address)
  console.log('农历日期：', lunarDate)
  // 年柱
  const yearGan = getYearGan(lunarDate.year)
  const yearZhi = getYearZhi(lunarDate.year)
  const yearZhu = composeGanZhi(yearGan, yearZhi)
  // 月柱
  const monthGan = getMonthGan(lunarDate, yearGan)
  const monthZhi = getMonthZhi(lunarDate)
  const monthZhu = composeGanZhi(monthGan, monthZhi)
  // 日柱
  const dayZhu = getDayGanZhi(lunarDate)
  // 时柱
  const hourGan = getHourGan(lunarDate, dayZhu.gan)
  const hourZhi = getHourZhi(lunarDate)
  const hourZhu = composeGanZhi(hourGan, hourZhi)

  const sizhu: GanZhi[] = [yearZhu, monthZhu, dayZhu, hourZhu]
  const tiangan: Gan[] = [yearGan, monthGan, dayZhu.gan, hourGan]
  const dizhi: Zhi[] = [yearZhi, monthZhi, dayZhu.zhi, hourZhi]

  console.log('天干：', tiangan)
  console.log('地支：', dizhi)
  console.log('四柱：', sizhu)

  return {
    sizhu,
    tiangan,
    dizhi,
  }
}
