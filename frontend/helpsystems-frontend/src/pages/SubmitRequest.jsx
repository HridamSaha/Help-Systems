import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { submitHelpRequest } from '../api'
import { useToast } from '../components/ToastProvider'
import styles from './SubmitRequest.module.css'

const ISSUE_TYPES = [
  'Harassment', 'Domestic Abuse', 'Child Safety',
  'Unsafe Area', 'Mental Health', 'Legal Help', 'Other'
]

const AREAS = [
  'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli',
  'Salem', 'Erode', 'Vellore', 'Tirunelveli', 'Other'
]

const URGENCY_KEYWORDS = ['emergency', 'danger', 'help', 'hurt', 'violence', 'attack', 'afraid', 'scared', 'abuse']

function detectUrgency(text) {
  if (!text) return null
  const lower = text.toLowerCase()
  const hits = URGENCY_KEYWORDS.filter(k => lower.includes(k))
  if (hits.length >= 2) return 'high'
  if (hits.length === 1) return 'medium'
  return 'low'
}

export default function SubmitRequest() {
  const [params] = useSearchParams()
  const toast = useToast()

  const [form, setForm] = useState({
    issueType: params.get('issue') || '',
    area: '',
    description: '',
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [urgency, setUrgency] = useState(null)
  const [charCount, setCharCount] = useState(0)

  useEffect(() => {
    setUrgency(detectUrgency(form.description))
    setCharCount(form.description.length)
  }, [form.description])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.issueType || !form.area || !form.description.trim()) {
      toast('Please fill all required fields.', 'error')
      return
    }
    setLoading(true)
    try {
      const data = await submitHelpRequest({ ...form, urgencyLevel: urgency })
      setResult(data)
      toast('Request submitted successfully!', 'success')
    } catch (err) {
      toast('Failed to submit. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => { setResult(null); setForm({ issueType: '', area: '', description: '' }) }

  const urgencyMeta = {
    high:   { label: 'High Urgency', color: '#e8536a', bg: '#fde8ec', icon: '🚨' },
    medium: { label: 'Medium Urgency', color: '#f5a623', bg: '#fef5e4', icon: '⚠️' },
    low:    { label: 'Low Urgency', color: '#2ebc8a', bg: '#e4f9f3', icon: '✅' },
  }

  if (result) {
    return (
      <div className={styles.page}>
        <div className={styles.successWrap}>
          <div className={styles.successIcon}>🎉</div>
          <h1 className={styles.successTitle}>Request Submitted!</h1>
          <p className={styles.successSub}>
            Your request has been received anonymously. Save your Request ID to track progress.
          </p>

          <div className={styles.idBox}>
            <span className={styles.idLabel}>Your Request ID</span>
            <code className={styles.idCode}>{result.requestId || 'SR-2024-0001'}</code>
            <button
              className={styles.copyBtn}
              onClick={() => {
                navigator.clipboard.writeText(result.requestId || 'SR-2024-0001')
                toast('Copied to clipboard!', 'success')
              }}>
              📋 Copy
            </button>
          </div>

          <div className={styles.resultMeta}>
            <div className={styles.metaRow}><span>Issue Type</span><strong>{result.issueType || form.issueType}</strong></div>
            <div className={styles.metaRow}><span>Area</span><strong>{result.area || form.area}</strong></div>
            <div className={styles.metaRow}><span>Status</span><span className="badge badge-submitted">Submitted</span></div>
          </div>

          <p className={styles.warningNote}>
            ⚠️ Please save this ID. We do not store any personal information — this is your only link to your request.
          </p>

          <div className={styles.successActions}>
            <a href="/track" className={styles.trackBtn}>Track This Request →</a>
            <button onClick={reset} className={styles.newBtn}>Submit Another</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Left info panel */}
        <div className={styles.infoPanel}>
          <span className={styles.badge}>100% Anonymous</span>
          <h1 className={styles.title}>We're here<br /><em>to help you.</em></h1>
          <p className={styles.sub}>
            Fill out the form to submit a confidential help request. No name, no email, no login — just your situation.
          </p>

          <div className={styles.guarantees}>
            {[
              ['🔒', 'No login required', 'Your identity is never stored or shared'],
              ['🆔', 'Unique Request ID', 'Use this to track your request anytime'],
              ['⚡', 'Immediate resources', 'Matched to NGOs and helplines in your area'],
            ].map(([icon, title, desc]) => (
              <div key={title} className={styles.guarantee}>
                <span className={styles.guaranteeIcon}>{icon}</span>
                <div>
                  <p className={styles.guaranteeTitle}>{title}</p>
                  <p className={styles.guaranteeDesc}>{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.emergency}>
            <p>🚨 <strong>Emergency?</strong></p>
            <p>Call <strong>112</strong> immediately or Women's Helpline: <strong>1091</strong></p>
          </div>
        </div>

        {/* Form */}
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <h2 className={styles.formTitle}>Submit Anonymous Request</h2>
          <p className={styles.formNote}>All fields are required. This form submits anonymously.</p>

          {/* Issue Type */}
          <div className={styles.field}>
            <label className={styles.label}>Issue Type *</label>
            <div className={styles.issueGrid}>
              {ISSUE_TYPES.map(t => (
                <button key={t} type="button"
                  className={`${styles.issueBtn} ${form.issueType === t ? styles.issueBtnActive : ''}`}
                  onClick={() => set('issueType', t)}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Area */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="area">Area / District *</label>
            <select id="area" className={styles.select} value={form.area}
              onChange={e => set('area', e.target.value)}>
              <option value="">Select your area</option>
              {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          {/* Description */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="desc">
              Describe your situation *
              <span className={styles.charCount}>{charCount}/1000</span>
            </label>
            <textarea id="desc" className={styles.textarea}
              placeholder="Describe what's happening in as much or as little detail as you're comfortable sharing. You can also use your regional language."
              rows={6} maxLength={1000}
              value={form.description}
              onChange={e => set('description', e.target.value)} />
          </div>

          {/* AI Urgency indicator */}
          {form.description.length > 10 && urgency && (() => {
            const m = urgencyMeta[urgency]
            return (
              <div className={styles.urgencyBadge} style={{ background: m.bg, borderColor: m.color, color: m.color }}>
                {m.icon} <strong>AI Analysis:</strong> {m.label} detected
                {urgency === 'high' && ' — Your request will be flagged for immediate review.'}
              </div>
            )
          })()}

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? <span className="spinner" /> : '🔒 Submit Anonymously'}
          </button>

          <p className={styles.privacy}>
            By submitting, you confirm no personal identifying information is included. 
            We cannot trace this back to you.
          </p>
        </form>
      </div>
    </div>
  )
}
