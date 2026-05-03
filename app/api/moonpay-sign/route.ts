import crypto from 'crypto'

export async function POST(request: Request) {
  const { queryString } = await request.json()

  if (!queryString || typeof queryString !== 'string') {
    return Response.json({ error: 'queryString required' }, { status: 400 })
  }

  const sig = crypto
    .createHmac('sha256', process.env.MOONPAY_SK!)
    .update(queryString)
    .digest('base64')

  return Response.json({ signature: sig })
}
