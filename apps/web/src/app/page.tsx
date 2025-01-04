'use client'
import dynamic from 'next/dynamic'

const GenerateBazi = dynamic(() => import('../components/generate-bazi'), { ssr: false })

export default function Home(): React.ReactElement {
  return <GenerateBazi />
}
