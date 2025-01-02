import { Animal } from './types'

export const ANIMAL_NAME: Animal['name'][] = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪']
export const animals: Animal[] = ANIMAL_NAME.map((name, index) => ({
  name,
  index,
}))
