# ⚡ Flux — Cross-Border Remittance on Solana

> Send USD to any EUR bank account cheaper and faster than Wise, powered by on-chain swaps.

**[Live Demo →](https://flux-app.vercel.app)** | Built for **Frontier Hackathon · Solana Track**

---

## What is Flux?

Flux is a cross-border remittance app that lets anyone send USD to a European bank account using Solana. Instead of routing through correspondent banks (like Wise or SWIFT), Flux:

1. **Swaps USDC → EURC** on-chain via [Jupiter](https://jup.ag) at the best available DEX rate
2. **Off-ramps to EUR** via [MoonPay](https://moonpay.com)'s SEPA bank transfer — landing in the recipient's bank account in 1–2 business days

The result: **~0.24% lower fees** than Wise on average, with every transaction verifiable on Solana Explorer.

---

## The Problem

Traditional remittance services (Wise, Western Union, SWIFT) charge 0.3–2% in fees and take 1–5 days. They're opaque black boxes.

Flux brings remittances on-chain: transparent rates, instant swaps, and a full audit trail — while keeping the off-ramp UX familiar (just an IBAN).

---

## How It Works

```
User (USDC) ──► Jupiter DEX ──► EURC (Solana) ──► MoonPay ──► SEPA ──► EUR Bank
               best on-chain rate    ~2s swap        off-ramp     1–2 days
```

| Step | Description |
|------|-------------|
| 1. Connect Wallet | Phantom or Solflare with USDC on Solana mainnet |
| 2. Enter Recipient | Recipient's full name + IBAN (SEPA-compatible) |
| 3. Review & Sign | Live Jupiter quote, slippage tolerance, fee breakdown |
| 4. Off-ramp | MoonPay converts EURC → EUR and sends SEPA transfer |

**No wallet?** Hit **"⚡ Try Demo"** on the homepage — full flow, no real funds.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, TypeScript |
| Blockchain | Solana (mainnet), `@solana/web3.js` |
| Swap | [Jupiter Swap API v1](https://dev.jup.ag/docs/apis/swap-api) |
| Off-ramp | [MoonPay Sell Widget](https://dev.moonpay.com/docs/sell-widget) |
| FX Rate | [Frankfurter.dev](https://frankfurter.dev) (ECB rates) |
| Wallets | Phantom, Solflare via Wallet Adapter |
| Data fetching | SWR (15s quote refresh) |
| Styling | Vanilla CSS, Inter font |

---

## Local Setup

### Prerequisites
- Node.js 20+ or Bun
- A Solana wallet with USDC (or use Demo Mode)
- MoonPay sandbox account (for off-ramp testing)
- Helius RPC key (free tier works)

### 1. Clone & install
```bash
git clone https://github.com/YatharthPnwr/flux
cd flux
bun install
```

### 2. Configure env vars
```bash
cp .env.example .env.local
# Fill in your keys — see .env.example for descriptions
```

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_HELIUS_RPC` | Yes | Helius RPC URL (get free key at helius.dev) |
| `NEXT_PUBLIC_MOONPAY_PK` | Yes | MoonPay public key |
| `MOONPAY_SK` | Yes | MoonPay secret key (server-side signing) |
| `NEXT_PUBLIC_MOONPAY_ENV` | Yes | `sandbox` or `production` |
| `NEXT_PUBLIC_JUPITER_API_KEY` | No | Jupiter API key (higher rate limits) |

### 3. Run
```bash
bun dev
# Open http://localhost:3000
```

---

## Architecture Notes

- **Quote refresh**: Jupiter quotes refresh every 15s via SWR. The wizard locks the rate at review time.
- **Slippage**: Default 0.3%, configurable via the ⚙️ settings in the wizard. Passed directly to Jupiter's `slippageBps` param.
- **MoonPay signing**: The `/api/moonpay-sign` route HMAC-signs the MoonPay URL server-side using `MOONPAY_SK` — the secret never touches the client.
- **Transaction retry**: `executeSwap` retries submission up to 3x if block height expires before confirmation.
- **Demo Mode**: Skips wallet/balance checks, simulates a 2.2s signing delay, links to a real historical USDC→EURC mainnet tx.

---

## Team

Built by **Yatharth Pnwr** for the **Frontier Hackathon · Solana Track · 2026**

---

## License

MIT
