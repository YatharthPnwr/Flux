import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => {
  if (!r.ok) throw new Error('Failed to fetch Wise rate')
  return r.json()
})

export function useWiseRate() {
  const { data, error, isLoading } = useSWR<{ rate: number; timestamp: number }>(
    '/api/wise-rate',
    fetcher,
    { refreshInterval: 60_000, revalidateOnFocus: false }
  )
  return {
    wiseRate: data?.rate ?? null,
    timestamp: data?.timestamp ?? null,
    error,
    isLoading,
  }
}
