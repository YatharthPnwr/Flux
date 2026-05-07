'use client'
import { useMemo } from 'react'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'
import { Toaster } from 'react-hot-toast'
import { DemoProvider } from '@/context/DemoContext'
import '@solana/wallet-adapter-react-ui/styles.css'

const RPC = process.env.NEXT_PUBLIC_HELIUS_RPC ?? 'https://api.mainnet-beta.solana.com'

export function Providers({ children }: { children: React.ReactNode }) {
  const wallets = useMemo(() => [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
  ], [])

  return (
    <ConnectionProvider endpoint={RPC}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <DemoProvider>
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: '#1a1a2e',
                  color: '#e2e8f0',
                  border: '1px solid rgba(99,102,241,0.3)',
                  borderRadius: '12px',
                  fontSize: '14px',
                },
                success: { iconTheme: { primary: '#4ade80', secondary: '#1a1a2e' } },
                error: { iconTheme: { primary: '#f87171', secondary: '#1a1a2e' } },
              }}
            />
            {children}
          </DemoProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}
