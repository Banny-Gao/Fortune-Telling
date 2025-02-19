import dayjs from 'dayjs'
import { SOLAR_TERM, getPrevAndNextSolarTerm, getSolarAndLunarDate, getYearSolarTerms } from '../date'
import { lcm } from '../utils/math'
import { GAN_NAME, getGans } from './gan'
import { ZHI_NAME, getZhis } from './zhi'

import type { LunarDate, SolarTerm } from '../date'
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

// 立春后算新的一年，修正年月数值取值
const getFixedYearMonth = async (lunarDate: LunarDate): Promise<[number, number]> => {
  const [currentSolarTerm, nextSolarTerm] = await getPrevAndNextSolarTerm(lunarDate.solarDate)
  /** 上个节气为立春且在腊月，则年加一，月为1 */
  if (currentSolarTerm.name === '立春' && lunarDate.month === 12) {
    return [lunarDate.year + 1, 1]
  }
  /** 下个节气为立春且在正月，则年减一，月为12 */
  if (nextSolarTerm.name === '立春' && lunarDate.month === 1) {
    return [lunarDate.year - 1, 12]
  }

  return [lunarDate.year, lunarDate.month]
}

/** 获取年的天干 */
export const getYearGan = async (lunarDate: LunarDate): Promise<Gan> => {
  const [fixedYear] = await getFixedYearMonth(lunarDate)

  const gans = getGans()
  const index = (fixedYear - 4) % 10
  return gans[index]
}

/**获取年的地支 */
export const getYearZhi = async (lunarDate: LunarDate): Promise<Zhi> => {
  const [fixedYear] = await getFixedYearMonth(lunarDate)

  const zhis = getZhis()
  const index = (fixedYear - 4) % 12
  return zhis[index]
}

/** 节气对应的月干偏移 */
export const SOLAR_TERM_OFFSET: Record<string, number> = Object.fromEntries(SOLAR_TERM.map((term, index) => [term, Math.floor(index / 2)]))

/** 获取某年某月某日节气的月干偏移 */
export const getMonthGanOffset = async (lunarDate: LunarDate): Promise<number> => {
  const [currentSolarTerm] = await getPrevAndNextSolarTerm(lunarDate.solarDate)

  const solarTermOffset = SOLAR_TERM_OFFSET[currentSolarTerm.name]
  return solarTermOffset
}

/** 获取农历某月某天所在的月的天干 */
export const getMonthGan = async (lunarDate: LunarDate, yearGan: Gan): Promise<Gan> => {
  const gans = getGans()
  // 正月天干的序号
  const firstMonthGanIndex = yearGan.wuhudun.targetIndex
  // 月干偏移
  const monthOffset = await getMonthGanOffset(lunarDate)

  const index = (firstMonthGanIndex + monthOffset) % 10
  return gans[index]
}

/** 获取农历某月某天所在的月的地支 */
export const getMonthZhi = async (lunarDate: LunarDate): Promise<Zhi> => {
  const zhis = getZhis()
  // 月支直接由节气决定，正月为寅(索引2)
  const zhiIndex = ((await getMonthGanOffset(lunarDate)) + 2) % 12
  return zhis[zhiIndex]
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

/** 根据月支获取节气范围 */
const ZHI_SOLAR_TERM_RANGE: Record<number, [number, number, number]> = {
  // 寅月(索引2)对应立春(0)~惊蛰(2)
  2: [0, 1, 2], // 立春、雨水、惊蛰
  3: [2, 3, 4], // 惊蛰、春分、清明
  4: [4, 5, 6], // 清明、谷雨、立夏
  5: [6, 7, 8], // 立夏、小满、芒种
  6: [8, 9, 10], // 芒种、夏至、小暑
  7: [10, 11, 12], // 小暑、大暑、立秋
  8: [12, 13, 14], // 立秋、处暑、白露
  9: [14, 15, 16], // 白露、秋分、寒露
  10: [16, 17, 18], // 寒露、霜降、立冬
  11: [18, 19, 20], // 立冬、小雪、大雪
  0: [20, 21, 22], // 大雪、冬至、小寒
  1: [22, 23, 24], // 小寒、大寒、立春, 24 为下一年立春
}

/** 根据月支获取节令、气令和下一个节气节令 */
export const getMonthZhiSolarTerm = async (year: number, zhi: Zhi): Promise<[SolarTerm, SolarTerm, SolarTerm]> => {
  const [start, middle, end] = ZHI_SOLAR_TERM_RANGE[zhi.index]!
  const terms = await getYearSolarTerms(year)

  // 统一处理跨年节气
  const nextYear = year + Math.floor(end / 24)
  const nextTerm = (await getYearSolarTerms(nextYear))[end % 24]

  return [terms[start], terms[middle], nextTerm]
}

export type PureGanZhi = {
  gan: Gan
  zhi: Zhi
}
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
export const getSining = async (lunarDate: LunarDate, yueZhi: Zhi): Promise<string> => {
  const [start] = await getMonthZhiSolarTerm(lunarDate.year, yueZhi)
  const now = dayjs(lunarDate.solarDate).startOf('day')
  const term = dayjs(start.lunarDate.solarDate).startOf('day')
  // 从节气看
  const diff = now.diff(term, 'day')
  const [_, ...rest] = SINING_NAME[yueZhi.index]

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
  qi: {
    age: number
    born: string
    date: string
  } // 起运
  jiao: {
    age: number
    date: string
  } // 交运
  yun: (GanZhi & {
    year: [number, number]
    age: [number, number]
    date: [string, string]
  })[] // 大运干支
}

export const getDaYun = async ({
  yearGan,
  monthZhu,
  lunarDate,
  gender,
}: {
  yearGan: Gan
  monthZhu: GanZhi
  lunarDate: LunarDate
  gender: 'male' | 'female'
}): Promise<DaYun> => {
  /* 大运起始，阳男阴女顺排，阴男阳女逆排
   * 大运起始年龄 = 出生年份的干支纳音五行与月柱天干纳音五行的生克关系决定的
   * 阳年生男，阴年生女顺排；阴年生男，阳年生女逆排
   * 大运干支 = 月柱干支
   * 大运年龄 = 月柱干支纳音五行与大运干支纳音五行的生克关系决定的
   * 大运干支 = 月柱干支
   */

  const isShun = (yearGan.yinYang.name === '阳' && gender === 'male') || (yearGan.yinYang.name === '阴' && gender === 'female')
  const [start, _, end] = await getMonthZhiSolarTerm(lunarDate.year, monthZhu.zhi)
  console.log('起运节令日期：', start, end, lunarDate)

  const diff = isShun
    ? dayjs(end.lunarDate.solarDate).diff(dayjs(lunarDate.solarDate), 'hour')
    : dayjs(lunarDate.solarDate).diff(dayjs(start.lunarDate.solarDate), 'hour')

  // 三天计一岁，一天计四个月
  const age = Math.floor(diff / 72)
  const month = ((diff % 72) / 24) * 4

  // 大运 120 年， 10 年一运
  const yun: DaYun['yun'] = []
  let yunAge = age,
    yunYear = lunarDate.solarDate.getFullYear()
  for (let i = 1; i <= 12; i++) {
    const index = isShun ? monthZhu.index + i : monthZhu.index - i
    const ganZhi = SIXTY_JIAZI[(index + 60) % 60]
    yun.push({
      ...ganZhi,
      year: [yunYear, yunYear + 10],
      age: [yunAge, yunAge + 10],
      date: [
        dayjs(lunarDate.solarDate).add(yunAge, 'year').format('YYYY'),
        dayjs(lunarDate.solarDate)
          .add(yunAge + 10, 'year')
          .format('YYYY'),
      ],
    })
    yunAge += 10
    yunYear += 10
  }

  return {
    qi: {
      age,
      born: dayjs(lunarDate.solarDate).format('YYYY-MM-DD'),
      date: dayjs(lunarDate.solarDate).add(age, 'year').add(month, 'month').format('YYYY-MM-DD'),
    },
    jiao: {
      age,
      date: dayjs(lunarDate.solarDate).add(age, 'year').add(month, 'month').format('YYYY-MM-DD'),
    },
    yun,
  }
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
  sining: string // 司令
  dayun: DaYun // 大运
}

/** 获取八字 */
export type GetBaziParams = {
  date: Date
  address?: number | string
  gender: 'male' | 'female'
}
export const getBazi = async ({ date, address, gender }: GetBaziParams): Promise<Bazi> => {
  const lunarDate = await getSolarAndLunarDate(date, address)
  console.log('农历日生日：', lunarDate)
  // 年柱
  const yearGan = await getYearGan(lunarDate)
  const yearZhi = await getYearZhi(lunarDate)
  const yearZhu = composeGanZhi(yearGan, yearZhi)
  // 月柱
  const monthGan = await getMonthGan(lunarDate, yearGan)
  const monthZhi = await getMonthZhi(lunarDate)
  const monthZhu = composeGanZhi(monthGan, monthZhi)
  // 日柱
  const dayZhu = await getDayGanZhi(lunarDate)
  // 时柱
  const hourGan = await getHourGan(lunarDate, dayZhu.gan)
  const hourZhi = await getHourZhi(lunarDate)
  const hourZhu = composeGanZhi(hourGan, hourZhi)

  const sizhu: GanZhi[] = [yearZhu, monthZhu, dayZhu, hourZhu]
  const tiangan: Gan[] = [yearGan, monthGan, dayZhu.gan, hourGan]
  const dizhi: Zhi[] = [yearZhi, monthZhi, dayZhu.zhi, hourZhi]
  const canggan: ZhiCangGan[] = [yearZhi.cangGan, monthZhi.cangGan, dayZhu.zhi.cangGan, hourZhi.cangGan]

  const minggong = await getMingGong(lunarDate, monthZhu, hourZhi)
  const taiyuan = await getTaiYuanGeneral(monthZhu)
  const taixi = await getPureGanZhiHe(dayZhu)
  const bianxing = await getPureGanZhiHe(hourZhu)
  const sining = await getSining(lunarDate, monthZhu.zhi)
  const dayun = await getDaYun({
    yearGan,
    monthZhu,
    lunarDate,
    gender,
  })

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
