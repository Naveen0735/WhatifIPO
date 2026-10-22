import { useState, useMemo } from 'react'
import { Clock, AlertCircle, TrendingUp, RefreshCw, Radio, Flame, CheckCircle2, Search, Filter } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { formatIndianCurrency } from '../lib/utils'

function StatusBadge({ status, subscriptionTimes }) {
  if (status === 'open') {
    return (
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          Bidding Open Now
        </span>
        {subscriptionTimes && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            {subscriptionTimes}x Subscribed
          </span>
        )}
      </div>
    )
  }

  if (status === 'upcoming') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
        <Clock className="w-3.5 h-3.5 text-blue-500" />
        Upcoming Pipeline
      </span>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
        <CheckCircle2 className="w-3.5 h-3.5 text-gray-500" />
        Bidding Closed
      </span>
      {subscriptionTimes && (
        <span className="text-xs text-gray-500 font-medium">
          Final: {subscriptionTimes}x
        </span>
      )}
    </div>
  )
}

export default function Upcoming() {
  const [activeTab, setActiveTab] = useState('all') // all | open | upcoming | closed
  const [search, setSearch] = useState('')

  // Dynamically fetch live upcoming & active issues from official exchange subscription feeds
  const {
    data: apiPayload,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['upcoming-ipos-live-feed'],
    queryFn: async () => {
      const res = await fetch('/api/upcoming-ipos')
      if (!res.ok) throw new Error('Failed to load upcoming IPOs feed')
      return res.json()
    },
    staleTime: 60 * 1000,
    refetchInterval: 90 * 1000, // Auto-sync every 90s
  })

  const rawList = apiPayload?.data || []
  const syncedAt = apiPayload?.syncedAt
    ? new Date(apiPayload.syncedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : null

  // Tab counts
  const counts = useMemo(() => {
    return {
      all: rawList.length,
      open: rawList.filter(i => i.status === 'open').length,
      upcoming: rawList.filter(i => i.status === 'upcoming').length,
      closed: rawList.filter(i => i.status === 'closed').length,
    }
  }, [rawList])

  // Filtered list
  const filteredList = useMemo(() => {
    let list = [...rawList]
    if (activeTab !== 'all') {
      list = list.filter(i => i.status === activeTab)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(i =>
        i.name?.toLowerCase().includes(q) ||
        i.symbol?.toLowerCase().includes(q) ||
        i.sector?.toLowerCase().includes(q)
      )
    }
    return list
  }, [rawList, activeTab, search])

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:py-10">
      {/* Header with Live Sync Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">Upcoming & Active IPOs</h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              Live Feed
            </span>
          </div>
          <p className="text-gray-500 text-sm">
            Real-time bidding dates, price bands, and subscription multiples synced directly from Indian market filings.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          {syncedAt && (
            <span className="text-xs text-gray-400 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-xl">
              Synced: {syncedAt}
            </span>
          )}
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 transition shadow-sm active:scale-95"
            title="Fetch latest data from exchange"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-gray-500 ${isFetching ? 'animate-spin text-primary-600' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white rounded-2xl border border-gray-100 card-shadow p-3 mb-6 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Tabs */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'all', label: `All Issues (${counts.all})` },
              { id: 'open', label: `Open Now (${counts.open})` },
              { id: 'upcoming', label: `Upcoming Pipeline (${counts.upcoming})` },
              { id: 'closed', label: `Recently Closed (${counts.closed})` },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search upcoming..."
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-xl outline-none focus:border-primary-500 bg-gray-50 focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* Cards List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(n => (
            <div key={n} className="bg-white rounded-3xl border border-gray-100 p-6 animate-pulse space-y-4">
              <div className="h-6 bg-gray-100 rounded w-1/3" />
              <div className="h-4 bg-gray-50 rounded w-2/3" />
              <div className="grid grid-cols-4 gap-4 pt-4 border-t border-gray-50">
                <div className="h-8 bg-gray-50 rounded" />
                <div className="h-8 bg-gray-50 rounded" />
                <div className="h-8 bg-gray-50 rounded" />
                <div className="h-8 bg-gray-50 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredList.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 card-shadow">
          <Clock className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-800">No issues found</h3>
          <p className="text-sm text-gray-400 mt-1">Try adjusting your search or active filter tab.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredList.map(ipo => {
            const hasDates = ipo.openDate && ipo.closeDate
            const timelineText = hasDates
              ? `${new Date(ipo.openDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} – ${new Date(ipo.closeDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`
              : ipo.dateNotice || 'Dates TBA by SEBI'

            return (
              <div
                key={ipo.id}
                className="bg-white rounded-3xl card-shadow-lg border border-gray-100 overflow-hidden hover:border-primary-200 transition-all"
              >
                {/* Header */}
                <div className="p-5 md:p-6 border-b border-gray-50">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl gradient-blue flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
                        {ipo.symbol?.slice(0, 3) || 'IPO'}
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-gray-900 leading-snug">{ipo.name}</h2>
                        <div className="flex flex-wrap items-center gap-2 mt-0.5">
                          <span className="text-xs font-mono text-gray-400 font-semibold">{ipo.symbol}</span>
                          <span className="text-gray-300">·</span>
                          <span className="text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full font-medium">
                            {ipo.sector}
                          </span>
                          <span className="text-xs text-gray-400">{ipo.exchange}</span>
                        </div>
                      </div>
                    </div>
                    <StatusBadge status={ipo.status} subscriptionTimes={ipo.subscriptionTimes} />
                  </div>

                  {ipo.description && (
                    <p className="text-xs md:text-sm text-gray-600 leading-relaxed mt-2">{ipo.description}</p>
                  )}
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-gray-100 bg-gray-50/40">
                  <div className="p-4 md:p-5">
                    <div className="text-xs text-gray-400 font-medium mb-1">Price Band</div>
                    <div className="text-sm font-bold text-gray-900">
                      {ipo.priceBandMin && ipo.priceBandMax
                        ? `${formatIndianCurrency(ipo.priceBandMin)} – ${formatIndianCurrency(ipo.priceBandMax)}`
                        : 'Price Band TBA'}
                    </div>
                  </div>

                  <div className="p-4 md:p-5">
                    <div className="text-xs text-gray-400 font-medium mb-1">Lot Size</div>
                    <div className="text-sm font-bold text-gray-900">
                      {ipo.lotSize ? `${ipo.lotSize} shares` : 'TBA'}
                    </div>
                  </div>

                  <div className="p-4 md:p-5">
                    <div className="text-xs text-gray-400 font-medium mb-1">Min Investment</div>
                    <div className="text-sm font-bold text-gray-900">
                      {ipo.minInvestment ? formatIndianCurrency(ipo.minInvestment) : 'TBA'}
                    </div>
                  </div>

                  <div className="p-4 md:p-5">
                    <div className="text-xs text-gray-400 font-medium mb-1">Timeline / Status</div>
                    <div className="text-xs md:text-sm font-bold text-primary-700">
                      {timelineText}
                    </div>
                  </div>
                </div>

                {/* Highlights */}
                {ipo.highlights?.length > 0 && (
                  <div className="px-5 md:px-6 py-3.5 border-t border-gray-50 flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mr-1">Key Highlights:</span>
                    {ipo.highlights.map(h => (
                      <span key={h} className="text-xs bg-blue-50/80 text-blue-700 px-2.5 py-0.5 rounded-full font-medium">
                        {h}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Live Notice Footer */}
      <div className="mt-8 text-center text-xs text-gray-400 bg-white rounded-2xl p-5 border border-gray-100 card-shadow space-y-1">
        <p className="font-medium text-gray-600">Dynamic Primary Market Sync</p>
        <p>Issues are updated live whenever SEBI/BSE/NSE issue timetables change. No manual static date maintenance required.</p>
      </div>
    </div>
  )
}
