'use client'
import { useState, useEffect } from 'react'

interface Props {
  value: number
  onChange: (v: number) => void
}

export function AmountInput({ value, onChange }: Props) {
  const [raw, setRaw] = useState(value > 0 ? String(value) : '')

  useEffect(() => {
    const t = setTimeout(() => {
      const n = parseFloat(raw)
      onChange(isNaN(n) || n < 0 ? 0 : n)
    }, 300)
    return () => clearTimeout(t)
  }, [raw, onChange])

  return (
    <div className="amount-input-wrap">
      <span className="amount-currency">$</span>
      <input
        id="amount-input"
        type="number"
        min={1}
        step={1}
        placeholder="500"
        value={raw}
        onChange={e => setRaw(e.target.value)}
        className="amount-input"
        aria-label="Amount in USD"
      />
      <span className="amount-label">USDC</span>
    </div>
  )
}
