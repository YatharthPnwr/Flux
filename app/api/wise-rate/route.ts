export const revalidate = 60

export async function GET() {
  const res = await fetch(
    'https://api.frankfurter.dev/v1/latest?from=USD&to=EUR',
    { next: { revalidate: 60 } }
  )

  if (!res.ok) {
    return Response.json({ error: 'Failed to fetch rate' }, { status: 502 })
  }

  const data = await res.json()
  const rate: number = data?.rates?.EUR

  if (!rate) {
    return Response.json({ error: 'Rate not found in response' }, { status: 502 })
  }

  return Response.json({ rate, timestamp: Date.now() })
}
