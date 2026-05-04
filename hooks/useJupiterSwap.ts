export interface SwapResult {
  swapTransaction: string
  lastValidBlockHeight: number
}

export async function fetchJupiterSwap(
  quoteResponse: unknown,
  userPublicKey: string
): Promise<SwapResult> {
  const apiKey = process.env.NEXT_PUBLIC_JUPITER_API_KEY
  const headers: HeadersInit = { 'Content-Type': 'application/json' }
  if (apiKey) headers['x-api-key'] = apiKey

  const resp = await fetch('https://api.jup.ag/swap/v1/swap', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      quoteResponse,
      userPublicKey,
      dynamicComputeUnitLimit: true,
      prioritizationFeeLamports: {
        priorityLevelWithMaxLamports: { priorityLevel: 'veryHigh', maxLamports: 1_000_000 },
      },
    }),
  })

  if (!resp.ok) throw new Error(`Jupiter swap API failed: ${resp.status}`)
  const data = await resp.json()
  if (data.error) throw new Error(data.error)

  return { swapTransaction: data.swapTransaction, lastValidBlockHeight: data.lastValidBlockHeight }
}
