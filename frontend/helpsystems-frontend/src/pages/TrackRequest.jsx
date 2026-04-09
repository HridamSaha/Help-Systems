import { useState } from 'react'
import { trackHelpRequest } from '../api'
import { useToast } from '../components/ToastProvider'
import styles from './TrackRequest.module.css'

const STATUS_STEPS = ['Submitted', 'Viewed', 'In Review', 'Action Taken']

function getStepIndex(status) {
  const map = {
    'SUBMITTED': 0, 'Submitted': 0,
    'VIEWED': 1, 'Viewed': 1,
    'IN_REVIEW': 2, 'In Review': 2,
    'ACTION_TAKEN': 3, 'Action Taken': 3,
  }
  return map[status] ?? 0
}

export default function TrackRequest() {
  const toast = useToast()
  const [requestId, setRequestId] = useState('')
  const [loading, setLoading]     = useState(false)
  const [request, setRequest]     = useState(null)
  const [notFound, setNotFound]   = useState(false)

  const handleTrack = async () => {
    if (!requestId.trim()) { toast('Enter a Request ID', 'error'); return }
    setLoading(true); setNotFound(false); setRequest(null)
    try {
      const data = await trackHelpRequest(requestId.trim())
      setRequest(data)
    } catch {
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }

  const stepIdx = request ? getStepIndex(request.status) : -1

  const statusColors = {
    'SUBMITTED': 'badge-submitted', 'Submitted': 'badge-submitted',
    'VIEWED': 'badge-viewed', 'Viewed': 'badge-viewed',
    'IN_REVIEW': 'badge-pending', 'In Review': 'badge-pending',
    'ACTION_TAKEN': 'badge-actioned', 'Action Taken': 'badge-actioned',
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.badge}>Track Anonymously</span>
          <h1 className={styles.title}>Track your request</h1>
          <p className={styles.sub}>
            Enter the unique Request ID you received after submitting your help request.
            No login required.
          </p>
        </div>

        {/* Search */}
        <div className={styles.searchCard}>
          <label className={styles.label} htmlFor="rid">Request ID</label>
          <div className={styles.searchRow}>
            <input id="rid" className={styles.input}
              placeholder="e.g. SR-2024-9841"
              value={requestId}
              onChange={e => setRequestId(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleTrack()} />
            <button className={styles.searchBtn} onClick={handleTrack} disabled={loading}>
              {loading ? <span className="spinner" /> : '🔍 Track'}
            </button>
          </div>
          <p className={styles.hint}>Your ID was shown immediately after submitting your request.</p>
        </div>

        {/* Not found */}
        {notFound && (
          <div className={styles.notFound}>
            <span>😔</span>
            <div>
              <p><strong>Request not found</strong></p>
              <p>Double-check your Request ID and try again. IDs are case-sensitive.</p>
            </div>
          </div>
        )}

        {/* Result */}
        {request && (
          <div className={`${styles.resultCard} fade-up`}>
            {/* Header */}
            <div className={styles.resultHeader}>
              <div>
                <p className={styles.resultIdLabel}>Request ID</p>
                <code className={styles.resultId}>{request.requestId}</code>
              </div>
              <span className={`badge ${statusColors[request.status] || 'badge-submitted'}`}>
                {request.status}
              </span>
            </div>

            {/* Progress stepper */}
            <div className={styles.stepper}>
              {STATUS_STEPS.map((step, i) => (
                <div key={step} className={styles.stepperItem}>
                  <div className={`${styles.stepperDot} ${i <= stepIdx ? styles.stepperDotActive : ''} ${i === stepIdx ? styles.stepperDotCurrent : ''}`}>
                    {i < stepIdx ? '✓' : i + 1}
                  </div>
                  <p className={`${styles.stepperLabel} ${i <= stepIdx ? styles.stepperLabelActive : ''}`}>{step}</p>
                  {i < STATUS_STEPS.length - 1 && (
                    <div className={`${styles.stepperLine} ${i < stepIdx ? styles.stepperLineActive : ''}`} />
                  )}
                </div>
              ))}
            </div>

            {/* Details */}
            <div className={styles.details}>
              {[
                ['Issue Type',   request.issueType],
                ['Area',         request.area],
                ['Submitted On', request.createdAt ? new Date(request.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' }) : 'N/A'],
                ['Assigned To',  request.authority || 'Pending assignment'],
              ].map(([k, v]) => (
                <div key={k} className={styles.detailRow}>
                  <span className={styles.detailKey}>{k}</span>
                  <span className={styles.detailVal}>{v}</span>
                </div>
              ))}
            </div>

            {/* Description */}
            {request.description && (
              <div className={styles.descBlock}>
                <p className={styles.descLabel}>Your report</p>
                <p className={styles.descText}>{request.description}</p>
              </div>
            )}

            <p className={styles.updateNote}>
              🔔 Status is updated by the assigned authority or NGO. Check back periodically.
            </p>
          </div>
        )}

        {/* Info box */}
        {!request && !notFound && (
          <div className={styles.infoBox}>
            <div className={styles.infoItem}>
              <span>📬</span>
              <div>
                <p><strong>Submitted</strong></p>
                <p>Your request has been logged in our system.</p>
              </div>
            </div>
            <div className={styles.infoItem}>
              <span>👁️</span>
              <div>
                <p><strong>Viewed</strong></p>
                <p>An authority or NGO has reviewed your request.</p>
              </div>
            </div>
            <div className={styles.infoItem}>
              <span>⚙️</span>
              <div>
                <p><strong>In Review</strong></p>
                <p>Your case is being evaluated for the best response.</p>
              </div>
            </div>
            <div className={styles.infoItem}>
              <span>✅</span>
              <div>
                <p><strong>Action Taken</strong></p>
                <p>The assigned body has taken action on your request.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
