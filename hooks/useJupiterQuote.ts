import useSWR from 'swr'

const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
const EURC_MINT = 'HzwqbKZw8HxMN6bF2yFZNrht3c2iXXzpKcFu7uBEDKtr'

export interface JupiterQuoteResult {
  outAmount: number
  eurcReceived: number
  priceImpactPct: number
  routePlan: unknown[]
  quoteResponse: unknown
}

async function fetchJupiterQuote(amountUsdc: number, slippageBps: number): Promise<JupiterQuoteResult> {
  const atomicAmount = Math.round(amountUsdc * 1_000_000)
  const params = new URLSearchParams({
    inputMint: USDC_MINT,
    outputMint: EURC_MINT,
    amount: atomicAmount.toString(),
    slippageBps: slippageBps.toString(),
    restrictIntermediateTokens: 'true',
  })

  const headers: HeadersInit = {}
  const apiKey = process.env.NEXT_PUBLIC_JUPITER_API_KEY
  if (apiKey) headers['x-api-key'] = apiKey

  const res = await fetch(`https://api.jup.ag/swap/v1/quote?${params}`, { headers })
  if (!res.ok) throw new Error(`Jupiter quote failed: ${res.status}`)

  const data = await res.json()
  if (data.error) throw new Error(data.error)

  const outAmount = Number(data.outAmount)
  return {
    outAmount,
    eurcReceived: outAmount / 1_000_000,
    priceImpactPct: Number(data.priceImpactPct ?? 0),
    routePlan: data.routePlan ?? [],
    quoteResponse: data,
  }
}

export function useJupiterQuote(amountUsdc: number, slippageBps = 30) {
  const { data, error, isLoading } = useSWR(
    amountUsdc > 0 ? ['jupiter-quote', amountUsdc, slippageBps] : null,
    () => fetchJupiterQuote(amountUsdc, slippageBps),
    { refreshInterval: 15_000, revalidateOnFocus: false }
  )
  return { data, error, isLoading }
}
