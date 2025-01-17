import { getBazi } from '@repo/fortune-utils'
import { useEffect, useState } from 'react'
import type { Bazi } from '@repo/fortune-utils'

export default function GenerateBazi(): React.ReactElement {
  const [bazi, setBazi] = useState<Bazi | null>(null)
  const fetchBazi = async (): Promise<void> => {
    const baziResult = await getBazi(new Date('1996-11-08 02:28:00'), '四川眉山')
    console.log(baziResult)
    setBazi(baziResult)
  }

  useEffect(() => {
    fetchBazi()
  }, [])

  return <div>八字：{bazi?.sizhu.map(item => item.name).join('')}</div>
}
