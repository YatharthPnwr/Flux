'use client'
import { useState, useCallback } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import toast from 'react-hot-toast'
import { PublicKey } from '@solana/web3.js'
import { getAssociatedTokenAddress, getAccount } from '@solana/spl-token'
import { AmountInput } from './AmountInput'
import { RateComparison } from './RateComparison'
import { MoonPayWidget } from './MoonPayWidget'
import { useJupiterQuote } from '@/hooks/useJupiterQuote'
import { useWiseRate } from '@/hooks/useWiseRate'
import { calcSavings } from '@/utils/savings'
import { fetchJupiterSwap } from '@/hooks/useJupiterSwap'
import { executeSwap } from '@/utils/executeSwap'

type Step = 'idle' | 'review' | 'signing' | 'confirmed' | 'error'

const USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v')

export function SendWizard() {
  const { connection } = useConnection()
  const { publicKey, signTransaction, connected } = useWallet()

  const [amount, setAmount] = useState(0)
  const [step, setStep] = useState<Step>('idle')
  const [txSig, setTxSig] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [showMoonPay, setShowMoonPay] = useState(false)
  const [confirmedEurc, setConfirmedEurc] = useState(0)

  const { data: jupData } = useJupiterQuote(amount)
  const { wiseRate } = useWiseRate()

  const wiseEur = wiseRate && amount > 0 ? amount * wiseRate * (1 - 0.0043) : null
  const savings = jupData && wiseEur ? calcSavings(jupData.eurcReceived, wiseEur) : null

  const handleAmountChange = useCallback((v: number) => setAmount(v), [])

  async function checkUsdcBalance(): Promise<boolean> {
    if (!publicKey) return false
    try {
      const ata = await getAssociatedTokenAddress(USDC_MINT, publicKey)
      const account = await getAccount(connection, ata)
      const balance = Number(account.amount) / 1_000_000
      if (balance < amount) {
        toast.error(`Insufficient USDC balance. You have ${balance.toFixed(2)} USDC.`)
        return false
      }
      return true
    } catch {
      toast.error('Could not read USDC balance. Make sure you hold USDC.')
      return false
    }
  }

  async function handleReview() {
    if (!connected || !publicKey) {
      toast.error('Please connect your wallet first.')
      return
    }
    if (amount <= 0) {
      toast.error('Enter an amount greater than 0.')
      return
    }
    if (!jupData) {
      toast.error('Waiting for quote…')
      return
    }
    const ok = await checkUsdcBalance()
    if (!ok) return
    setStep('review')
  }

  async function handleSign() {
    if (!publicKey || !signTransaction || !jupData) return
    setStep('signing')
    try {
      const { swapTransaction, lastValidBlockHeight } = await fetchJupiterSwap(
        jupData.quoteResponse,
        publicKey.toBase58()
      )
      const sig = await executeSwap(connection, swapTransaction, lastValidBlockHeight, signTransaction)
      setTxSig(sig)
      setConfirmedEurc(jupData.eurcReceived)
      setStep('confirmed')
      toast.success('Swap confirmed! 🎉')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error'
      if (msg.toLowerCase().includes('rejected') || msg.toLowerCase().includes('cancelled')) {
        toast.error('Transaction cancelled.')
        setStep('review')
      } else {
        setErrorMsg(msg)
        setStep('error')
      }
    }
  }

  function reset() {
    setStep('idle')
    setAmount(0)
    setTxSig(null)
    setErrorMsg(null) 
    setShowMoonPay(false)
  }

  return (
    <div className="wizard-wrap" id="send-wizard">
      {/* ── Step indicators ── */}
      <div className="wizard-steps" aria-label="Wizard steps">
        {(['idle', 'review', 'confirmed'] as const).map((s, i) => (
          <div key={s} className={`wizard-step ${step === s || (s === 'idle' && step === 'signing') || (s === 'review' && step === 'signing') ? 'active' : ''} ${step === 'confirmed' && i < 2 ? 'done' : ''}`}>
            <span className="wizard-step-num">{i + 1}</span>
            <span className="wizard-step-label">{['Amount', 'Review', 'Confirmed'][i]}</span>
          </div>
        ))}
      </div>

      {/* ── Step 1: Amount ── */}
      {(step === 'idle') && (
        <div className="wizard-panel">
          <h2 className="wizard-title">How much are you sending?</h2>
          <AmountInput value={amount} onChange={handleAmountChange} />

          {amount > 0 && <RateComparison amountUsdc={amount} />}

          <button
            id="btn-review"
            className="btn-primary"
            onClick={handleReview}
            disabled={amount <= 0 || !jupData}
          >
            Review Transfer
          </button>
        </div>
      )}

      {/* ── Step 2: Review ── */}
      {(step === 'review' || step === 'signing') && jupData && (
        <div className="wizard-panel">
          <h2 className="wizard-title">Review your transfer</h2>

          <div className="review-card">
            <div className="review-row">
              <span>You send</span>
              <strong>{amount.toFixed(2)} USDC</strong>
            </div>
            <div className="review-row">
              <span>You receive (est.)</span>
              <strong className="highlight">{jupData.eurcReceived.toFixed(2)} EURC</strong>
            </div>
            {savings && savings.diff > 0 && (
              <div className="review-row savings">
                <span>Savings vs Wise</span>
                <strong>+{savings.diff.toFixed(2)} EUR (+{savings.pct.toFixed(2)}%)</strong>
              </div>
            )}
            <div className="review-row">
              <span>Price impact</span>
              <strong>{jupData.priceImpactPct.toFixed(3)}%</strong>
            </div>
            <div className="review-row">
              <span>Network fee</span>
              <strong>~0.05%</strong>
            </div>
          </div>

          <p className="review-disclaimer">
            Rate locked for ~30s. Slippage tolerance: 0.30%.
          </p>

          <div className="wizard-actions">
            <button
              id="btn-back"
              className="btn-secondary"
              onClick={() => setStep('idle')}
              disabled={step === 'signing'}
            >
              Back
            </button>
            <button
              id="btn-sign"
              className="btn-primary"
              onClick={handleSign}
              disabled={step === 'signing'}
            >
              {step === 'signing' ? (
                <span className="btn-loading"><span className="spinner-sm" /> Waiting for wallet…</span>
              ) : 'Confirm & Sign'}
            </button>
          </div>
        </div>
      )}

      {/* ── Step 3: Confirmed ── */}
      {step === 'confirmed' && txSig && (
        <div className="wizard-panel confirmed-panel">
          <div className="confirmed-icon">✓</div>
          <h2 className="wizard-title">Swap confirmed!</h2>
          <p className="confirmed-eurc">{confirmedEurc.toFixed(2)} EURC in your wallet</p>

          <a
            href={`https://solscan.io/tx/${txSig}`}
            target="_blank"
            rel="noopener noreferrer"
            className="tx-link"
            id="tx-explorer-link"
          >
            View on Solscan ↗
          </a>

          <button
            id="btn-offramp"
            className="btn-primary"
            onClick={() => setShowMoonPay(true)}
          >
            💶 Off-ramp to EUR bank
          </button>

          <button id="btn-new-transfer" className="btn-secondary" onClick={reset}>
            New Transfer
          </button>
        </div>
      )}

      {/* ── Error ── */}
      {step === 'error' && (
        <div className="wizard-panel error-panel">
          <div className="error-icon">✕</div>
          <h2 className="wizard-title">Something went wrong</h2>
          {errorMsg && <pre className="error-msg">{errorMsg}</pre>}
          <button id="btn-retry" className="btn-primary" onClick={reset}>
            Try Again
          </button>
        </div>
      )}

      {/* ── MoonPay overlay ── */}
      {showMoonPay && publicKey && (
        <MoonPayWidget
          eurcAmount={confirmedEurc}
          walletAddress={publicKey.toBase58()}
          onClose={() => setShowMoonPay(false)}
        />
      )}
    </div>
  )
}
