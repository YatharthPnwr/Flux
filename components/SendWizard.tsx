'use client'
import { useState, useCallback } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import toast from 'react-hot-toast'
import { PublicKey } from '@solana/web3.js'
import { getAssociatedTokenAddress, getAccount } from '@solana/spl-token'
import { AmountInput } from './AmountInput'
import { RateComparison } from './RateComparison'
import { MoonPayWidget } from './MoonPayWidget'
import { DemoOffRamp } from './DemoOffRamp'
import { RecipientStep, RecipientDetails } from './RecipientStep'
import { SlippageModal, useSlippage } from './SlippageModal'
import { useJupiterQuote } from '@/hooks/useJupiterQuote'
import { useWiseRate } from '@/hooks/useWiseRate'
import { calcSavings } from '@/utils/savings'
import { fetchJupiterSwap } from '@/hooks/useJupiterSwap'
import { executeSwap } from '@/utils/executeSwap'
import { useDemoMode } from '@/context/DemoContext'
import { saveTx } from './TxHistory'

type Step = 'idle' | 'recipient' | 'review' | 'signing' | 'confirmed' | 'error'

const USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v')
// Real historical USDC→EURC mainnet tx for demo confirmation
const DEMO_TX = '5Zv3iKp7Hf8bKsqXQ3GnJR2aLkP9xwEuPmWvE7NqdH1bFtXRgMj8zWzK6VCthsYJBKuRpD4QewTiDs3mAx9'

const STEP_LABELS = ['Amount', 'Recipient', 'Review', 'Done']
const STEP_KEYS: Step[] = ['idle', 'recipient', 'review', 'confirmed']

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

export function SendWizard() {
  const { connection } = useConnection()
  const { publicKey, signTransaction, connected } = useWallet()
  const { isDemo, enterDemo } = useDemoMode()
  const { slippageBps, setSlippageBps } = useSlippage()

  const [amount, setAmount] = useState(0)
  const [step, setStep] = useState<Step>('idle')
  const [txSig, setTxSig] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [showMoonPay, setShowMoonPay] = useState(false)
  const [confirmedEurc, setConfirmedEurc] = useState(0)
  const [recipient, setRecipient] = useState<RecipientDetails | null>(null)
  const [showSlippage, setShowSlippage] = useState(false)

  const { data: jupData } = useJupiterQuote(amount, slippageBps)
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
        toast.error(`Insufficient USDC. You have ${balance.toFixed(2)} USDC.`)
        return false
      }
      return true
    } catch {
      toast.error('Could not read USDC balance. Make sure you hold USDC.')
      return false
    }
  }

  async function handleReview() {
    if (!isDemo && (!connected || !publicKey)) {
      toast.error('Connect your wallet first, or try Demo Mode.')
      return
    }
    if (amount <= 0) { toast.error('Enter an amount greater than 0.'); return }
    if (!jupData) { toast.error('Waiting for quote…'); return }

    const skipBalanceCheck =
      isDemo || process.env.NEXT_PUBLIC_SKIP_BALANCE_CHECK === 'true'

    if (!skipBalanceCheck) {
      const ok = await checkUsdcBalance()
      if (!ok) return
    }
    setStep('recipient')
  }

  async function handleSign() {
    if (isDemo) {
      setStep('signing')
      await sleep(2200)
      const eurc = jupData?.eurcReceived ?? amount * 0.924
      setTxSig(DEMO_TX)
      setConfirmedEurc(eurc)
      setStep('confirmed')
      toast.success('Swap confirmed! 🎉')
      saveTx({
        id: `demo-${Date.now()}`,
        timestamp: Date.now(),
        amountUsdc: amount,
        eurcReceived: eurc,
        savingsEur: savings?.diff ?? 0,
        txSig: DEMO_TX,
        isDemo: true,
      })
      return
    }
    if (!publicKey || !signTransaction || !jupData) return
    setStep('signing')
    try {
      const { swapTransaction, lastValidBlockHeight } = await fetchJupiterSwap(
        jupData.quoteResponse, publicKey.toBase58()
      )
      const sig = await executeSwap(connection, swapTransaction, lastValidBlockHeight, signTransaction)
      setTxSig(sig)
      setConfirmedEurc(jupData.eurcReceived)
      setStep('confirmed')
      toast.success('Swap confirmed! 🎉')
      saveTx({
        id: sig,
        timestamp: Date.now(),
        amountUsdc: amount,
        eurcReceived: jupData.eurcReceived,
        savingsEur: savings?.diff ?? 0,
        txSig: sig,
        isDemo: false,
      })
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
    setRecipient(null)
  }

  const displayStep = step === 'signing' ? 'review' : step === 'error' ? 'review' : step
  const activeIdx = STEP_KEYS.indexOf(displayStep)

  return (
    <div className="wizard-wrap" id="send-wizard">
      {isDemo && (
        <div className="demo-badge" role="status">
          ⚡ Demo Mode — no real funds used
        </div>
      )}

      {/* Step indicators */}
      <div className="wizard-steps" aria-label="Wizard steps">
        {STEP_LABELS.map((label, i) => (
          <div
            key={label}
            className={`wizard-step${i === activeIdx ? ' active' : ''}${i < activeIdx ? ' done' : ''}`}
          >
            <span className="wizard-step-num">{i + 1}</span>
            <span className="wizard-step-label">{label}</span>
          </div>
        ))}
      </div>

      {/* Slippage modal */}
      {showSlippage && (
        <SlippageModal slippageBps={slippageBps} onSave={setSlippageBps} onClose={() => setShowSlippage(false)} />
      )}

      {/* Step 1: Amount */}
      {step === 'idle' && (
        <div className="wizard-panel">
          <div className="wizard-title-row">
            <h2 className="wizard-title">How much are you sending?</h2>
            <button
              id="btn-slippage"
              className="btn-icon"
              onClick={() => setShowSlippage(true)}
              aria-label="Slippage settings"
              title={`Slippage: ${(slippageBps / 100).toFixed(1)}%`}
            >
              ⚙️
            </button>
          </div>

          <AmountInput value={amount} onChange={handleAmountChange} />
          {amount > 0 && <RateComparison amountUsdc={amount} slippageBps={slippageBps} />}

          <button
            id="btn-review"
            className="btn-primary"
            onClick={handleReview}
            disabled={amount <= 0 || !jupData}
          >
            Review Transfer
          </button>

          {!isDemo && !connected && (
            <p className="connect-hint">
              No wallet?{' '}
              <button id="btn-try-demo" className="link-btn" onClick={enterDemo}>
                Try Demo Mode →
              </button>
            </p>
          )}
        </div>
      )}

      {/* Step 2: Recipient */}
      {step === 'recipient' && (
        <RecipientStep
          onNext={details => { setRecipient(details); setStep('review') }}
          onBack={() => setStep('idle')}
        />
      )}

      {/* Step 3: Review */}
      {(step === 'review' || step === 'signing') && jupData && (
        <div className="wizard-panel">
          <h2 className="wizard-title">Review your transfer</h2>

          {recipient && (
            <div className="recipient-summary">
              <span className="recipient-label">To</span>
              <div className="recipient-info">
                <span className="recipient-name">{recipient.fullName}</span>
                <span className="recipient-iban">
                  {recipient.iban.replace(/(.{4})/g, '$1 ').trim()}
                </span>
              </div>
            </div>
          )}

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
              <span>Slippage tolerance</span>
              <strong>{(slippageBps / 100).toFixed(1)}%</strong>
            </div>
            <div className="review-row">
              <span>Network fee</span>
              <strong>~0.05%</strong>
            </div>
          </div>

          <p className="review-disclaimer">Rate locked for ~30s. Jupiter best-route execution.</p>

          <div className="wizard-actions">
            <button
              id="btn-back"
              className="btn-secondary"
              onClick={() => setStep('recipient')}
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

      {/* Step 4: Confirmed */}
      {step === 'confirmed' && txSig && (
        <div className="wizard-panel confirmed-panel">
          <div className="confirmed-icon">✓</div>
          <h2 className="wizard-title">Swap confirmed!</h2>
          <p className="confirmed-eurc">{confirmedEurc.toFixed(2)} EURC in your wallet</p>

          {recipient && (
            <p className="confirmed-next">
              Next: off-ramp to <strong>{recipient.fullName}</strong>'s account via MoonPay
            </p>
          )}

          <a
            href={`https://solscan.io/tx/${txSig}`}
            target="_blank"
            rel="noopener noreferrer"
            className="tx-link"
            id="tx-explorer-link"
          >
            {isDemo ? 'View sample tx on Solscan ↗' : 'View on Solscan ↗'}
          </a>

          <button id="btn-offramp" className="btn-primary" onClick={() => setShowMoonPay(true)}>
            💶 Off-ramp to EUR bank
          </button>

          <button id="btn-new-transfer" className="btn-secondary" onClick={reset}>
            New Transfer
          </button>
        </div>
      )}

      {/* Error */}
      {step === 'error' && (
        <div className="wizard-panel error-panel">
          <div className="error-icon">✕</div>
          <h2 className="wizard-title">Something went wrong</h2>
          {errorMsg && <pre className="error-msg">{errorMsg}</pre>}
          <button id="btn-retry" className="btn-primary" onClick={reset}>Try Again</button>
        </div>
      )}

      {/* MoonPay overlay — real mode */}
      {showMoonPay && !isDemo && publicKey && (
        <MoonPayWidget
          eurcAmount={confirmedEurc}
          walletAddress={publicKey.toBase58()}
          recipientIban={recipient?.iban}
          recipientName={recipient?.fullName}
          onClose={() => setShowMoonPay(false)}
        />
      )}

      {/* Demo off-ramp — no real keys needed */}
      {showMoonPay && isDemo && (
        <DemoOffRamp
          eurcAmount={confirmedEurc}
          recipientName={recipient?.fullName}
          recipientIban={recipient?.iban}
          onClose={() => setShowMoonPay(false)}
        />
      )}
    </div>
  )
}
