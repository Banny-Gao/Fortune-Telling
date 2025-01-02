'use client'
import { getBazi } from '@repo/fortune-utils'
import { useEffect } from 'react'

export default function Home() {
  useEffect(() => {
    // 确保代码只在浏览器环境中执行
    if (typeof window !== 'undefined') {
      getBazi(new Date())
    }
  }, [])

  return <div>123</div>
}
