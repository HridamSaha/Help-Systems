import { createContext, useContext, useState, useCallback } from 'react'

const ToastCtx = createContext(null)

export function useToast() {
  return useContext(ToastCtx)
}

let idSeq = 0

export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const show = useCallback((message, type = 'default') => {
    const id = ++idSeq
    setToasts(t => [...t, { id, message, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500)
  }, [])

  const icons = { success: '✓', error: '✕', default: 'ℹ' }

  return (
    <ToastCtx.Provider value={show}>
      {children}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}`}>
            <span>{icons[t.type] || icons.default}</span>
            {t.message}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}
