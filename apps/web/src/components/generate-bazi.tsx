import { getBazi } from '@repo/fortune-utils'
import { useEffect, useState } from 'react'
import type { Bazi } from '@repo/fortune-utils'

export default function GenerateBazi(): React.ReactElement {
  const [bazi, setBazi] = useState<Bazi | null>(null)
  const fetchBazi = async (): Promise<void> => {
    const baziResult = await getBazi(new Date())
    setBazi(baziResult)
  }

  useEffect(() => {
    fetchBazi()
  }, [])

  return <div>八字：{bazi?.sizhu.map(item => item.name).join('')}</div>
}
