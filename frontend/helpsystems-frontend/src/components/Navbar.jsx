import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import styles from './Navbar.module.css'

const links = [
  { to: '/',         label: 'Home' },
  { to: '/submit',   label: 'Get Help' },
  { to: '/track',    label: 'Track Request' },
  { to: '/resources',label: 'Resources' },
  { to: '/admin',    label: 'Admin' },
]

export default function Navbar() {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        {/* Logo */}
        <Link to="/" className={styles.logo}>
          <span className={styles.logoMark}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 21.7C5.4 17.5 2 13.2 2 9a7 7 0 0 1 10-6.3A7 7 0 0 1 22 9c0 4.2-3.4 8.5-10 12.7z"/>
            </svg>
          </span>
          <span className={styles.logoText}>SafeReach</span>
        </Link>

        {/* Desktop links */}
        <ul className={styles.links}>
          {links.map(l => (
            <li key={l.to}>
              <Link to={l.to} className={`${styles.link} ${pathname === l.to ? styles.active : ''}`}>
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <Link to="/submit" className={styles.cta}>Get Help Now</Link>

        {/* Hamburger */}
        <button className={styles.hamburger} onClick={() => setOpen(o => !o)} aria-label="Menu">
          <span /><span /><span />
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className={styles.mobile}>
          {links.map(l => (
            <Link key={l.to} to={l.to} className={`${styles.mobileLink} ${pathname === l.to ? styles.active : ''}`}
              onClick={() => setOpen(false)}>
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
