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

export type Option<name = string, value = number> = {
  name: name
  value: value
}

/** 阴阳 */
export type YinYang = Option<string, number>

/** 五行 */
export interface WuXing extends BasicField {
  name: string // 名称
}

/** 方位 */
export interface Direction extends BasicField {
  name: string // 名称
}

/** 季节 */
export interface Season extends BasicField {
  name: string // 名称
}

/** 生肖 */
export interface Animal extends BasicField {
  name: string // 名称
}

/** 天干 */
export interface Gan extends BasicField {
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

/** 地支 */
export interface Zhi extends BasicField {
  index: number // 索引
  name: string // 名称
}
