'use client'

import './globals.css'
import '@repo/ui/styles.css'

import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
