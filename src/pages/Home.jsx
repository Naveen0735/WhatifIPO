import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Calculator, TrendingUp, Search, Sparkles, Loader2, Radio, Clock } from 'lucide-react'
import confetti from 'canvas-confetti'
import SearchBar from '../components/SearchBar'
import ResultCard from '../components/ResultCard'
import { getIPOById } from '../lib/iposService'
import { calculateIPOReturns, formatIndianCurrency } from '../lib/utils'

const POPULAR_IPOS = ['Zomato', 'DMart', 'Tata Tech', 'IRCTC', 'Mazagon Dock', 'Coal India', 'Reliance Power', 'Paytm', 'LIC']

export default function Home() {
  const [searchParams] = useSearchParams()
  const [selectedIPO, setSelectedIPO] = useState(null)
  const [amount, setAmount] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [searchValue, setSearchValue] = useState('')
  const [loadingLive, setLoadingLive] = useState(false)
  const [liveData, setLiveData] = useState(null)

  // Pre-fill from query params (e.g. from share links or All IPOs page)
  useEffect(() => {
    const ipoId = searchParams.get('ipo')
    const urlAmt = searchParams.get('amt')

    if (ipoId) {
      getIPOById(ipoId).then((data) => {
        if (data) {
          setSelectedIPO(data)
          setSearchValue(data.name)
          const chosenAmount = urlAmt ? String(urlAmt) : (data.min_investment ? String(data.min_investment) : '15000')
          setAmount(chosenAmount)

          // Auto calculate if amt was in url
          if (urlAmt) {
            const amtNum = Number(urlAmt)
            const lotSize = data.lot_size || 1
            const minReq = data.min_investment || (data.issue_price * lotSize)
            if (amtNum >= minReq) {
              // Fetch live prices on auto-calculate
              if (data.symbol) {
                setLoadingLive(true)
                fetch(`/api/live-price?symbol=${encodeURIComponent(data.symbol)}`)
                  .then((r) => (r.ok ? r.json() : null))
                  .then((live) => {
                    setLiveData(live)
                    const calc = calculateIPOReturns(amtNum, data, live)
                    if (calc.shares > 0) {
                      setResult(calc)
                    }
                  })
                  .catch(() => {
                    const calc = calculateIPOReturns(amtNum, data, null)
                    if (calc.shares > 0) setResult(calc)
                  })
                  .finally(() => setLoadingLive(false))
              }
            }
          }
        }
      })
    }
  }, [searchParams])

  const triggerCelebration = (calc) => {
    const gainPct = calc.current_gain_pct ?? calc.listing_gain_pct ?? 0
    if (gainPct >= 100) {
      // Multibagger celebration!
      const end = Date.now() + 1500
      const colors = ['#16A34A', '#2563EB', '#F59E0B', '#10B981', '#EC4899']
      ;(function frame() {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors
        })
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors
        })
        if (Date.now() < end) {
          requestAnimationFrame(frame)
        }
      })()
    } else if (gainPct > 0) {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#16A34A', '#10B981', '#34D399', '#60A5FA']
      })
    }
  }

  const handleCalculate = async () => {
    setError('')
    setResult(null)

    if (!selectedIPO) {
      setError('Please search and select an IPO first.')
      return
    }

    if (selectedIPO.isUpcoming) {
      setError(`${selectedIPO.name} is an upcoming IPO and has not listed on the exchange yet. Calculator will unlock once listed. Check the upcoming filing details above.`)
      return
    }

    const amt = Number(amount.replace(/,/g, ''))
    const lotSize = selectedIPO.lot_size || 1
    const minRequired = selectedIPO.min_investment || (selectedIPO.issue_price * lotSize)

    if (!amt || amt < minRequired) {
      setError(
        `Minimum investment is ${formatIndianCurrency(minRequired)} ` +
        `(${lotSize} shares × ${formatIndianCurrency(selectedIPO.issue_price)} per share = 1 lot).`
      )
      return
    }

    setLoadingLive(true)
    let fetchedLive = null

    try {
      if (selectedIPO.symbol) {
        const res = await fetch(`/api/live-price?symbol=${encodeURIComponent(selectedIPO.symbol)}`)
        if (res.ok) {
          const json = await res.json()
          if (json.success) {
            fetchedLive = json
            setLiveData(json)
          }
        }
      }
    } catch (e) {
      console.warn('Live price fetch failed, falling back to base calculation:', e)
    } finally {
      setLoadingLive(false)
    }

    // Dynamic calculation: Uses live launch date, live launch price, and live current price!
    const calc = calculateIPOReturns(amt, selectedIPO, fetchedLive)
    if (calc.shares === 0) {
      setError(
        `Amount is too low. You need at least ${formatIndianCurrency(minRequired)} to get 1 lot (${lotSize} shares).`
      )
      return
    }

    setResult(calc)
    triggerCelebration(calc)
  }

  const handleAmountChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, '')
    setAmount(val)
    setResult(null)
    setError('')
  }

  const handleIPOSelect = (ipo) => {
    setSelectedIPO(ipo)
    setResult(null)
    setLiveData(null)
    setError('')
    if (ipo && ipo.min_investment) {
      setAmount(String(ipo.min_investment))
    }
  }

  const quickAmounts = [15000, 30000, 50000, 100000]

  return (
    <div className="gradient-hero min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-8 md:py-12">

        {/* Hero */}
        <div className="text-center mb-8 md:mb-10">
          {/* Mobile logo */}
          <div className="md:hidden flex items-center justify-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl gradient-blue flex items-center justify-center shadow-md shadow-blue-200">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-2xl text-gray-900">
              WhatIfIPO<span className="text-primary-600">.in</span>
            </span>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-3 animate-fade-in shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Market Feed Integration Active
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3 leading-tight">
            What if you had<br className="hidden sm:block" /> invested in that IPO?
          </h1>
          <p className="text-gray-500 text-base md:text-lg">
            Real-time returns calculated dynamically from live market launch and current prices.
          </p>
        </div>

        {/* Calculator Card */}
        <div className="bg-white rounded-3xl card-shadow-lg border border-gray-100 p-5 md:p-7 space-y-5">

          {/* Search */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Search className="inline w-3.5 h-3.5 mr-1 mb-0.5" />
              Select IPO
            </label>
            <SearchBar
              value={searchValue}
              onChange={setSearchValue}
              onSelect={handleIPOSelect}
              placeholder="Search any IPO... (e.g. Zomato, DMart, Tata Tech, Money View)"
            />
            {selectedIPO?.isUpcoming && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider bg-blue-600 text-white px-2 py-0.5 rounded-full">
                      Upcoming IPO
                    </span>
                    <span className="text-xs text-blue-700 font-semibold">{selectedIPO.dateNotice || 'Dates TBA by SEBI'}</span>
                  </div>
                  <p className="text-xs text-blue-900 mt-1.5 leading-relaxed">
                    <strong>{selectedIPO.name}</strong> is in the upcoming pipeline. Price Band: ₹{selectedIPO.priceBandMin || selectedIPO.issue_price} – ₹{selectedIPO.priceBandMax || selectedIPO.issue_price} · Lot Size: {selectedIPO.lot_size} shares.
                  </p>
                </div>
                <Link
                  to={`/upcoming`}
                  className="inline-flex items-center justify-center text-xs font-bold px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition shadow-sm flex-shrink-0"
                >
                  View Details in Upcoming →
                </Link>
              </div>
            )}
          </div>

          {/* Amount */}
          <div>
            <label htmlFor="amount-input" className="block text-sm font-semibold text-gray-700 mb-2">
              Investment Amount (₹)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-lg select-none">₹</span>
              <input
                id="amount-input"
                type="text"
                inputMode="numeric"
                value={amount ? Number(amount).toLocaleString('en-IN') : ''}
                onChange={handleAmountChange}
                placeholder="Enter amount (e.g. 15,000)"
                className="
                  w-full pl-9 pr-4 py-4 text-base bg-white border-2 border-gray-200
                  rounded-2xl outline-none transition-all duration-200
                  placeholder:text-gray-400 text-gray-900 font-medium
                  focus:border-primary-500 focus:ring-4 focus:ring-primary-50
                "
              />
            </div>

            {/* Quick amount chips */}
            <div className="flex flex-wrap gap-2 mt-2.5">
              {quickAmounts.map((amt) => (
                <button
                  key={amt}
                  onClick={() => { setAmount(String(amt)); setResult(null); setError('') }}
                  className={`
                    px-3 py-1 rounded-full text-xs font-medium transition-all border
                    ${Number(amount) === amt
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-primary-300 hover:text-primary-600'
                    }
                  `}
                >
                  {formatIndianCurrency(amt)}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {/* CTA Button */}
          <button
            id="calculate-btn"
            onClick={handleCalculate}
            disabled={!selectedIPO || !amount || loadingLive}
            className="
              w-full py-4 px-6 rounded-2xl font-bold text-base text-white
              transition-all duration-200 flex items-center justify-center gap-2
              bg-[#16A34A] hover:bg-[#15803D] active:scale-[0.98]
              disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100
              shadow-lg shadow-green-200
            "
          >
            {loadingLive ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Pulling Live Market Data...
              </>
            ) : (
              <>
                <Calculator className="w-5 h-5" />
                Calculate Returns (Live Data)
              </>
            )}
          </button>

          {/* IPO info chips when selected */}
          {selectedIPO && (
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="text-xs bg-gray-50 border border-gray-200 text-gray-600 px-2.5 py-1 rounded-full">
                Issue Price: {formatIndianCurrency(selectedIPO.issue_price)}
              </span>
              <span className="text-xs bg-gray-50 border border-gray-200 text-gray-600 px-2.5 py-1 rounded-full">
                Lot Size: {selectedIPO.lot_size} shares
              </span>
              {selectedIPO.min_investment && (
                <span className="text-xs bg-gray-50 border border-gray-200 text-gray-600 px-2.5 py-1 rounded-full">
                  Min: {formatIndianCurrency(selectedIPO.min_investment)}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Results */}
        {result && selectedIPO && (
          <ResultCard ipo={selectedIPO} result={result} liveData={liveData} />
        )}

        {/* Popular IPOs hint */}
        {!selectedIPO && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400 mb-3">Popular IPOs</p>
            <div className="flex flex-wrap justify-center gap-2">
              {POPULAR_IPOS.map((name) => (
                <span
                  key={name}
                  className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs text-gray-600 card-shadow cursor-pointer hover:border-primary-300 hover:text-primary-600 transition-colors"
                  onClick={() => setSearchValue(name)}
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
