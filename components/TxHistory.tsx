'use client'
import { useState, useEffect } from 'react'

export interface TxRecord {
  id: string
  timestamp: number
  amountUsdc: number
  eurcReceived: number
  savingsEur: number
  txSig: string
  isDemo: boolean
}

export function saveTx(record: TxRecord) {
  try {
    const raw = localStorage.getItem('flux_history')
    const hist: TxRecord[] = raw ? JSON.parse(raw) : []
    hist.unshift(record)
    if (hist.length > 20) hist.pop()
    localStorage.setItem('flux_history', JSON.stringify(hist))
  } catch {}
}

export function TxHistory() {
  const [history, setHistory] = useState<TxRecord[]>([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('flux_history')
      if (raw) setHistory(JSON.parse(raw))
    } catch {}
  }, [])

  if (history.length === 0) return null

  return (
    <div className="tx-history">
      <button
        id="btn-history-toggle"
        className="tx-history-toggle"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <span>📋 Recent transfers ({history.length})</span>
        <span className={`tx-chevron${open ? ' open' : ''}`}>▾</span>
      </button>
      {open && (
        <div className="tx-history-list">
          {history.map(tx => (
            <div key={tx.id} className="tx-row">
              <div className="tx-row-main">
                <span className="tx-amount">${tx.amountUsdc.toFixed(0)} USDC</span>
                <span className="tx-arrow">→</span>
                <span className="tx-eurc">{tx.eurcReceived.toFixed(2)} EURC</span>
                {tx.isDemo && <span className="tx-demo-tag">demo</span>}
              </div>
              <div className="tx-row-meta">
                {tx.savingsEur > 0 && <span className="tx-savings">+€{tx.savingsEur.toFixed(2)} saved</span>}
                <a
                  href={`https://solscan.io/tx/${tx.txSig}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tx-link"
                >
                  {tx.isDemo ? 'Sample tx ↗' : 'Solscan ↗'}
                </a>
                <span className="tx-date">{new Date(tx.timestamp).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
