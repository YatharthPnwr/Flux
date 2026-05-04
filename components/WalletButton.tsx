'use client'
import dynamic from 'next/dynamic'

const WalletMultiButtonClient = dynamic(
  () => import('./WalletMultiButtonClient').then((mod) => mod.WalletMultiButtonClient),
  {
    ssr: false,
    loading: () => <div className="wallet-btn-placeholder" aria-hidden />,
  },
)

export function WalletButton() {
  return <WalletMultiButtonClient />
}
