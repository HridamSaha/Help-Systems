import { Link } from 'react-router-dom'
import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <span className={styles.logoText}>SafeReach</span>
          <p>An anonymous help & resource mapping system for women and children. You are not alone.</p>
        </div>
        <div className={styles.col}>
          <h4>Quick Links</h4>
          <Link to="/submit">Get Help</Link>
          <Link to="/track">Track Request</Link>
          <Link to="/resources">Resources</Link>
        </div>
        <div className={styles.col}>
          <h4>Emergency</h4>
          <a href="tel:112">112 — Emergency</a>
          <a href="tel:1091">1091 — Women Helpline</a>
          <a href="tel:1098">1098 — Child Helpline</a>
        </div>
        <div className={styles.col}>
          <h4>Promise</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--muted)', lineHeight: '1.6' }}>
            No login. No tracking.<br />Complete anonymity guaranteed.
          </p>
        </div>
      </div>
      <div className={styles.bottom}>
        <p>© {new Date().getFullYear()} SafeReach — All data is anonymous and secure.</p>
      </div>
    </footer>
  )
}
