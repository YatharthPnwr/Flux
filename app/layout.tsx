import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from './providers'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Flux — Send USD to Europe, Beat Wise',
  description: 'Cross-border USDC→EUR payments on Solana. On-chain, transparent, cheaper than Wise.',
  openGraph: {
    title: 'Flux — Send USD to Europe, Beat Wise',
    description: 'Route USDC→EURC via Jupiter, then off-ramp to your EUR bank account in minutes.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
