import { getBazi } from '@repo/fortune-utils'
import { useEffect, useState } from 'react'
import type { Bazi } from '@repo/fortune-utils'

export default function GenerateBazi(): React.ReactElement {
  const [bazi, setBazi] = useState<Bazi | null>(null)
  const fetchBazi = async (): Promise<void> => {
    const baziResult = await getBazi({
      date: new Date('1994-09-16 14:31:00'),
      address: '四川眉山',
      gender: 'male',
    })
    console.log(baziResult)
    setBazi(baziResult)
  }

  useEffect(() => {
    fetchBazi()
  }, [])

  return <div>八字：{bazi?.sizhu.map(item => item.name).join('')}</div>
}
