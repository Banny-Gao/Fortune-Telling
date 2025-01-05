import { wuxings, yinYangs, getWuXing } from './wuxing'
import { SOLAR_TERM, seasons, getSolarTerms, getSolarAndLunarDate } from './date'
import { animals, directions } from './constant'
import { lcm } from './utils/math'
import { getRelation } from './global'

import type { IndexField, TargetField } from './global'
import type { LunarDate } from './date'
import type { WuXing, YinYang, WuXingName } from './wuxing'
import type { Direction } from './constant'

/** 天干接口 */
export type GanName = (typeof GAN_NAME)[number]
export type Gan = IndexField<{
  name: GanName
  /** 天干
   * 阴阳交替
   * 甲乙东方木，丙丁南方火，戊己中央土，庚辛西方金，壬癸北方水
   */
  yinYang: YinYang
  wuxing: WuXing
  direction: Direction
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
/** 地支接口 */
export type ZhiName = (typeof ZHI_NAME)[number]
export type Zhi = IndexField<{
  name: ZhiName
}>
/** 干支接口 */
export type GanZhiName = (typeof NAYIN_WUXING)[number][0 | 1]
export type NayinName = (typeof NAYIN_WUXING)[number][2]
export type GanZhi = IndexField<{
  name: GanZhiName
  gan: Gan
  zhi: Zhi
  nianYin: NayinName
}>
/** 八字接口 */
export interface Bazi {
  sizhu: GanZhi[]
  tiangan: Gan[]
  dizhi: Zhi[]
  canggan?: Gan[]
}

/** 十天干 */
export const GAN_NAME = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const
/** 天干五合 */
export const GAN_WUHE = [
  ['甲', '己', '土', '中正'],
  ['乙', '庚', '金', '仁义'],
  ['丙', '辛', '水', '威制'],
  ['丁', '壬', '木', '淫慝'],
  ['戊', '癸', '火', '无情'],
] as const
/** 天干相冲 */
export const GAN_CHONG = [
  ['甲', '庚'],
  ['乙', '辛'],
  ['丙', '壬'],
  ['丁', '癸'],
] as const

/** 十二地支 */
export const ZHI_NAME = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const
/** 四正（子午卯酉） */
export type SizhengName = (typeof ZHI_NAME)[number]
export const ZHENG_ZHI_NAME = ['子', '午', '卯', '酉'] as SizhengName[]
/** 四隅（寅申巳亥） */
export type SiyuName = (typeof ZHI_NAME)[number]
export const SI_YU_NAME = ['寅', '申', '巳', '亥'] as SiyuName[]
/** 四库（辰戌丑未）, 皆属土，依次分别为 水库 火库 金库 木库 */
export type SikuName = (typeof ZHI_NAME)[number]
export const SI_KU_NAME = ['辰', '戌', '丑', '未'] as SikuName[]

/** 纳音五行 */
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
/** 十二长生 */
export const TWELVE_LONG_LIFE_NAME = ['长生', '沐浴', '冠带', '临官', '帝旺', '衰', '病', '死', '墓', '绝', '胎', '养'] as const

/** 十天干 */
export const gans: Gan[] = GAN_NAME.map((name, index) => {
  const gan = {
    index,
    name,
    yinYang: yinYangs[(index + 1) % 2],
    wuxing: wuxings[Math.floor(index / 2) % 5],
    direction: directions[Math.floor(index / 2) % 5],
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
/** 天干五合 */
export type GanHeDescription = (typeof GAN_WUHE)[number][3]
export type GanHe = TargetField<{
  name: GanName
  description: GanHeDescription
  hua?: WuXing
}>
/** thisArg, 不可为箭头函数 */
export function ganHe(this: Gan, target: Gan | GanName): GanHe | undefined {
  const transform = ([_, _name2, hua, description]: string[]): Required<Omit<GanHe, keyof TargetField>> => ({
    description: description as GanHeDescription,
    hua: getWuXing(hua as WuXingName) as WuXing,
  })

  return getRelation.call(this, {
    target,
    nameArray: [...GAN_NAME],
    relationArray: GAN_WUHE.map(item => [...item]),
    transform,
  }) as GanHe
}
/** 天干相冲 */
export type GanChong = TargetField<{
  name: GanName
  targetName: GanName
}>
export function ganChong(this: Gan, target: Gan | GanName): GanChong | undefined {
  return getRelation.call(this, {
    target,
    nameArray: [...GAN_NAME],
    relationArray: GAN_CHONG.map(item => [...item]),
  }) as GanChong
}

/** 获取地支的五行 */
export const getZhiWuxing = (name: Zhi['name'], index: Zhi['index']): WuXing => {
  const offset = -2 + 12

  let wuxingIndex = (Math.floor((index + offset) / 3) % 4) % 12

  if (isInSiku(name)) {
    wuxingIndex = 2
  } else if (wuxingIndex >= 2) {
    wuxingIndex++
  }

  return wuxings[wuxingIndex]
}
/** 判断是否属于四正 */
export const isInZhengZhi = (name: Zhi['name']): boolean => ZHENG_ZHI_NAME.includes(name)
/** 判断是否属于四隅 */
export const isInSiYu = (name: Zhi['name']): boolean => SI_YU_NAME.includes(name)
/** 判断是否属于四库 */
export const isInSiku = (name: Zhi['name']): boolean => SI_KU_NAME.includes(name)
/** 十二地支 */
export const zhis: Zhi[] = ZHI_NAME.map((name, index) => {
  return {
    name,
    index,
    yinYang: yinYangs[(index + 1) % 2],
    wuxing: getZhiWuxing(name, index),
    direction: directions[Math.floor(index + 2) % 5],
    season: seasons[Math.floor((index + 2) % 3) % 4],
    animal: animals[index % 12],
  }
})

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
/** 获取八字 */
export const getBazi = async (date: Date, address?: number | string): Promise<Bazi> => {
  console.log('十天干：', gans)
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
