'use client'
import { useState, useEffect } from 'react'

const STORAGE_KEY = 'flux_slippage_bps'
const PRESETS = [10, 30, 50, 100]

export function useSlippage() {
  const [slippageBps, setSlippageBps] = useState(30)
  useEffect(() => {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v) setSlippageBps(Number(v))
  }, [])
  function save(bps: number) {
    setSlippageBps(bps)
    localStorage.setItem(STORAGE_KEY, String(bps))
  }
  return { slippageBps, setSlippageBps: save }
}

interface Props {
  slippageBps: number
  onSave: (bps: number) => void
  onClose: () => void
}

export function SlippageModal({ slippageBps, onSave, onClose }: Props) {
  const [value, setValue] = useState(slippageBps)
  const [customPct, setCustomPct] = useState('')

  return (
    <div className="slippage-overlay" role="dialog" aria-label="Slippage settings" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="slippage-modal">
        <div className="slippage-header">
          <span>⚙️ Slippage Tolerance</span>
          <button className="moonpay-close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="slippage-body">
          <p className="slippage-desc">
            Max accepted price deviation. Higher = more likely to succeed, more potential slippage.
          </p>
          <div className="slippage-presets">
            {PRESETS.map(p => (
              <button
                key={p}
                className={`slippage-preset${value === p && !customPct ? ' active' : ''}`}
                onClick={() => { setValue(p); setCustomPct('') }}
              >
                {(p / 100).toFixed(1)}%
              </button>
            ))}
            <input
              className={`slippage-custom${customPct ? ' active' : ''}`}
              type="number"
              placeholder="Custom %"
              value={customPct}
              min="0.01"
              max="5"
              step="0.01"
              onChange={e => {
                setCustomPct(e.target.value)
                const bps = Math.round(parseFloat(e.target.value) * 100)
                if (!isNaN(bps) && bps > 0 && bps <= 500) setValue(bps)
              }}
            />
          </div>
          {value > 100 && (
            <p className="slippage-warn">⚠️ High slippage — you may receive significantly less EUR</p>
          )}
          <p className="slippage-current">Active: <strong>{(value / 100).toFixed(2)}%</strong></p>
          <button id="btn-save-slippage" className="btn-primary" onClick={() => { onSave(value); onClose() }}>
            Save Settings
          </button>
        </div>
      </div>
    </div>
  )
}
