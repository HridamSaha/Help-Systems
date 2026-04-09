const BASE = '/api'

async function req(url, options = {}) {
  const res = await fetch(BASE + url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(err || `HTTP ${res.status}`)
  }
  return res.json()
}

// ── Help Requests ──────────────────────────────────────────────
export const submitHelpRequest = (dto) =>
  req('/help/submit', { method: 'POST', body: JSON.stringify(dto) })

export const trackHelpRequest = (requestId) =>
  req(`/help/track/${requestId}`)

export const getAllRequests = () =>
  req('/help/all')

export const updateStatus = (requestId, status) =>
  req('/help/status', { method: 'PUT', body: JSON.stringify({ requestId, status }) })

export const reassignRequest = (requestId, authority) =>
  req('/help/reassign', { method: 'PUT', body: JSON.stringify({ requestId, authority }) })

// ── Resources ──────────────────────────────────────────────────
export const getResources = (issueType) =>
  req(`/resources/${issueType}`)

export const addResource = (resource) =>
  req('/resources/add', { method: 'POST', body: JSON.stringify(resource) })
