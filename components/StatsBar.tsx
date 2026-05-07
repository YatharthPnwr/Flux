'use client'
import { useEffect, useState } from 'react'

const SEED = { volume: 2_341_892, txs: 847, savings: 5832 }

export function StatsBar() {
  const [stats, setStats] = useState(SEED)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('flux_history')
      if (!raw) return
      const hist = JSON.parse(raw) as Array<{ amountUsdc: number; savingsEur: number }>
      setStats({
        volume: SEED.volume + hist.reduce((s, t) => s + (t.amountUsdc || 0), 0),
        txs: SEED.txs + hist.length,
        savings: SEED.savings + hist.reduce((s, t) => s + (t.savingsEur || 0), 0),
      })
    } catch {}
  }, [])

  return (
    <div className="stats-bar">
      <div className="stats-inner">
        <div className="stat-item">
          <span className="stat-val">${(stats.volume / 1_000_000).toFixed(1)}M</span>
          <span className="stat-lbl">Volume Processed</span>
        </div>
        <div className="stat-sep" />
        <div className="stat-item">
          <span className="stat-val">{stats.txs.toLocaleString()}</span>
          <span className="stat-lbl">Transactions</span>
        </div>
        <div className="stat-sep" />
        <div className="stat-item">
          <span className="stat-val">€{stats.savings.toLocaleString()}</span>
          <span className="stat-lbl">Saved vs Wise</span>
        </div>
        <div className="stat-sep" />
        <div className="stat-item">
          <span className="stat-val stat-green">~0.24%</span>
          <span className="stat-lbl">Fee Advantage</span>
        </div>
      </div>
    </div>
  )
}
