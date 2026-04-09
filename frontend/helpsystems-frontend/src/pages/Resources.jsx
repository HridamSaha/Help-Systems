import { useState, useEffect } from 'react'
import { getResources } from '../api'
import styles from './Resources.module.css'

const ISSUE_TYPES = [
  { key: 'Harassment',     icon: '⚠️', color: '#e8536a', bg: '#fde8ec' },
  { key: 'Domestic Abuse', icon: '🏠', color: '#9b6b7e', bg: '#f5eaf0' },
  { key: 'Child Safety',   icon: '👶', color: '#4a90d9', bg: '#e8f1fb' },
  { key: 'Unsafe Area',    icon: '📍', color: '#f5a623', bg: '#fef5e4' },
  { key: 'Mental Health',  icon: '🧠', color: '#2ebc8a', bg: '#e4f9f3' },
  { key: 'Legal Help',     icon: '⚖️', color: '#7c5cbf', bg: '#f0ecfb' },
]

const FALLBACK_RESOURCES = {
  'Harassment':     [
    { name: 'National Women Helpline', type: 'Helpline', phone: '181', description: '24/7 helpline for women in distress' },
    { name: 'Women Police Station',    type: 'Authority', phone: '100',  description: 'File FIR or get police assistance' },
  ],
  'Domestic Abuse': [
    { name: 'iCall Counselling',       type: 'NGO',      phone: '9152987821', description: 'Free psychological counselling support' },
    { name: 'SNEHI Foundation',        type: 'NGO',      phone: '044-24640050', description: 'Mental health and abuse support' },
  ],
  'Child Safety':   [
    { name: 'Childline India',         type: 'Helpline', phone: '1098',  description: '24/7 emergency helpline for children' },
    { name: 'CWC — Child Welfare Committee', type: 'Authority', phone: '044-28410750', description: 'Statutory body for child protection' },
  ],
  'Unsafe Area':    [
    { name: 'Police Control Room',     type: 'Authority', phone: '100',  description: 'Immediate police response' },
    { name: 'Vanitha Helpline',        type: 'Helpline',  phone: '1091', description: 'Women safety helpline' },
  ],
  'Mental Health':  [
    { name: 'Vandrevala Foundation',   type: 'Helpline',  phone: '1860-2662-345', description: 'Free 24/7 mental health helpline' },
    { name: 'NIMHANS',                 type: 'Authority', phone: '080-46110007',  description: 'National mental health institute' },
  ],
  'Legal Help':     [
    { name: 'National Legal Services', type: 'Authority', phone: '15100', description: 'Free legal aid and advice' },
    { name: 'Tamil Nadu SLSA',         type: 'Authority', phone: '044-25361144', description: 'State legal services authority' },
  ],
}

const typeColors = {
  Helpline:  { bg: '#e4f9f3', color: '#2ebc8a' },
  NGO:       { bg: '#e8f1fb', color: '#4a90d9' },
  Authority: { bg: '#f0ecfb', color: '#7c5cbf' },
}

export default function Resources() {
  const [selected, setSelected] = useState(ISSUE_TYPES[0].key)
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    getResources(selected)
      .then(setResources)
      .catch(() => setResources(FALLBACK_RESOURCES[selected] || []))
      .finally(() => setLoading(false))
  }, [selected])

  const active = ISSUE_TYPES.find(i => i.key === selected)

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <span className={styles.badge}>Help Directory</span>
          <h1 className={styles.title}>Resources & Support</h1>
          <p className={styles.sub}>
            Find NGOs, helplines, and authorities matched to your situation.
            Select an issue type to see relevant resources.
          </p>
        </div>

        {/* Issue selector */}
        <div className={styles.issueBar}>
          {ISSUE_TYPES.map(it => (
            <button key={it.key}
              className={`${styles.issueBtn} ${selected === it.key ? styles.issueBtnActive : ''}`}
              style={selected === it.key ? { '--ic': it.color, '--ib': it.bg } : {}}
              onClick={() => setSelected(it.key)}>
              <span>{it.icon}</span> {it.key}
            </button>
          ))}
        </div>

        {/* Emergency banner */}
        <div className={styles.emergencyBanner}>
          <span>🚨</span>
          <div>
            <strong>In immediate danger?</strong>
            <span> Call <a href="tel:112">112</a> (Emergency) · <a href="tel:1091">1091</a> (Women) · <a href="tel:1098">1098</a> (Child)</span>
          </div>
        </div>

        {/* Resources grid */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <span style={{ color: active?.color }}>{active?.icon}</span> {selected} Resources
          </h2>

          {loading ? (
            <div className={styles.loadingRow}>
              {[1,2,3].map(i => <div key={i} className={styles.skeleton} />)}
            </div>
          ) : (
            <div className={styles.resourceGrid}>
              {resources.length === 0 ? (
                <p className={styles.empty}>No resources found for this category yet.</p>
              ) : resources.map((r, i) => {
                const tc = typeColors[r.type] || typeColors.NGO
                return (
                  <div key={i} className={`card ${styles.resourceCard} fade-up`}
                    style={{ animationDelay: `${i * 0.07}s` }}>
                    <div className={styles.cardTop}>
                      <div>
                        <span className={styles.badge2}
                          style={{ background: tc.bg, color: tc.color }}>
                          {r.type}
                        </span>
                        <h3 className={styles.resourceName}>{r.name}</h3>
                      </div>
                    </div>
                    {r.description && (
                      <p className={styles.resourceDesc}>{r.description}</p>
                    )}
                    {r.phone && (
                      <a href={`tel:${r.phone}`} className={styles.callBtn}>
                        📞 {r.phone}
                      </a>
                    )}
                    {r.address && (
                      <p className={styles.address}>📍 {r.address}</p>
                    )}
                    {r.hours && (
                      <p className={styles.hours}>🕐 {r.hours}</p>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* All helplines quick ref */}
        <div className={styles.quickRef}>
          <h3 className={styles.quickTitle}>📞 Quick Reference — Emergency Numbers</h3>
          <div className={styles.quickGrid}>
            {[
              ['112',  'Emergency (Police, Fire, Ambulance)'],
              ['1091', 'Women Helpline'],
              ['1098', 'Child Helpline (Childline)'],
              ['181',  'Women in Distress'],
              ['1800-599-0019', 'iCall Mental Health'],
              ['15100','National Legal Aid'],
            ].map(([num, label]) => (
              <a key={num} href={`tel:${num}`} className={styles.quickItem}>
                <code className={styles.quickNum}>{num}</code>
                <span className={styles.quickLabel}>{label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
