import { Connection, VersionedTransaction } from '@solana/web3.js'

export async function executeSwap(
  connection: Connection,
  swapTransaction: string,
  lastValidBlockHeight: number,
  signTransaction: (tx: VersionedTransaction) => Promise<VersionedTransaction>
): Promise<string> {
  // 1. Deserialize
  const txBuf = Buffer.from(swapTransaction, 'base64')
  const tx = VersionedTransaction.deserialize(txBuf)

  // 2. Simulate
  const sim = await connection.simulateTransaction(tx, { replaceRecentBlockhash: true })
  if (sim.value.err) {
    const logs = sim.value.logs?.join('\n') ?? ''
    throw new Error(`Simulation failed: ${JSON.stringify(sim.value.err)}\n${logs}`)
  }

  // 3. Sign (opens wallet popup)
  const signed = await signTransaction(tx)

  // 4. Send + confirm with lastValidBlockHeight
  const sig = await connection.sendRawTransaction(signed.serialize(), { skipPreflight: true })
  await connection.confirmTransaction(
    { signature: sig, lastValidBlockHeight, blockhash: tx.message.recentBlockhash },
    'confirmed'
  )
  return sig
}
