/** 象 */
export type BasicField<T = Record<string, any>> = T & {
  index?: number // 索引
  name: string // 名称
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

export type OptionField<T = { name: string; value: number }> = {
  name: T['name']
  value: T['value']
}

export type IndexField<T = Record<string, any>> = BasicField<T> & {
  index: number
}
