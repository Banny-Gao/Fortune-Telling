import dayjs from 'dayjs'
import { SOLAR_TERM, getSolarTerms, getSolarAndLunarDate } from '../date'
import { lcm } from '../utils/math'
import { GAN_NAME, getGans } from './gan'
import { ZHI_NAME, getZhis } from './zhi'

import type { LunarDate } from '../date'
import type { Gan } from './gan'
import type { Zhi, ZhiCangGan } from './zhi'

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
  const gans = getGans()
  const zhis = getZhis()
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
  const gans = getGans()
  const index = (year - 4) % 10
  return gans[index]
}

/**获取年的地支 */
export const getYearZhi = (year: number): Zhi => {
  const zhis = getZhis()
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
  const gans = getGans()
  // 正月天干的序号
  const firstMonthGanIndex = yearGan.wuhudun.targetIndex
  // 月干偏移
  const monthOffset = getMonthGanOffset(lunarDate)

  const index = (firstMonthGanIndex + monthOffset) % 10
  return gans[index]
}

/** 获取农历某月某天所在的月的地支 */
export const getMonthZhi = (lunarDate: LunarDate): Zhi => {
  const zhis = getZhis()
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

  let offset = Math.floor((timestamp - baseDateTimestamp) / (24 * 60 * 60 * 1000))

  // 早晚子时，大于 23点，算作第二天
  if (lunarDate.solarDate.getHours() > 23) {
    offset += 1
  }

  // 计算干支索引
  const jiaziIndex = (offset + BASE_JIAZI_INDEX) % 60

  return SIXTY_JIAZI[jiaziIndex]
}

/** 获取时辰索引：23:00-00:59 为子时(0)，01:00-02:59 为丑时(1)，以此类推 */
export const getZhiShiIndex = (hour: number): number => Math.floor(((hour + 1) % 24) / 2)

/** 获取农历某月某天某时的天干：日上起时，五鼠遁 */
export const getHourGan = (lunarDate: LunarDate, dayGan: Gan): Gan => {
  const gans = getGans()
  const hourIndex = getZhiShiIndex(lunarDate.hour)
  return gans[(dayGan.wushudun.targetIndex + hourIndex) % 10]
}

/** 获取农历某月某天某时的地支 */
export const getHourZhi = (lunarDate: LunarDate): Zhi => {
  const zhis = getZhis()
  return zhis[getZhiShiIndex(lunarDate.hour)]
}

export type PureGanZhi<T extends Record<string, any> = any> = {
  gan: Gan
  zhi: Zhi
} & T
/**
 * 日主胎元
 * 干进一位
 * 支进三位
 */
export type TaiYuan = PureGanZhi
export const getTaiYuanGeneral = ({ gan, zhi }: GanZhi): TaiYuan => {
  const gans = getGans()
  const zhis = getZhis()
  const taiGan = gans[(gan.index + 1) % 10]
  const taiZhi = zhis[(zhi.index + 3) % 12]

  return {
    gan: taiGan,
    zhi: taiZhi,
  }
}

/**
 * 日主胎息
 * 取干支所合
 */
export type TaiXi = PureGanZhi
export const getPureGanZhiHe = ({ gan, zhi }: GanZhi): PureGanZhi => {
  const gans = getGans()
  const zhis = getZhis()

  return {
    gan: gans[gan.he?.targetIndex as number],
    zhi: zhis[zhi.he?.targetIndex as number],
  }
}

/** 起变法：时变, 变星
 * 取时柱干支所合
 */
export type BianXing = PureGanZhi

/** 起通法： 命宫
 * 生月地支从子逆推
 * 生时地支顺推至卯
 */
export type MingGong = PureGanZhi
export const getMingGong = (lunarDate: LunarDate, monthZhu: GanZhi, hourZhi: Zhi): MingGong => {
  const gans = getGans()
  const zhis = getZhis()

  const monthOffset = (1 - lunarDate.month + 12) % 12
  const offset = 3 - monthOffset + hourZhi.index

  const zhiIndex = (offset + 12) % 12
  const firstGanIndex = (monthZhu.gan.index - ((monthZhu.zhi.index - 2 + 12) % 12) + 20) % 10
  const ganIndex = (firstGanIndex + offset + 10) % 10

  return {
    gan: gans[ganIndex],
    zhi: zhis[zhiIndex],
  }
}

/** 司令 */
export const SINING_NAME = [
  ['寅', ['戊土', 7], ['丙火', 7], ['甲木', 16]],
  ['卯', ['甲木', 10], ['乙木', 20]],
  ['辰', ['乙木', 9], ['癸水', 3], ['戊土', 18]],
  ['巳', ['戊土', 5], ['庚金', 9], ['丙火', 16]],
  ['午', ['丙火', 10], ['己土', 9], ['丁火', 11]],
  ['未', ['丁火', 9], ['乙木', 3], ['己土', 18]],
  ['申', ['戊己土', 10], ['壬癸水', 3], ['庚金', 17]],
  ['酉', ['庚金', 10], ['辛金', 20]],
  ['戌', ['辛金', 9], ['丁火', 3], ['戊土', 18]],
  ['亥', ['戊土', 7], ['甲木', 5], ['壬水', 18]],
  ['子', ['壬水', 10], ['癸水', 20]],
  ['丑', ['癸水', 9], ['辛金', 3], ['己土', 18]],
] as const
export const getSining = (lunarDate: LunarDate, yueZhi: Zhi): string => {
  const [currentSolarTerm] = getSolarTerms(lunarDate)
  const now = dayjs(lunarDate.solarDate).startOf('day')
  const term = dayjs(currentSolarTerm.lunarDate.solarDate).startOf('day')
  // 从节气看
  const diff = now.diff(term, 'day')
  const [_, ...rest] = SINING_NAME[yueZhi.index]

  // 只看月
  // const diff = lunarDate.day
  // const [_, ...rest] = SINING_NAME[lunarDate.monthIndex]

  let i = 0,
    sum = 0
  while (i < rest.length) {
    sum += rest[i][1]
    if (sum >= diff) {
      break
    }
    i++
  }

  return rest[i][0]
}

/** 大运 */
export type DaYun = {
  qi: {} // 起运
  jiao: {} // 交运
  yun: PureGanZhi<{
    age: number
    date: string
  }>[] // 大运干支
}

export const getDaYun = (lunarDate: LunarDate, gender: 'male' | 'female'): DaYun => {
  const gans = getGans()
  const zhis = getZhis()

  // 大运起始，阳男阴女顺排，阴男阳女逆排
}

/** 八字接口 */
export interface Bazi {
  sizhu: GanZhi[]
  tiangan: Gan[]
  dizhi: Zhi[]
  canggan: ZhiCangGan[] // 藏干
  taiyuan: TaiYuan // 胎元
  taixi: TaiXi // 胎息
  bianxing: BianXing // 变星
  minggong: MingGong // 命宫
  sining: ReturnType<typeof getSining> // 司令
  dayun: DaYun // 大运
}

/** 获取八字 */
type GetBaziParams = {
  date: Date
  address?: number | string
  gender: 'male' | 'female'
}
export const getBazi = async ({ date, address, gender }: GetBaziParams): Promise<Bazi> => {
  const lunarDate = await getSolarAndLunarDate(date, address)
  console.log(lunarDate)
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
  const canggan: ZhiCangGan[] = [yearZhi.cangGan, monthZhi.cangGan, dayZhu.zhi.cangGan, hourZhi.cangGan]

  const minggong = getMingGong(lunarDate, monthZhu, hourZhi)
  const taiyuan = getTaiYuanGeneral(monthZhu)
  const taixi = getPureGanZhiHe(dayZhu)
  const bianxing = getPureGanZhiHe(hourZhu)
  const sining = getSining(lunarDate, monthZhu.zhi)
  const dayun = getDaYun(lunarDate, gender)

  console.log(getGans())
  console.log(getZhis())

  return {
    sizhu,
    tiangan,
    dizhi,
    canggan,
    taiyuan,
    taixi,
    bianxing,
    minggong,
    sining,
    dayun,
  }
}
