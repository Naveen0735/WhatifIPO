import { useState, useEffect, useRef } from 'react'
import { Search, X, Loader2, Sparkles, TrendingUp, TrendingDown } from 'lucide-react'
import { searchMergedIPOs, getSuggestedIPOs } from '../lib/iposService'

export default function SearchBar({ value, onChange, onSelect, placeholder }) {
  const [query, setQuery] = useState(value || '')
  const [results, setResults] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isShowingSuggestions, setIsShowingSuggestions] = useState(false)
  const containerRef = useRef(null)
  const debounceRef = useRef(null)

  // Sync external value
  useEffect(() => {
    if (value !== undefined) setQuery(value)
  }, [value])

  // Pre-load popular suggestions on mount
  useEffect(() => {
    let mounted = true
    getSuggestedIPOs(10).then((suggs) => {
      if (mounted) setSuggestions(suggs)
    }).catch(console.error)
    return () => { mounted = false }
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const openSuggestions = async () => {
    let list = suggestions
    if (!list || list.length === 0) {
      setIsLoading(true)
      try {
        list = await getSuggestedIPOs(10)
        setSuggestions(list)
      } finally {
        setIsLoading(false)
      }
    }
    setResults(list)
    setIsShowingSuggestions(true)
    setIsOpen(true)
  }

  const handleFocusOrClick = () => {
    if (!query || !query.trim()) {
      openSuggestions()
    } else {
      // If there is already a query, re-run search or open existing results
      setIsLoading(true)
      searchMergedIPOs(query)
        .then((matches) => {
          setResults(matches)
          setIsShowingSuggestions(false)
          setIsOpen(true)
        })
        .finally(() => setIsLoading(false))
    }
  }

  const handleChange = (e) => {
    const q = e.target.value
    setQuery(q)
    onChange?.(q)

    clearTimeout(debounceRef.current)

    if (q.trim().length === 0) {
      // When input is cleared, show suggestions immediately
      openSuggestions()
      return
    }

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true)
      try {
        const matches = await searchMergedIPOs(q)
        setResults(matches)
        setIsShowingSuggestions(false)
        setIsOpen(true)
      } finally {
        setIsLoading(false)
      }
    }, 200)
  }

  const handleSelect = (ipo) => {
    setQuery(ipo.name)
    setIsOpen(false)
    onSelect?.(ipo)
  }

  const handleClear = () => {
    setQuery('')
    onChange?.('')
    onSelect?.(null)
    openSuggestions()
  }

  const getReturnColor = (ipo) => {
    if (!ipo.listing_price || !ipo.issue_price) return 'text-gray-400'
    const pct = ((ipo.listing_price - ipo.issue_price) / ipo.issue_price) * 100
    return pct >= 0 ? 'text-green-600' : 'text-red-600'
  }

  const getReturnPct = (ipo) => {
    if (!ipo.listing_price || !ipo.issue_price) return null
    const pct = ((ipo.listing_price - ipo.issue_price) / ipo.issue_price) * 100
    return pct.toFixed(1)
  }

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        <input
          id="ipo-search"
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={handleFocusOrClick}
          onClick={handleFocusOrClick}
          placeholder={placeholder || 'Search any IPO... (e.g. Zomato, DMart, Tata Tech, LIC)'}
          className="
            w-full pl-12 pr-12 py-4 text-base bg-white border-2 border-gray-200
            rounded-2xl outline-none transition-all duration-200
            placeholder:text-gray-400 text-gray-900
            focus:border-primary-500 focus:ring-4 focus:ring-primary-50
            card-shadow
          "
          autoComplete="off"
        />
        {/* Right icons */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isLoading && <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />}
          {query && !isLoading && (
            <button
              onClick={handleClear}
              type="button"
              className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <X className="w-3.5 h-3.5 text-gray-500" />
            </button>
          )}
        </div>
      </div>

      {/* Dropdown Suggestions */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl card-shadow border border-gray-100 z-50 overflow-hidden animate-slide-down max-h-96 overflow-y-auto">
          {/* Header */}
          <div className="px-4 py-2.5 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between text-xs font-semibold text-gray-500">
            <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
              {isShowingSuggestions ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Suggested & Popular IPOs
                </>
              ) : (
                <>
                  <Search className="w-3.5 h-3.5 text-primary-500" />
                  Matching Results ({results.length})
                </>
              )}
            </span>
            <span className="text-[10px] text-gray-400 font-normal">Click to calculate</span>
          </div>

          {/* Results list */}
          {results.length > 0 ? (
            results.map((ipo, idx) => {
              const pct = getReturnPct(ipo)
              return (
                <button
                  key={ipo.id || `${ipo.symbol}-${idx}`}
                  type="button"
                  onClick={() => handleSelect(ipo)}
                  className={`
                    w-full px-4 py-3 flex items-center justify-between
                    hover:bg-blue-50/50 transition-colors text-left
                    ${idx !== results.length - 1 ? 'border-b border-gray-50' : ''}
                  `}
                >
                  <div className="flex items-center gap-3">
                    {/* Symbol avatar */}
                    <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-primary-600">
                        {ipo.symbol?.slice(0, 2) || ipo.name?.slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">{ipo.name}</div>
                      <div className="text-xs text-gray-400 flex items-center gap-1.5">
                        <span className="font-mono">{ipo.symbol}</span>
                        {ipo.sector && (
                          <>
                            <span>·</span>
                            <span>{ipo.sector}</span>
                          </>
                        )}
                        {ipo.issue_price && (
                          <>
                            <span>·</span>
                            <span>Issue: ₹{ipo.issue_price}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {pct !== null && (
                    <div className="text-right">
                      <span className={`text-xs md:text-sm font-semibold flex items-center gap-0.5 justify-end ${getReturnColor(ipo)}`}>
                        {Number(pct) >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {Number(pct) >= 0 ? '+' : ''}{pct}%
                      </span>
                      <span className="text-[10px] text-gray-400">Listing</span>
                    </div>
                  )}
                </button>
              )
            })
          ) : (
            <div className="p-6 text-center text-sm text-gray-500 space-y-2">
              <p>No IPO found matching &ldquo;{query}&rdquo;</p>
              {suggestions.length > 0 && (
                <div className="pt-2">
                  <p className="text-xs text-gray-400 mb-2">Try one of these popular IPOs instead:</p>
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {suggestions.slice(0, 6).map((sug) => (
                      <button
                        key={sug.id}
                        type="button"
                        onClick={() => handleSelect(sug)}
                        className="px-2.5 py-1 bg-gray-100 hover:bg-primary-50 hover:text-primary-600 text-xs rounded-full font-medium transition"
                      >
                        {sug.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
