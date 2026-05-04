'use client'
import { useState, useEffect } from 'react'

interface Props {
  eurcAmount: number
  walletAddress: string
  onClose: () => void
}

export function MoonPayWidget({ eurcAmount, walletAddress, onClose }: Props) {
  const [url, setUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function buildUrl() {
      try {
        const params = new URLSearchParams({
          apiKey: process.env.NEXT_PUBLIC_MOONPAY_PK ?? '',
          baseCurrencyCode: 'eurc_sol',
          baseCurrencyAmount: eurcAmount.toFixed(6),
          quoteCurrencyCode: 'eur',
          refundWalletAddress: walletAddress,
          paymentMethod: 'bank_transfer',
        })
        const qs = params.toString()
        const res = await fetch('/api/moonpay-sign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ queryString: `?${qs}` }),
        })
        const { signature } = await res.json()
        const base = process.env.NEXT_PUBLIC_MOONPAY_ENV === 'production'
          ? 'https://sell.moonpay.com'
          : 'https://sell-sandbox.moonpay.com'
        setUrl(`${base}/?${qs}&signature=${encodeURIComponent(signature)}`)
      } catch (e) {
        setError('Failed to open MoonPay. Please try again.')
      }
    }
    buildUrl()
  }, [eurcAmount, walletAddress])

  return (
    <div className="moonpay-overlay" role="dialog" aria-label="MoonPay off-ramp">
      <div className="moonpay-modal">
        <div className="moonpay-header">
          <span>💶 Off-ramp to EUR</span>
          <button onClick={onClose} className="moonpay-close" aria-label="Close">
            ✕
          </button>
        </div>

        {error && (
          <div className="moonpay-error">
            <p>{error}</p>
            <p className="moonpay-fallback">
              Manually send {eurcAmount.toFixed(2)} EURC to your bank via MoonPay at{' '}
              <a href="https://sell-sandbox.moonpay.com" target="_blank" rel="noopener">
                sell-sandbox.moonpay.com
              </a>
            </p>
          </div>
        )}

        {!error && !url && (
          <div className="moonpay-loading">
            <div className="spinner" />
            <p>Loading MoonPay...</p>
          </div>
        )}

        {url && (
          <iframe
            src={url}
            title="MoonPay Off-Ramp"
            className="moonpay-iframe"
            allow="accelerometer; autoplay; camera; gyroscope; payment"
          />
        )}
      </div>
    </div>
  )
}
