/** 象 */
export interface BasicField {
  index?: number // 索引
  yinYang?: YinYang // 阴阳
  wuxing?: WuXing // 五行
  direction?: Direction // 方位
  numbers?: number[] // 代表的数字
  season?: Season // 季节
  animal?: Animal // 生肖
  gan?: string // 天干
  zhi?: string // 地支
  sixGods?: string // 六神
  district?: string // 位置
  color?: string // 颜色
  sixRelations?: string // 六亲
  fiveConstants?: string // 五常，仁义礼智信
  fiveOrgans?: string // 五脏
  sixOrgans?: string // 六腑
  bodyParts?: string // 身体部位
}

/** 阴阳 */
interface YinYang {
  name: string
  value: number
}

const yinYangs: YinYang[] = [
  { name: '阳', value: 1 },
  { name: '阴', value: -1 },
]

/** 五行 */
interface WuXing extends BasicField {
  name: string // 名称
}

const WX_NAME: WuXing['name'][] = ['木', '火', '土', '金', '水']
/** 五行数字 */
const WX_NUMBERS: number[][] = [
  [3, 8], // 木
  [2, 7], // 火
  [5, 10], // 土
  [4, 9], // 金
  [1, 6], // 水
]

const wuxings = WX_NAME.map((name, index) => ({
  name,
  index,
  numbers: WX_NUMBERS[index],
}))

/** 方位*/
interface Direction extends BasicField {
  name: string // 名称
}
const DIRECTION_NAME: Direction['name'][] = ['东', '南', '中', '西', '北']
const directions: Direction[] = DIRECTION_NAME.map((name, index) => ({
  name,
  index,
}))

/** 季节 */
interface Season extends BasicField {
  name: string // 名称
}
const SEASON_NAME: Season['name'][] = ['春', '夏', '秋', '冬']
const seasons: Season[] = SEASON_NAME.map((name, index) => ({
  name,
  index,
}))

/** 生肖 */
interface Animal extends BasicField {
  name: string // 名称
}
const ANIMAL_NAME: Animal['name'][] = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪']
const animals: Animal[] = ANIMAL_NAME.map((name, index) => ({
  name,
  index,
}))

interface Gan extends BasicField {
  /** 天干
   * 阴阳交替
   * 甲乙东方木，丙丁南方火，戊己中央土，庚辛西方金，壬癸北方水
   */
  index: number // 索引
  name: string // 名称
  /*
   * 五虎遁: 年上起月，表示正月天干
   * 甲己之年丙作首，乙庚之岁戊为头，丙辛之岁寻庚起，丁壬壬位顺行流，戊癸何方发，壬子是真途
   */
  wuhudun: {
    sourceName: (typeof GAN_NAME)[number] // 当前天干
    sourceIndex: number // 当前天干索引
    targetName: (typeof GAN_NAME)[number] // 正月天干
    targetIndex: number // 正月天干索引
  }
  /**
   * 五鼠遁: 日上起时，表示子时天干
   * 甲己还加甲，乙庚丙作初，丙辛从戊起，丁壬庚子居，戊癸何方发，壬子是真途
   */
  wushudun: {
    sourceName: (typeof GAN_NAME)[number] // 当前天干
    sourceIndex: number // 当前天干索引
    targetName: (typeof GAN_NAME)[number] // 子时天干
    targetIndex: number // 子时天干索引
  }
}

const GAN_NAME: Gan['name'][] = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']

const gans: Gan[] = GAN_NAME.map((name, index) => {
  return {
    index,
    name,
    yinYang: yinYangs[index % 2],
    wuxing: wuxings[Math.floor(index / 2) % 5],
    direction: directions[Math.floor(index / 2) % 5],
    wuhudun: {
      sourceName: name,
      sourceIndex: index,
      targetName: GAN_NAME[((index + 1) % 5) * 2],
      targetIndex: ((index + 1) % 5) * 2,
    },
    wushudun: {
      sourceName: name,
      sourceIndex: index,
      targetName: GAN_NAME[(index % 5) * 2],
      targetIndex: (index % 5) * 2,
    },
  }
})

interface Zhi extends BasicField {
  index: number // 索引
  name: string // 名称
}
/** 十二地支 */
const ZHI_NAME: Zhi['name'][] = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
/** 四正（子午卯酉） */
const ZHENG_ZHI_NAME: Zhi['name'][] = ['子', '午', '卯', '酉']
/** 四隅（寅申巳亥） */
const SI_YU_NAME: Zhi['name'][] = ['寅', '申', '巳', '亥']
/** 四库（辰戌丑未）, 皆属土，依次分别为 水库 火库 金库 木库 */
const SI_KU_NAME: Zhi['name'][] = ['辰', '戌', '丑', '未']

/** 获取地支的五行 */
const getZhiWuxing = (name: Zhi['name'], index: Zhi['index']) => {
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
const isInZhengZhi = (name: Zhi['name']) => ZHENG_ZHI_NAME.includes(name)
/** 判断是否属于四隅 */
const isInSiYu = (name: Zhi['name']) => SI_YU_NAME.includes(name)
/** 判断是否属于四库 */
const isInSiku = (name: Zhi['name']) => SI_KU_NAME.includes(name)

const zhis: Zhi[] = ZHI_NAME.map((name, index) => {
  return {
    name,
    index,
    yinYang: yinYangs[index % 2],
    wuxing: getZhiWuxing(name, index),
    direction: directions[Math.floor(index + 2) % 5],
    season: seasons[Math.floor((index + 2) % 3) % 4],
    animal: animals[index % 12],
  }
})

export { yinYangs, wuxings, directions, seasons, animals, gans, zhis, isInZhengZhi, isInSiYu, isInSiku }
