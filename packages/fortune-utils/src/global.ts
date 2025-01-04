/** 象 */
export type BasicField<T = object> = T & {
  name: string // 名称
  index?: number // 索引
  // yinYang?: YinYang // 阴阳
  // wuxing?: WuXing // 五行
  // direction?: Direction // 方位
  // numbers?: number[] // 代表的数字
  // season?: Season // 季节
  // animal?: Animal // 生肖
  // gan?: Gan // 天干
  // zhi?: Zhi // 地支
  // sixGods?: string // 六神
  // district?: string // 位置
  // color?: string // 颜色
  // sixRelations?: string // 六亲
  // fiveConstants?: string // 五常，仁义礼智信
  // fiveOrgans?: string // 五脏
  // sixOrgans?: string // 六腑
  // bodyParts?: string // 身体部位
}

interface Option {
  name: string
  value: number | string
}
export type OptionField<T extends Option = Option> = {
  name: T['name']
  value: T['value']
}

export type IndexField<T = object> = BasicField<T> & {
  index: number
}

export type TargetField<T = object> = BasicField<T> & {
  targetName: string
  targetIndex: number
}
