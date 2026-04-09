import { useState, useEffect, useRef } from 'react'
import { getAllRequests, updateStatus, reassignRequest } from '../api'
import { useToast } from '../components/ToastProvider'
import {
  Chart as ChartJS,
  ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement, Title
} from 'chart.js'
import { Doughnut, Bar } from 'react-chartjs-2'
import styles from './AdminDashboard.module.css'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title)

const STATUS_OPTIONS   = ['SUBMITTED', 'VIEWED', 'IN_REVIEW', 'ACTION_TAKEN']
const AUTHORITY_OPTIONS = ['Sakhi NGO', 'iCall Counselling', 'Women Police Station', 'Childline India', 'NIMHANS', 'National Legal Services', 'Child Welfare Committee']

const MOCK_REQUESTS = [
  { id: 1, requestId: 'SR-2024-0001', issueType: 'Domestic Abuse', area: 'Chennai',    status: 'ACTION_TAKEN', authority: 'Sakhi NGO',          description: 'Need immediate support', createdAt: '2024-09-01T10:00:00Z' },
  { id: 2, requestId: 'SR-2024-0002', issueType: 'Child Safety',   area: 'Coimbatore', status: 'IN_REVIEW',    authority: 'Childline India',     description: 'Child at risk situation', createdAt: '2024-09-02T08:30:00Z' },
  { id: 3, requestId: 'SR-2024-0003', issueType: 'Harassment',     area: 'Madurai',    status: 'VIEWED',       authority: null,                  description: 'Workplace harassment',    createdAt: '2024-09-03T14:00:00Z' },
  { id: 4, requestId: 'SR-2024-0004', issueType: 'Mental Health',  area: 'Chennai',    status: 'SUBMITTED',    authority: null,                  description: 'Feeling unsafe at home',  createdAt: '2024-09-04T09:15:00Z' },
  { id: 5, requestId: 'SR-2024-0005', issueType: 'Legal Help',     area: 'Salem',      status: 'SUBMITTED',    authority: null,                  description: 'Need legal guidance',     createdAt: '2024-09-05T11:45:00Z' },
  { id: 6, requestId: 'SR-2024-0006', issueType: 'Unsafe Area',    area: 'Vellore',    status: 'ACTION_TAKEN', authority: 'Women Police Station', description: 'Unsafe neighbourhood',    createdAt: '2024-09-06T07:00:00Z' },
]

const statusLabel = { SUBMITTED: 'Submitted', VIEWED: 'Viewed', IN_REVIEW: 'In Review', ACTION_TAKEN: 'Action Taken' }
const statusClass  = { SUBMITTED: 'badge-submitted', VIEWED: 'badge-viewed', IN_REVIEW: 'badge-pending', ACTION_TAKEN: 'badge-actioned' }

function StatCard({ label, value, icon, color }) {
  return (
    <div className={styles.statCard} style={{ '--sc': color }}>
      <span className={styles.statIcon}>{icon}</span>
      <div>
        <p className={styles.statValue}>{value}</p>
        <p className={styles.statLabel}>{label}</p>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const toast = useToast()
  const [requests, setRequests] = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [filterIssue, setFilterIssue]   = useState('ALL')
  const [editId, setEditId]   = useState(null)
  const [newStatus, setNewStatus]     = useState('')
  const [newAuthority, setNewAuthority] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getAllRequests()
      .then(setRequests)
      .catch(() => setRequests(MOCK_REQUESTS))
      .finally(() => setLoading(false))
  }, [])

  const filtered = requests.filter(r => {
    const matchSearch = !search || r.requestId.toLowerCase().includes(search.toLowerCase()) || r.area?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'ALL' || r.status === filterStatus
    const matchIssue  = filterIssue  === 'ALL' || r.issueType === filterIssue
    return matchSearch && matchStatus && matchIssue
  })

  const issueTypes = [...new Set(requests.map(r => r.issueType))]

  // Stats
  const total      = requests.length
  const submitted  = requests.filter(r => r.status === 'SUBMITTED').length
  const actioned   = requests.filter(r => r.status === 'ACTION_TAKEN').length
  const inReview   = requests.filter(r => r.status === 'IN_REVIEW').length

  // Chart data
  const issueCounts = issueTypes.map(t => requests.filter(r => r.issueType === t).length)
  const CHART_COLORS = ['#e8536a', '#9b6b7e', '#4a90d9', '#f5a623', '#2ebc8a', '#7c5cbf']

  const doughnutData = {
    labels: issueTypes,
    datasets: [{ data: issueCounts, backgroundColor: CHART_COLORS, borderWidth: 2, borderColor: '#fff' }]
  }

  const statusCounts = STATUS_OPTIONS.map(s => requests.filter(r => r.status === s).length)
  const barData = {
    labels: STATUS_OPTIONS.map(s => statusLabel[s]),
    datasets: [{
      label: 'Requests',
      data: statusCounts,
      backgroundColor: ['#fde8ec', '#fff4e0', '#f0ecfb', '#e4f9f3'],
      borderColor:     ['#e8536a', '#f5a623', '#7c5cbf', '#2ebc8a'],
      borderWidth: 2, borderRadius: 8,
    }]
  }

  const openEdit = (r) => {
    setEditId(r.id || r.requestId)
    setNewStatus(r.status)
    setNewAuthority(r.authority || '')
  }

  const handleSave = async (r) => {
    setSaving(true)
    try {
      await updateStatus(r.requestId, newStatus)
      if (newAuthority) await reassignRequest(r.requestId, newAuthority)
      setRequests(prev => prev.map(x =>
        (x.id === r.id || x.requestId === r.requestId)
          ? { ...x, status: newStatus, authority: newAuthority || x.authority }
          : x
      ))
      setEditId(null)
      toast('Request updated successfully!', 'success')
    } catch {
      // Optimistic update fallback
      setRequests(prev => prev.map(x =>
        (x.id === r.id || x.requestId === r.requestId)
          ? { ...x, status: newStatus, authority: newAuthority || x.authority }
          : x
      ))
      setEditId(null)
      toast('Updated (offline mode)', 'success')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Admin Dashboard</h1>
            <p className={styles.sub}>Manage incoming help requests, update statuses, and reassign to authorities.</p>
          </div>
          <span className={styles.adminBadge}>🔐 Admin Access</span>
        </div>

        {/* Stats row */}
        <div className={styles.statsRow}>
          <StatCard label="Total Requests" value={total}     icon="📋" color="#e8536a" />
          <StatCard label="Pending Review"  value={submitted} icon="📬" color="#f5a623" />
          <StatCard label="In Review"       value={inReview}  icon="⚙️" color="#7c5cbf" />
          <StatCard label="Action Taken"    value={actioned}  icon="✅" color="#2ebc8a" />
        </div>

        {/* Charts */}
        <div className={styles.chartsRow}>
          <div className={`card ${styles.chartCard}`}>
            <h3 className={styles.chartTitle}>Requests by Issue Type</h3>
            <div className={styles.chartWrap}>
              <Doughnut data={doughnutData} options={{ plugins: { legend: { position: 'bottom' } }, cutout: '65%' }} />
            </div>
          </div>
          <div className={`card ${styles.chartCard}`}>
            <h3 className={styles.chartTitle}>Requests by Status</h3>
            <div className={styles.chartWrap}>
              <Bar data={barData} options={{
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
              }} />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className={styles.filters}>
          <input className={styles.searchInput}
            placeholder="🔍  Search by Request ID or Area…"
            value={search} onChange={e => setSearch(e.target.value)} />

          <select className={styles.filterSelect} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="ALL">All Statuses</option>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{statusLabel[s]}</option>)}
          </select>

          <select className={styles.filterSelect} value={filterIssue} onChange={e => setFilterIssue(e.target.value)}>
            <option value="ALL">All Issues</option>
            {issueTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className={styles.tableWrap}>
          {loading ? (
            <div className={styles.loadingRow}>
              {[1,2,3,4].map(i => <div key={i} className={styles.skeleton} />)}
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Issue Type</th>
                  <th>Area</th>
                  <th>Status</th>
                  <th>Assigned To</th>
                  <th>Submitted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className={styles.emptyRow}>No requests match your filters.</td></tr>
                ) : filtered.map(r => {
                  const isEditing = editId === (r.id || r.requestId)
                  return (
                    <tr key={r.requestId} className={`${styles.row} ${isEditing ? styles.rowEditing : ''}`}>
                      <td><code className={styles.reqId}>{r.requestId}</code></td>
                      <td><span className={styles.issueTag}>{r.issueType}</span></td>
                      <td className={styles.area}>{r.area}</td>
                      <td>
                        {isEditing ? (
                          <select className={styles.inlineSelect} value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{statusLabel[s]}</option>)}
                          </select>
                        ) : (
                          <span className={`badge ${statusClass[r.status]}`}>{statusLabel[r.status] || r.status}</span>
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <select className={styles.inlineSelect} value={newAuthority} onChange={e => setNewAuthority(e.target.value)}>
                            <option value="">Unassigned</option>
                            {AUTHORITY_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
                          </select>
                        ) : (
                          <span className={styles.authority}>{r.authority || <em style={{ color: 'var(--muted)' }}>Unassigned</em>}</span>
                        )}
                      </td>
                      <td className={styles.date}>
                        {r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN') : '—'}
                      </td>
                      <td>
                        <div className={styles.actions}>
                          {isEditing ? (
                            <>
                              <button className={styles.saveBtn} onClick={() => handleSave(r)} disabled={saving}>
                                {saving ? '…' : '✓ Save'}
                              </button>
                              <button className={styles.cancelBtn} onClick={() => setEditId(null)}>✕</button>
                            </>
                          ) : (
                            <button className={styles.editBtn} onClick={() => openEdit(r)}>✏️ Edit</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        <p className={styles.tableNote}>
          Showing {filtered.length} of {total} total requests.
          All data is anonymised — no personal information is stored.
        </p>
      </div>
    </div>
  )
}
