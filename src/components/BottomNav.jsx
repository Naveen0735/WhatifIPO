import { Link, useLocation } from 'react-router-dom'
import { Home, List, Clock } from 'lucide-react'

const tabs = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/ipos', label: 'All IPOs', icon: List },
  { to: '/upcoming', label: 'Upcoming', icon: Clock },
]

export default function BottomNav() {
  const { pathname } = useLocation()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-pb">
      <div className="flex">
        {tabs.map(({ to, label, icon: Icon }) => {
          const isActive = pathname === to
          return (
            <Link
              key={to}
              to={to}
              className={`
                flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs font-medium transition-colors
                ${isActive ? 'text-primary-600' : 'text-gray-500'}
              `}
            >
              <Icon
                className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`}
                strokeWidth={isActive ? 2.5 : 1.8}
              />
              <span>{label}</span>
            </Link>
          )
        })}
      </div>
      <div className="text-center pb-2 pt-0.5 text-[10px] text-gray-400 px-4">
        For educational purposes only. Not financial advice.
      </div>
    </nav>
  )
}
