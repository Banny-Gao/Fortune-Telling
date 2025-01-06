import dayjs from 'dayjs'
import { LUNAR_INFO } from './data/lunar-years'
import { getCurrentLoc, getLocation } from './utils/map'

/** 四季 */
export type SeasonName = NameConst<typeof SEASON_NAME>
export const SEASON_NAME = ['春', '夏', '秋', '冬'] as const
/** 农历月份 */
export type LunarMonth = NameConst<typeof LUNAR_MONTH>
export const LUNAR_MONTH = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊'] as const
/** 农历日期 */
export type LunarDay = NameConst<typeof LUNAR_DAY>
export const LUNAR_DAY = [
  '初一',
  '初二',
  '初三',
  '初四',
  '初五',
  '初六',
  '初七',
  '初八',
  '初九',
  '初十',
  '十一',
  '十二',
  '十三',
  '十四',
  '十五',
  '十六',
  '十七',
  '十八',
  '十九',
  '二十',
  '廿一',
  '廿二',
  '廿三',
  '廿四',
  '廿五',
  '廿六',
  '廿七',
  '廿八',
  '廿九',
  '三十',
] as const
/** 二十四节气 */
export type SolarTermName = NameConst<typeof SOLAR_TERM>
export const SOLAR_TERM = [
  '立春',
  '雨水',
  '惊蛰',
  '春分',
  '清明',
  '谷雨',
  '立夏',
  '小满',
  '芒种',
  '夏至',
  '小暑',
  '大暑',
  '立秋',
  '处暑',
  '白露',
  '秋分',
  '寒露',
  '霜降',
  '立冬',
  '小雪',
  '大雪',
  '冬至',
  '小寒',
  '大寒',
] as const

/** 四季 */
export type Season = IndexField<{
  name: SeasonName
}>
export const seasons: Season[] = SEASON_NAME.map((name, index) => ({
  index,
  name,
}))

/** 获取闰月月份 */
export const getLeapMonth = (lunarInfo: number): number => lunarInfo & 0xf

/** 获取闰月天数 */
export const getLeapDays = (lunarInfo: number): number => (getLeapMonth(lunarInfo) ? (lunarInfo & 0x10000 ? 30 : 29) : 0)

/** 计算农历年天数 */
export const getLunarYearDays = (lunarInfo: number): number => {
  let total = 0
  let monthInfo = 0x8000
  for (let i = 0; i < 12; i++) {
    total += lunarInfo & monthInfo ? 30 : 29
    monthInfo = monthInfo >> 1
  }

  return total + getLeapDays(lunarInfo)
}

/** 获取农历某月的天数 */
export const getLunarMonthDays = (lunarInfo: number, month: number): number => (lunarInfo & (0x10000 >> month) ? 30 : 29)

/** 真太阳时对象接口 */
type BaseDate<T> = T & {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  second: number
  date?: Date
}
export type TrueSolarTimeResult = BaseDate<{
  date: Date
  format: (pattern?: string) => string
}>

/** 计算时差方程修正值（分钟） */
export const getEquationOfTime = (date: Date): number => {
  // 计算当年的第几天（1月1日为第0天）
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24))

  // 计算太阳角度（弧度），81是春分前的天数
  const B = (2 * Math.PI * (dayOfYear - 81)) / 365
  // 时差方程：使用傅里叶级数近似
  return 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B)
}

/** 计算真太阳时 */
export const getTrueSolarTime = async (date: Date, longitudeOrAddress?: number | string): Promise<TrueSolarTimeResult> => {
  // 1. 获取经度
  const longitude = await (async () => {
    if (!longitudeOrAddress) return (await getCurrentLoc()).lng
    return typeof longitudeOrAddress === 'string' ? (await getLocation(longitudeOrAddress)).lng : longitudeOrAddress
  })()

  // 2. 计算修正秒数
  const standardMeridian = 120
  const totalSeconds = date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds()
  let correctedSeconds =
    totalSeconds +
    (longitude - standardMeridian) * 240 + // 4 * 60 = 240
    getEquationOfTime(date) * 60

  // 3. 处理日期计算
  let years = date.getFullYear()
  let months = date.getMonth() + 1
  let days = date.getDate()

  // 处理跨日
  if (correctedSeconds < 0) {
    correctedSeconds += 86400 // 24 * 3600
    days--
    if (days === 0) {
      months--
      if (months === 0) {
        months = 12
        years--
      }
      days = new Date(years, months, 0).getDate()
    }
  } else if (correctedSeconds >= 86400) {
    correctedSeconds -= 86400
    days++
    if (days > new Date(years, months, 0).getDate()) {
      days = 1
      months++
      if (months > 12) {
        months = 1
        years++
      }
    }
  }

  // 4. 计算时分秒
  const hours = Math.floor(correctedSeconds / 3600)
  const remainingSeconds = correctedSeconds % 3600
  const minutes = Math.floor(remainingSeconds / 60)
  const seconds = Math.round(remainingSeconds % 60) // 使用 round 处理小数

  const newDate = new Date(years, months - 1, days, hours, minutes, seconds)
  const format = (pattern?: string): string => dayjs(newDate).format(pattern || 'YYYY-MM-DD HH:mm')

  return {
    year: years,
    month: months,
    day: days,
    hour: hours,
    minute: minutes,
    second: seconds,
    format,
    date: newDate,
  }
}

/** 农历日期接口 */
export type LunarDate = BaseDate<{
  isLeap: boolean // 是否闰月
  solarDate: Date // 真太阳时日期
  text: string // 农历日期文本
  monthIndex: number // 当月在本年索引
  dateIndex: number // 当天在本月索引
}>

/** 将真太阳时转换为农历日期 */
export const solarToLunar = (date: Date): LunarDate => {
  let offset = Math.floor((date.getTime() - new Date(1900, 0, 31).getTime()) / (24 * 60 * 60 * 1000))

  let lunarYear = 1900
  let lunarMonth = 1
  let lunarDay = 1
  let isLeap = false

  // 计算年
  for (let i = 0; i < LUNAR_INFO.length && offset > 0; i++) {
    const daysInLunarYear = getLunarYearDays(LUNAR_INFO[i])
    if (offset < daysInLunarYear) {
      break
    }
    offset -= daysInLunarYear
    lunarYear++
  }

  // 计算月
  const lunarInfo = LUNAR_INFO[lunarYear - 1900]
  const leapMonth = getLeapMonth(lunarInfo)
  let daysInMonth = 0

  for (let i = 1; i <= 12 && offset > 0; i++) {
    if (leapMonth > 0 && i === leapMonth + 1 && !isLeap) {
      --i
      isLeap = true
      daysInMonth = getLeapDays(lunarInfo)
    } else {
      daysInMonth = getLunarMonthDays(lunarInfo, i)
    }

    if (isLeap && i === leapMonth + 1) isLeap = false
    if (offset < daysInMonth) break

    offset -= daysInMonth
    lunarMonth++
  }

  // 计算日
  lunarDay = offset + 1

  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  // 农历日期文本
  const text = `${lunarYear}年 ${LUNAR_MONTH[lunarMonth - 1]}月 ${LUNAR_DAY[lunarDay - 1]}`

  return {
    year: lunarYear,
    month: lunarMonth,
    day: lunarDay,
    hour,
    minute,
    second,
    isLeap,
    solarDate: date,
    text,
    monthIndex: lunarMonth - 1,
    dateIndex: lunarDay - 1,
  }
}

/** 根据公历日期地点获取农历时间 */
export const getSolarAndLunarDate = async (date: Date, longitudeOrAddress?: number | string): Promise<LunarDate> => {
  //  获取真太阳时
  const solarTime = await getTrueSolarTime(date, longitudeOrAddress)

  // 转换为农历
  return solarToLunar(solarTime.date)
}

/**
 * 计算太阳黄经度数（角度）
 * @param jd - 儒略日
 * @returns 太阳黄经度数（0-360度）
 */
export const getSolarLongitude = (jd: number): number => {
  // 计算儒略世纪数
  const T = (jd - 2451545.0) / 36525

  // 太阳轨道根数
  const L0 = 280.46646 + T * (36000.76983 + T * 0.0003032) // 平黄经
  const M = 357.52911 + T * (35999.05029 - T * 0.0001537) // 平近点角
  const e = 0.016708634 - T * (0.000042037 + T * 0.0000001267) // 轨道离心率

  // 计算中心差
  const sinM = Math.sin((M * Math.PI) / 180)
  const sin2M = Math.sin((2 * M * Math.PI) / 180)
  const C =
    (1.914602 - T * (0.004817 + T * 0.000014)) * sinM +
    (0.019993 - T * 0.000101) * sin2M +
    0.000289 * Math.sin((3 * M * Math.PI) / 180) +
    0.000145 * Math.sin((4 * M * Math.PI) / 180) +
    0.000031 * Math.sin((5 * M * Math.PI) / 180) +
    e * sinM * 0.00134 // 加入轨道离心率的影响

  // 计算真黄经并应用岁差修正
  const omega = 125.04 - 1934.136 * T
  const L = L0 + C - (0.00569 + 0.00478 * Math.sin((omega * Math.PI) / 180))

  // 标准化到 0-360 度
  return (L + 360) % 360
}

/** 将日期转换为儒略日 */
export const getJulianDay = (date: Date): number => {
  const y = date.getFullYear()
  const m = date.getMonth() + 1
  const d = date.getDate()
  const h = date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600

  let jd = 0
  let yy = y
  let mm = m

  if (m <= 2) {
    yy--
    mm += 12
  }

  const a = Math.floor(yy / 100)
  const b = 2 - a + Math.floor(a / 4)

  jd = Math.floor(365.25 * (yy + 4716)) + Math.floor(30.6001 * (mm + 1)) + d + b - 1524.5 + h / 24
  return jd
}

/** 查找指定黄经度数对应的儒略日 */
export const findSolarTermJD = (targetLongitude: number, startJD: number, endJD: number): number => {
  const precision = 0.0001 // 精度：约8秒
  let low = startJD
  let high = endJD

  while (high - low > precision) {
    const mid = (low + high) / 2
    const longitude = getSolarLongitude(mid)

    if (Math.abs(longitude - targetLongitude) < precision) {
      return mid
    }

    if ((longitude - targetLongitude + 360) % 360 < 180) {
      high = mid
    } else {
      low = mid
    }
  }

  return (low + high) / 2
}

/** 儒略日转公历日期 */
export const fromJulianDay = (jd: number): Date => {
  const z = Math.floor(jd + 0.5)
  const a = Math.floor((z - 1867216.25) / 36524.25)
  const b = z + 1 + a - Math.floor(a / 4)
  const c = b + 1524
  const d = Math.floor((c - 122.1) / 365.25)
  const e = Math.floor(365.25 * d)
  const f = Math.floor((c - e) / 30.6001)

  const day = c - e - Math.floor(30.6001 * f)
  const month = f - 1 - 12 * Math.floor(f / 14)
  const year = d - 4715 - Math.floor((7 + month) / 10)

  const fraction = jd + 0.5 - z
  const hours = Math.floor(fraction * 24)
  const minutes = Math.floor((fraction * 24 - hours) * 60)
  const seconds = Math.floor(((fraction * 24 - hours) * 60 - minutes) * 60)

  return new Date(year, month - 1, day, hours, minutes, seconds)
}

/** 节气接口 */
export interface SolarTerm {
  // 节气名称
  name: SolarTermName
  // 节气日期农历日期
  lunarDate: LunarDate
}

/** 获取农历某月某天当月的节气 */
export const getSolarTerms = (date: LunarDate): [SolarTerm, SolarTerm] => {
  const jd = getJulianDay(date.solarDate)
  const longitude = getSolarLongitude(jd)

  // 根据太阳黄经确定节气索引
  // 立春（315度）对应索引0，每个节气间隔15度
  const currentTermIndex = Math.floor(((longitude + 45) % 360) / 15)
  const nextTermIndex = (currentTermIndex + 1) % 24

  // 计算这两个节气的准确时间
  const currentTermLongitude = (currentTermIndex * 15 + 270) % 360
  const nextTermLongitude = (nextTermIndex * 15 + 270) % 360

  // 计算准确时间，扩大搜索范围
  const currentTermJD = findSolarTermJD(currentTermLongitude, jd - 20, jd + 20)
  const nextTermJD = findSolarTermJD(nextTermLongitude, currentTermJD, currentTermJD + 40)

  // 转换为日期
  const currentTermDate = fromJulianDay(currentTermJD)
  const nextTermDate = fromJulianDay(nextTermJD)

  // 创建节气对象
  const term1: SolarTerm = {
    name: SOLAR_TERM[currentTermIndex],
    lunarDate: solarToLunar(currentTermDate),
  }

  const term2: SolarTerm = {
    name: SOLAR_TERM[nextTermIndex],
    lunarDate: solarToLunar(nextTermDate),
  }

  return [term1, term2]
}
