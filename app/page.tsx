'use client'
import { useRef } from 'react'
import { WalletButton } from '@/components/WalletButton'
import { SendWizard } from '@/components/SendWizard'
import { RateComparison } from '@/components/RateComparison'

export default function Home() {
  const appRef = useRef<HTMLElement>(null)

  function scrollToApp() {
    appRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      {/* ── Navbar ── */}
      <nav className="navbar">
        <span className="logo">⚡ Flux</span>
        <WalletButton />
      </nav>

      {/* ── Hero ── */}
      <section className="hero" aria-label="Hero">
        <div className="hero-bg" aria-hidden />
        <div className="hero-content">
          <div className="hero-badge">Powered by Jupiter + Solana</div>
          <h1 className="hero-title">
            Send USD to Europe.<br />
            <span className="hero-accent">Beat Wise by 0.24%.</span>
          </h1>
          <p className="hero-sub">
            On-chain USDC → EURC swap via Jupiter, then straight to your EUR bank account.
            Transparent fees. Verifiable on Solana Explorer.
          </p>

          {/* Live teaser */}
          <div className="hero-teaser" aria-label="Live rate preview">
            <div className="teaser-label">Right now · $500 →</div>
            <RateComparison amountUsdc={500} />
          </div>

          <button id="hero-cta" className="btn-primary hero-cta" onClick={scrollToApp}>
            Send Money Now
          </button>
        </div>

        {/* Decorative orbs */}
        <div className="orb orb-1" aria-hidden />
        <div className="orb orb-2" aria-hidden />
      </section>

      {/* ── How it works ── */}
      <section className="how" aria-label="How it works">
        <h2 className="section-title">How it works</h2>
        <div className="how-steps">
          {[
            { n: '01', title: 'Connect Wallet', desc: 'Link your Phantom or Solflare wallet holding USDC.' },
            { n: '02', title: 'Swap on-chain', desc: 'Jupiter routes your USDC → EURC at the best on-chain rate.' },
            { n: '03', title: 'Bank transfer', desc: 'MoonPay off-ramps your EURC to your EUR bank via SEPA.' },
          ].map(s => (
            <div key={s.n} className="how-step">
              <span className="how-num">{s.n}</span>
              <h3 className="how-title">{s.title}</h3>
              <p className="how-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── App (wizard) ── */}
      <section className="app-section" ref={appRef} id="app" aria-label="Send money">
        <h2 className="section-title">Start your transfer</h2>
        <SendWizard />
      </section>

      {/* ── Footer ── */}
      <footer className="footer">
        <span>⚡ Flux · Built on Solana</span>
        <span className="footer-links">
          <a href="https://jup.ag" target="_blank" rel="noopener">Jupiter</a>
          <a href="https://moonpay.com" target="_blank" rel="noopener">MoonPay</a>
          <a href="https://github.com/YatharthPnwr/flux" target="_blank" rel="noopener">GitHub</a>
        </span>
      </footer>
    </>
  )
}
