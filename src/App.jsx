import { Routes, Route } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import Navbar from './components/Navbar'
import BottomNav from './components/BottomNav'
import Home from './pages/Home'
import AllIPOs from './pages/AllIPOs'
import Upcoming from './pages/Upcoming'

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      {/* Desktop Navbar */}
      <Navbar />

      {/* Main content — add bottom padding on mobile for bottom nav */}
      <main className="flex-1 pb-20 md:pb-0">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/ipos" element={<AllIPOs />} />
          <Route path="/upcoming" element={<Upcoming />} />
        </Routes>
      </main>

      {/* Mobile Bottom Tab Bar */}
      <BottomNav />

      {/* Disclaimer */}
      <div className="hidden md:block text-center py-3 text-xs text-gray-400 bg-white border-t border-gray-100">
        For educational purposes only. Not financial advice. Data may be delayed or inaccurate.
      </div>

      {/* Vercel Web Analytics */}
      <Analytics />
    </div>
  )
}
