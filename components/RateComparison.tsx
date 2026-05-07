'use client'
import { useJupiterQuote } from '@/hooks/useJupiterQuote'
import { useWiseRate } from '@/hooks/useWiseRate'
import { calcSavings } from '@/utils/savings'

interface Props {
  amountUsdc: number
  slippageBps?: number
}

function Skeleton() {
  return <span className="skeleton" aria-hidden />
}

export function RateComparison({ amountUsdc, slippageBps = 30 }: Props) {
  const { data: jup, isLoading: jupLoading, error: jupErr } = useJupiterQuote(amountUsdc, slippageBps)
  const { wiseRate, isLoading: wiseLoading } = useWiseRate()

  const loading = jupLoading || wiseLoading

  const jupRate = jup ? (jup.eurcReceived / amountUsdc) : null
  const wiseEur = wiseRate ? amountUsdc * wiseRate * (1 - 0.0043) : null
  const savings = jup && wiseEur ? calcSavings(jup.eurcReceived, wiseEur) : null

  if (jupErr) {
    return (
      <div className="rate-error">
        ⚠️ Could not fetch Jupiter quote. Check your connection.
      </div>
    )
  }

  return (
    <div className="rate-comparison">
      {savings && savings.diff > 0 && (
        <div className="savings-banner" role="status">
          <span className="savings-icon">✦</span>
          <span>
            You get <strong>+{savings.diff.toFixed(2)} EUR</strong> (+{savings.pct.toFixed(2)}%) more than Wise
          </span>
        </div>
      )}

      <div className="rate-table-wrap">
        <table className="rate-table">
          <thead>
            <tr>
              <th></th>
              <th className="col-flux">⚡ Flux</th>
              <th className="col-wise">Wise</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Rate</td>
              <td className="col-flux">
                {loading ? <Skeleton /> : jupRate ? `${jupRate.toFixed(4)}` : '—'}
              </td>
              <td className="col-wise">
                {loading ? <Skeleton /> : wiseRate ? `${wiseRate.toFixed(4)}` : '—'}
              </td>
            </tr>
            <tr>
              <td>Fee</td>
              <td className="col-flux">~0.05%</td>
              <td className="col-wise">~0.43%</td>
            </tr>
            <tr>
              <td>You get</td>
              <td className="col-flux highlight">
                {loading ? <Skeleton /> : jup ? `${jup.eurcReceived.toFixed(2)} EUR` : '—'}
              </td>
              <td className="col-wise">
                {loading ? <Skeleton /> : wiseEur ? `${wiseEur.toFixed(2)} EUR` : '—'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {jup && (
        <p className="rate-refresh-note">Rate refreshes every 15s · Slippage ≤0.30%</p>
      )}
    </div>
  )
}
