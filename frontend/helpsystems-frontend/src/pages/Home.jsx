import { Link } from 'react-router-dom'
import styles from './Home.module.css'

const features = [
  {
    icon: '🔒',
    title: 'Completely Anonymous',
    desc: 'No login, no personal details required. Submit your request with full privacy.',
  },
  {
    icon: '🗺️',
    title: 'Resource Mapping',
    desc: 'Instantly see NGOs, helplines, and authorities matched to your issue type.',
  },
  {
    icon: '📋',
    title: 'Track Your Request',
    desc: 'Use your unique request ID to track status — no account needed.',
  },
  {
    icon: '🤖',
    title: 'AI Urgency Analysis',
    desc: 'AI analyses your request to flag high-priority cases for immediate attention.',
  },
  {
    icon: '🌐',
    title: 'Multilingual Support',
    desc: 'Submit in your regional language or via voice — we understand you.',
  },
  {
    icon: '📍',
    title: 'Geo-Fenced Assignment',
    desc: 'Requests are auto-assigned to local authorities within your area.',
  },
]

const issues = [
  { label: 'Harassment',     color: '#e8536a', bg: '#fde8ec' },
  { label: 'Domestic Abuse', color: '#9b6b7e', bg: '#f5eaf0' },
  { label: 'Child Safety',   color: '#4a90d9', bg: '#e8f1fb' },
  { label: 'Unsafe Area',    color: '#f5a623', bg: '#fef5e4' },
  { label: 'Mental Health',  color: '#2ebc8a', bg: '#e4f9f3' },
  { label: 'Legal Help',     color: '#7c5cbf', bg: '#f0ecfb' },
]

const steps = [
  { n: '01', title: 'Choose your issue', desc: 'Select the type of help you need — no details required yet.' },
  { n: '02', title: 'Submit anonymously', desc: 'Describe your situation. We generate a unique request ID for you.' },
  { n: '03', title: 'Get matched', desc: 'Relevant resources and authorities are shown instantly.' },
  { n: '04', title: 'Track progress', desc: 'Use your ID to see when action is taken — stay informed.' },
]

export default function Home() {
  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroDecor1} />
        <div className={styles.heroDecor2} />
        <div className={styles.heroContent}>
          <span className={styles.badge}>Safe · Anonymous · Free</span>
          <h1 className={styles.heroTitle}>
            You deserve help.<br />
            <em>We make it easy.</em>
          </h1>
          <p className={styles.heroSub}>
            A secure, web-based platform connecting women and children to the right support — 
            NGOs, helplines, and authorities — without revealing your identity.
          </p>
          <div className={styles.heroActions}>
            <Link to="/submit" className={styles.btnPrimary}>Get Help Now →</Link>
            <Link to="/track"  className={styles.btnSecondary}>Track a Request</Link>
          </div>
          <p className={styles.heroNote}>
            🔒 No login required · No personal data stored · 100% anonymous
          </p>
        </div>

        {/* Floating card */}
        <div className={styles.heroCard}>
          <div className={styles.heroCardHeader}>
            <span className={styles.dot} style={{ background: '#ff6b6b' }} />
            <span className={styles.dot} style={{ background: '#ffd93d' }} />
            <span className={styles.dot} style={{ background: '#6bcb77' }} />
            <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--muted)' }}>Request Submitted</span>
          </div>
          <div className={styles.heroCardBody}>
            <div className={styles.cardRow}>
              <span className={styles.cardLabel}>Request ID</span>
              <code className={styles.cardId}>SR-2024-9841</code>
            </div>
            <div className={styles.cardRow}>
              <span className={styles.cardLabel}>Issue Type</span>
              <span className={styles.cardValue}>Domestic Abuse</span>
            </div>
            <div className={styles.cardRow}>
              <span className={styles.cardLabel}>Status</span>
              <span className="badge badge-actioned">Action Taken</span>
            </div>
            <div className={styles.cardRow}>
              <span className={styles.cardLabel}>Assigned To</span>
              <span className={styles.cardValue}>Sakhi NGO, Chennai</span>
            </div>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: '100%' }} />
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--success)', textAlign: 'center', marginTop: '0.5rem' }}>
              ✓ A counsellor will contact via the registered channel
            </p>
          </div>
        </div>
      </section>

      {/* Issue types */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <p className={styles.label}>We help with</p>
          <h2 className={styles.sectionTitle}>What kind of help do you need?</h2>
          <div className={styles.issueGrid}>
            {issues.map(issue => (
              <Link to={`/submit?issue=${issue.label}`} key={issue.label}
                className={styles.issueCard}
                style={{ '--iss-color': issue.color, '--iss-bg': issue.bg }}>
                <span className={styles.issueLabel}>{issue.label}</span>
                <span className={styles.issueArrow}>→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className={styles.sectionAlt}>
        <div className={styles.sectionInner}>
          <p className={styles.label}>Simple & Safe</p>
          <h2 className={styles.sectionTitle}>How SafeReach works</h2>
          <div className={styles.stepsGrid}>
            {steps.map((s, i) => (
              <div key={i} className={styles.step} style={{ animationDelay: `${i * 0.1}s` }}>
                <span className={styles.stepNum}>{s.n}</span>
                <h3 className={styles.stepTitle}>{s.title}</h3>
                <p className={styles.stepDesc}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <p className={styles.label}>Platform Features</p>
          <h2 className={styles.sectionTitle}>Built for safety, designed for trust</h2>
          <div className={styles.featureGrid}>
            {features.map((f, i) => (
              <div key={i} className={`card ${styles.featureCard}`} style={{ animationDelay: `${i * 0.08}s` }}>
                <span className={styles.featureIcon}>{f.icon}</span>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className={styles.ctaBanner}>
        <div className={styles.sectionInner} style={{ textAlign: 'center' }}>
          <h2 style={{ color: 'white', fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.6rem, 3vw, 2.4rem)' }}>
            Ready to get help?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', marginTop: '0.75rem', fontSize: '1rem' }}>
            It only takes 2 minutes. No account. No judgment.
          </p>
          <Link to="/submit" className={styles.ctaBtn}>Start Here →</Link>
        </div>
      </section>
    </div>
  )
}
