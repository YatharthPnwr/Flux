import { Connection, VersionedTransaction } from '@solana/web3.js'

export async function executeSwap(
  connection: Connection,
  swapTransaction: string,
  lastValidBlockHeight: number,
  signTransaction: (tx: VersionedTransaction) => Promise<VersionedTransaction>
): Promise<string> {
  const txBuf = Buffer.from(swapTransaction, 'base64')
  const tx = VersionedTransaction.deserialize(txBuf)

  const sim = await connection.simulateTransaction(tx, { replaceRecentBlockhash: true })
  if (sim.value.err) {
    const logs = sim.value.logs?.join('\n') ?? ''
    throw new Error(`Simulation failed: ${JSON.stringify(sim.value.err)}\n${logs}`)
  }

  const signed = await signTransaction(tx)
  const serialized = signed.serialize()

  // Retry send up to 3x if block height expires
  for (let attempt = 0; attempt < 3; attempt++) {
    const sig = await connection.sendRawTransaction(serialized, { skipPreflight: true })
    const { blockhash } = await connection.getLatestBlockhash('confirmed')
    try {
      await connection.confirmTransaction(
        { signature: sig, lastValidBlockHeight, blockhash },
        'confirmed'
      )
      return sig
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : ''
      if (attempt < 2 && msg.includes('block height exceeded')) continue
      throw e
    }
  }
  throw new Error('Transaction failed after 3 attempts')
}
