import { Link, useLocation } from 'react-router-dom'
import { TrendingUp } from 'lucide-react'

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/ipos', label: 'All IPOs' },
  { to: '/upcoming', label: 'Upcoming' },
]

export default function Navbar() {
  const { pathname } = useLocation()

  return (
    <header className="hidden md:block bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg gradient-blue flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-xl text-gray-900 group-hover:text-primary-600 transition-colors">
            WhatIfIPO<span className="text-primary-600">.in</span>
          </span>
        </Link>

        {/* Nav Links */}
        <nav className="flex items-center gap-1">
          {navLinks.map(({ to, label }) => {
            const isActive = pathname === to
            return (
              <Link
                key={to}
                to={to}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150
                  ${isActive
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }
                `}
              >
                {label}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
