declare global {
  export type BasicField<T = object> = {
    name: string // 名称
    index?: number // 索引
  } & T

  interface Option {
    name: string
    value: number | string
  }
  export type OptionField<T extends Option = Option> = {
    [key in keyof T]: T[key]
  }

  export type IndexField<T = object> = BasicField<T> & {
    index: number
  }

  export type TargetField<T extends { name: string } = { name: string }> = {
    targetName: T['name']
    targetIndex: number
  } & BasicField<T>

  /** 将字符串数组转换为联合类型 */
  export type NameConst<T extends readonly string[]> = T[number]

  export type GetRelationParams<T extends TargetField, S extends IndexField> = {
    target: S | S['name']
    nameArray: S['name'][]
    relationArray?: string[][]
    transform?: (item: string[]) => Required<Omit<T, keyof TargetField>>
    condition?: (item: string[]) => boolean
  }
}

/** 获取目标索引 */
export const getTargetIndex = <T extends string | IndexField>(target: T, nameArray: string[]): number | undefined =>
  typeof target === 'string' ? nameArray.indexOf(target) : target.index

/** 相互关系查找 */
export function getRelation<T extends TargetField, S extends IndexField>(this: S, params: GetRelationParams<T, S>): T | undefined {
  const { name, index } = this
  const { target, nameArray, relationArray, transform } = params

  const targetName = typeof target === 'string' ? target : target.name
  const targetIndex = getTargetIndex(target, nameArray)
  // 两相互判断
  const defaultCondition = (names?: string[]): boolean => !!names?.includes(name) && !!names?.includes(targetName)
  const condition = params.condition ?? defaultCondition

  const returnRelation = (item: string[]): T =>
    ({
      name,
      index,
      targetName,
      targetIndex,
      ...(transform?.(item) ?? {}),
    }) as T

  if (!relationArray) {
    return condition([]) ? returnRelation([]) : undefined
  }

  for (const item of relationArray) {
    if (condition(item)) {
      return returnRelation(item)
    }
  }
}

/** 通用函数生成 */
export const generateRelation = <T extends IndexField, S extends IndexField>(nameArray: string[], condition: (this: S, targetIndex: number) => boolean) =>
  function (this: S, target: T | T['name']): TargetField {
    const targetIndex = getTargetIndex<T | T['name']>(target, nameArray) as number

    return getRelation.bind(this)({
      target: target as unknown as S | S['name'],
      nameArray,
      condition: () => condition.call(this, targetIndex),
    }) as TargetField
  }

/** 批量生成 name const */
export const generateNamesProp = <T extends Record<string, readonly unknown[]>>(props: T, index: number): Record<string, T[keyof T][number]> =>
  Object.entries(props).reduce<Record<string, T[keyof T][number]>>((acc, [key, value]) => {
    acc[key] = value[index]
    return acc
  }, {})

/** 判断两个对象的 name 是否相同 */
export const equalName = <T extends BasicField>(a: T, b: T | T['name']): boolean => a.name === (typeof b === 'string' ? b : b.name)

/** 通过 name 获取对象 */
export const getObjectByName = <T extends BasicField>(objectArrary: T[], name: string): T | undefined => objectArrary.find(item => equalName(item, name))
