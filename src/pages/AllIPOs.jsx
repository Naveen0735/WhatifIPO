import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, TrendingDown, ArrowUpDown, Filter, Search } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getMergedIPOs } from '../lib/iposService'
import { formatIndianCurrency } from '../lib/utils'

const SECTORS = ['All Sectors', 'Technology', 'Finance', 'Healthcare', 'Consumer', 'Energy', 'Manufacturing', 'Real Estate', 'Telecom', 'Others']

function GainBadge({ pct }) {
  if (pct === null || pct === undefined) return <span className="text-gray-400 text-sm">—</span>
  const isPos = pct >= 0
  return (
    <span className={`inline-flex items-center gap-1 text-sm font-semibold ${isPos ? 'gain-text' : 'loss-text'}`}>
      {isPos ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
      {isPos ? '+' : ''}{pct.toFixed(2)}%
    </span>
  )
}

export default function AllIPOs() {
  const navigate = useNavigate()
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [sector, setSector] = useState('All Sectors')
  const [year, setYear] = useState('All Years')
  const [filter, setFilter] = useState('All') // All | Gainers | Losers
  const [sortBy, setSortBy] = useState('listing_date')
  const [sortDir, setSortDir] = useState('desc')

  // Cached query with React Query using merged catalog (Supabase + historical)
  const { data: ipos = [], isLoading: loading } = useQuery({
    queryKey: ['ipos-all-merged'],
    queryFn: () => getMergedIPOs(),
  })

  // Compute years from data
  const years = ['All Years', ...Array.from(new Set(
    ipos.map(i => i.listing_date ? new Date(i.listing_date).getFullYear() : null).filter(Boolean)
  )).sort((a, b) => b - a).map(String)]

  // Filter + sort
  useEffect(() => {
    // Only listed IPOs (must have listing date and not be an upcoming unlisted pipeline stock)
    let data = ipos.filter(i => 
      i.listing_date && 
      i.symbol !== 'JIOP' && 
      i.symbol !== 'JIOPLATFORMS' && 
      !i.name?.toLowerCase().includes('jio platforms')
    )

    // Search
    if (search.trim()) {
      const q = search.toLowerCase()
      data = data.filter(i =>
        i.name?.toLowerCase().includes(q) ||
        i.symbol?.toLowerCase().includes(q) ||
        i.sector?.toLowerCase().includes(q)
      )
    }

    // Sector
    if (sector !== 'All Sectors') {
      data = data.filter(i => i.sector === sector)
    }

    // Year
    if (year !== 'All Years') {
      data = data.filter(i => i.listing_date && new Date(i.listing_date).getFullYear() === Number(year))
    }

    // Gainers / Losers
    if (filter === 'Gainers') {
      data = data.filter(i => {
        const pct = i.listing_price && i.issue_price ? ((i.listing_price - i.issue_price) / i.issue_price) * 100 : null
        return pct !== null && pct >= 0
      })
    } else if (filter === 'Losers') {
      data = data.filter(i => {
        const pct = i.listing_price && i.issue_price ? ((i.listing_price - i.issue_price) / i.issue_price) * 100 : null
        return pct !== null && pct < 0
      })
    }

    // Sort
    data.sort((a, b) => {
      let aVal, bVal
      if (sortBy === 'listing_date') {
        aVal = new Date(a.listing_date || 0).getTime()
        bVal = new Date(b.listing_date || 0).getTime()
      } else if (sortBy === 'listing_gain') {
        aVal = a.listing_price && a.issue_price ? ((a.listing_price - a.issue_price) / a.issue_price) * 100 : -Infinity
        bVal = b.listing_price && b.issue_price ? ((b.listing_price - b.issue_price) / b.issue_price) * 100 : -Infinity
      } else if (sortBy === 'current_return') {
        aVal = a.current_price && a.issue_price ? ((a.current_price - a.issue_price) / a.issue_price) * 100 : -Infinity
        bVal = b.current_price && b.issue_price ? ((b.current_price - b.issue_price) / b.issue_price) * 100 : -Infinity
      } else if (sortBy === 'issue_price') {
        aVal = a.issue_price || 0
        bVal = b.issue_price || 0
      } else {
        aVal = a.name || ''
        bVal = b.name || ''
      }
      if (typeof aVal === 'string') return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal
    })

    setFiltered(data)
  }, [ipos, search, sector, year, filter, sortBy, sortDir])

  const handleSort = (col) => {
    if (sortBy === col) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(col)
      setSortDir('desc')
    }
  }

  const handleRowClick = (ipo) => {
    navigate(`/?ipo=${ipo.id}`)
  }

  const SortIcon = ({ col }) => (
    sortBy === col
      ? <ArrowUpDown className={`w-3 h-3 inline ml-1 ${sortDir === 'asc' ? 'rotate-180' : ''}`} />
      : <ArrowUpDown className="w-3 h-3 inline ml-1 opacity-30" />
  )

  const getListingPct = (ipo) => {
    if (!ipo.listing_price || !ipo.issue_price) return null
    return ((ipo.listing_price - ipo.issue_price) / ipo.issue_price) * 100
  }
  const getCurrentPct = (ipo) => {
    if (!ipo.current_price || !ipo.issue_price) return null
    return ((ipo.current_price - ipo.issue_price) / ipo.issue_price) * 100
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-10">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">All IPOs</h1>
        <p className="text-gray-500 mt-1">Browse and compare all listed Indian IPOs</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl card-shadow border border-gray-100 p-4 mb-5 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Filter by name, symbol, sector..."
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-50"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Year */}
          <select
            value={year}
            onChange={e => setYear(e.target.value)}
            className="text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-primary-500 bg-white"
          >
            {years.map(y => <option key={y}>{y}</option>)}
          </select>

          {/* Sector */}
          <select
            value={sector}
            onChange={e => setSector(e.target.value)}
            className="text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-primary-500 bg-white"
          >
            {SECTORS.map(s => <option key={s}>{s}</option>)}
          </select>

          {/* Filter chips */}
          {['All', 'Gainers', 'Losers'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-all border ${
                filter === f
                  ? f === 'Gainers' ? 'bg-green-50 text-green-700 border-green-200'
                    : f === 'Losers' ? 'bg-red-50 text-red-700 border-red-200'
                    : 'bg-primary-50 text-primary-700 border-primary-200'
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
            >
              {f}
            </button>
          ))}

          <span className="ml-auto text-sm text-gray-400 self-center">{filtered.length} IPOs</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl card-shadow border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Loading IPOs...</span>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <TrendingUp className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No IPOs found matching your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <button onClick={() => handleSort('name')} className="flex items-center gap-1 hover:text-gray-900">
                      Company <SortIcon col="name" />
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Sector</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <button onClick={() => handleSort('issue_price')} className="flex items-center gap-1 hover:text-gray-900 ml-auto">
                      Issue Price <SortIcon col="issue_price" />
                    </button>
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <button onClick={() => handleSort('listing_gain')} className="flex items-center gap-1 hover:text-gray-900 ml-auto">
                      Listing Gain <SortIcon col="listing_gain" />
                    </button>
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    <button onClick={() => handleSort('current_return')} className="flex items-center gap-1 hover:text-gray-900 ml-auto">
                      Current Return <SortIcon col="current_return" />
                    </button>
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    <button onClick={() => handleSort('listing_date')} className="flex items-center gap-1 hover:text-gray-900 ml-auto">
                      Listed <SortIcon col="listing_date" />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((ipo, idx) => {
                  const listPct = getListingPct(ipo)
                  const currPct = getCurrentPct(ipo)
                  return (
                    <tr
                      key={ipo.id}
                      onClick={() => handleRowClick(ipo)}
                      className={`
                        border-b border-gray-50 cursor-pointer hover:bg-blue-50/40 transition-colors
                        ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}
                      `}
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-primary-600">
                              {ipo.symbol?.slice(0, 2) || ipo.name?.slice(0, 2)}
                            </span>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{ipo.name}</div>
                            <div className="text-xs text-gray-400">{ipo.symbol} · {ipo.exchange}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 hidden sm:table-cell">
                        {ipo.sector ? (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">{ipo.sector}</span>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3.5 text-right font-medium text-gray-900">
                        {formatIndianCurrency(ipo.issue_price)}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <GainBadge pct={listPct} />
                      </td>
                      <td className="px-4 py-3.5 text-right hidden md:table-cell">
                        <GainBadge pct={currPct} />
                      </td>
                      <td className="px-4 py-3.5 text-right text-gray-500 hidden lg:table-cell text-xs">
                        {ipo.listing_date ? new Date(ipo.listing_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
