import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import SubmitRequest from './pages/SubmitRequest'
import TrackRequest from './pages/TrackRequest'
import Resources from './pages/Resources'
import AdminDashboard from './pages/AdminDashboard'
import ToastProvider from './components/ToastProvider'

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <main style={{ flex: 1 }}>
            <Routes>
              <Route path="/"          element={<Home />} />
              <Route path="/submit"    element={<SubmitRequest />} />
              <Route path="/track"     element={<TrackRequest />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/admin"     element={<AdminDashboard />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </ToastProvider>
    </BrowserRouter>
  )
}
