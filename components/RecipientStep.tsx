'use client'
import { useState } from 'react'

export interface RecipientDetails {
  fullName: string
  iban: string
  bic: string
}

interface Props {
  onNext: (details: RecipientDetails) => void
  onBack: () => void
}

function validateIban(raw: string): boolean {
  const s = raw.replace(/\s/g, '').toUpperCase()
  return s.length >= 15 && s.length <= 34 && /^[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}$/.test(s)
}

export function RecipientStep({ onNext, onBack }: Props) {
  const [fullName, setFullName] = useState('')
  const [iban, setIban] = useState('')
  const [bic, setBic] = useState('')
  const [touched, setTouched] = useState({ name: false, iban: false })

  const nameOk = fullName.trim().length >= 2
  const ibanOk = validateIban(iban)
  const canNext = nameOk && ibanOk

  function handleNext() {
    setTouched({ name: true, iban: true })
    if (!canNext) return
    onNext({ fullName: fullName.trim(), iban: iban.replace(/\s/g, '').toUpperCase(), bic: bic.trim() })
  }

  return (
    <div className="wizard-panel">
      <h2 className="wizard-title">Where are you sending to?</h2>

      <div className="form-field">
        <label className="form-label" htmlFor="input-recipient-name">Recipient full name</label>
        <input
          id="input-recipient-name"
          className={`form-input${touched.name && !nameOk ? ' form-input-error' : ''}`}
          type="text"
          placeholder="Jane Doe"
          value={fullName}
          onChange={e => setFullName(e.target.value)}
          onBlur={() => setTouched(t => ({ ...t, name: true }))}
          autoComplete="name"
        />
        {touched.name && !nameOk && (
          <span className="form-hint form-hint-error">Enter the full name on the bank account</span>
        )}
      </div>

      <div className="form-field">
        <label className="form-label" htmlFor="input-iban">IBAN</label>
        <input
          id="input-iban"
          className={`form-input${touched.iban && iban && !ibanOk ? ' form-input-error' : ibanOk ? ' form-input-ok' : ''}`}
          type="text"
          placeholder="DE89 3704 0044 0532 0130 00"
          value={iban}
          onChange={e => setIban(e.target.value)}
          onBlur={() => setTouched(t => ({ ...t, iban: true }))}
          autoComplete="off"
          spellCheck={false}
        />
        {touched.iban && iban && !ibanOk && <span className="form-hint form-hint-error">Enter a valid IBAN</span>}
        {ibanOk && <span className="form-hint form-hint-ok">✓ Valid IBAN format</span>}
        {!iban && <span className="form-hint">SEPA-compatible European bank accounts</span>}
      </div>

      <div className="form-field">
        <label className="form-label" htmlFor="input-bic">
          BIC / SWIFT <span className="form-optional">(optional)</span>
        </label>
        <input
          id="input-bic"
          className="form-input"
          type="text"
          placeholder="COBADEFFXXX"
          value={bic}
          onChange={e => setBic(e.target.value.toUpperCase())}
          autoComplete="off"
          spellCheck={false}
        />
      </div>

      <div className="wizard-actions">
        <button id="btn-recipient-back" className="btn-secondary" onClick={onBack}>Back</button>
        <button id="btn-recipient-next" className="btn-primary" onClick={handleNext}>Continue →</button>
      </div>
    </div>
  )
}
