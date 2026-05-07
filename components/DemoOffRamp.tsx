'use client'
import { useState } from 'react'

interface Props {
  eurcAmount: number
  recipientName?: string
  recipientIban?: string
  onClose: () => void
}

export function DemoOffRamp({ eurcAmount, recipientName, recipientIban, onClose }: Props) {
  const [step, setStep] = useState<'details' | 'processing' | 'done'>('details')

  const maskedIban = recipientIban
    ? recipientIban.slice(0, 4) + ' •••• •••• ' + recipientIban.slice(-4)
    : 'DE89 •••• •••• 3000'

  function handleInitiate() {
    setStep('processing')
    setTimeout(() => setStep('done'), 2500)
  }

  return (
    <div className="moonpay-overlay" role="dialog" aria-label="Off-ramp demo">
      <div className="moonpay-modal">
        <div className="moonpay-header">
          <span>💶 Off-ramp to EUR <span className="demo-tag-sm">demo</span></span>
          <button onClick={onClose} className="moonpay-close" aria-label="Close">✕</button>
        </div>

        {step === 'details' && (
          <div className="demo-offramp-body">
            <div className="demo-offramp-amount">
              <span className="demo-offramp-val">{eurcAmount.toFixed(2)}</span>
              <span className="demo-offramp-ccy">EURC</span>
            </div>
            <div className="demo-offramp-arrow">↓</div>
            <div className="demo-offramp-eur">
              <span className="demo-offramp-val">{(eurcAmount * 0.9985).toFixed(2)}</span>
              <span className="demo-offramp-ccy">EUR</span>
              <span className="demo-offramp-fee">after 0.15% SEPA fee</span>
            </div>

            <div className="demo-offramp-card">
              <div className="demo-offramp-row">
                <span>Recipient</span>
                <strong>{recipientName ?? 'Jane Doe'}</strong>
              </div>
              <div className="demo-offramp-row">
                <span>IBAN</span>
                <strong className="demo-iban">{maskedIban}</strong>
              </div>
              <div className="demo-offramp-row">
                <span>Method</span>
                <strong>SEPA Bank Transfer</strong>
              </div>
              <div className="demo-offramp-row">
                <span>Arrival</span>
                <strong>1–2 business days</strong>
              </div>
            </div>

            <p className="demo-offramp-note">
              ⚡ Demo Mode — in production this opens MoonPay's verified off-ramp flow.
            </p>

            <button id="btn-demo-initiate" className="btn-primary" onClick={handleInitiate}>
              Initiate SEPA Transfer
            </button>
          </div>
        )}

        {step === 'processing' && (
          <div className="moonpay-loading">
            <div className="spinner" />
            <p>Initiating SEPA transfer...</p>
          </div>
        )}

        {step === 'done' && (
          <div className="demo-offramp-body">
            <div className="demo-offramp-success-icon">💶</div>
            <h3 className="demo-offramp-success-title">Transfer Initiated!</h3>
            <p className="demo-offramp-success-sub">
              <strong>{(eurcAmount * 0.9985).toFixed(2)} EUR</strong> is on its way to{' '}
              <strong>{recipientName ?? 'Jane Doe'}</strong> via SEPA.
            </p>
            <p className="demo-offramp-success-sub" style={{ opacity: 0.6 }}>
              Expected arrival: 1–2 business days
            </p>
            <button id="btn-demo-offramp-done" className="btn-primary" onClick={onClose} style={{ marginTop: '0.5rem' }}>
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
