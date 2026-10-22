import { useState, useRef, useEffect } from 'react'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  IndianRupee,
  Share2,
  Download,
  Copy,
  Check,
  BarChart3,
  ExternalLink,
  Radio
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts'
import html2canvas from 'html2canvas'
import { formatIndianCurrency, formatPercent } from '../lib/utils'

function MetricCard({ title, value, gain, gainPct, isShares = false, isUnavailable = false, subtitle = null }) {
  const isPositive = gainPct > 0
  const isNeutral = gainPct === 0 || gainPct === null || gainPct === undefined
  const GainIcon = isPositive ? TrendingUp : isNeutral ? Minus : TrendingDown

  return (
    <div className="bg-white rounded-2xl p-5 card-shadow border border-gray-100 flex flex-col gap-3 transition-all hover:border-gray-200">
      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</div>

      {/* Value */}
      <div className="text-2xl font-bold text-gray-900">
        {isShares ? (
          <span>
            {value.toLocaleString('en-IN')}
            <span className="text-sm font-normal text-gray-500"> shares</span>
          </span>
        ) : isUnavailable ? (
          <span className="text-gray-400 text-lg font-medium">—</span>
        ) : (
          formatIndianCurrency(value)
        )}
      </div>

      {/* Gain/loss badge */}
      {!isShares && !isUnavailable && gainPct !== null && gainPct !== undefined && (
        <div className={`
          flex items-center gap-1.5 text-sm font-semibold rounded-lg px-2.5 py-1.5 w-fit
          ${isPositive ? 'gain-bg gain-text' : isNeutral ? 'bg-gray-100 text-gray-600' : 'loss-bg loss-text'}
        `}>
          <GainIcon className="w-3.5 h-3.5" />
          <span>{formatPercent(gainPct)}</span>
          {!isNeutral && (
            <span className="font-normal text-xs">
              ({isPositive ? '+' : ''}{formatIndianCurrency(gain)})
            </span>
          )}
        </div>
      )}

      {/* Sub-labels */}
      {subtitle && (
        <div className="text-xs text-emerald-600 font-medium">{subtitle}</div>
      )}
      {isShares && !subtitle && (
        <div className="text-xs text-gray-400">Full allotment assumed</div>
      )}
      {isUnavailable && (
        <div className="text-xs text-amber-600 bg-amber-50 rounded-lg px-2 py-1">
          Not yet listed — price unavailable
        </div>
      )}
    </div>
  )
}

export default function ResultCard({ ipo, result }) {
  const {
    shares, lots, invested,
    listing_value, listing_gain, listing_gain_pct, hasListing,
    current_value, current_gain, current_gain_pct, hasCurrent,
  } = result

  const [copied, setCopied] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [liveData, setLiveData] = useState(null)
  const [isLiveLoading, setIsLiveLoading] = useState(false)
  const cardRef = useRef(null)

  // Fetch live market data from the internet on-the-fly!
  useEffect(() => {
    if (!ipo.symbol) return
    let isMounted = true
    setIsLiveLoading(true)

    fetch(`/api/live-price?symbol=${encodeURIComponent(ipo.symbol)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (isMounted && data && data.success && data.current_price) {
          setLiveData(data)
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setIsLiveLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [ipo.symbol])

  // Derive dynamic live calculations if live price was fetched
  const livePrice = liveData?.current_price
  const effectiveCurrentPrice = livePrice || ipo.current_price
  const effectiveCurrentValue = effectiveCurrentPrice ? shares * effectiveCurrentPrice : current_value
  const effectiveCurrentGain = effectiveCurrentValue ? effectiveCurrentValue - invested : current_gain
  const effectiveCurrentGainPct =
    effectiveCurrentPrice && ipo.issue_price
      ? ((effectiveCurrentPrice - ipo.issue_price) / ipo.issue_price) * 100
      : current_gain_pct
  const effectiveHasCurrent = effectiveCurrentValue !== null && effectiveCurrentValue !== undefined

  // Effective listing date from DB or live internet feed
  const effectiveListingDate = ipo.listing_date || liveData?.listing_date

  // Data for Recharts
  const chartData = [
    {
      name: 'Invested',
      amount: invested,
      fill: '#64748B', // Slate
    },
    ...(hasListing ? [{
      name: 'Listing Day',
      amount: listing_value,
      gainPct: listing_gain_pct,
      fill: listing_gain_pct >= 0 ? '#16A34A' : '#DC2626',
    }] : []),
    ...(effectiveHasCurrent ? [{
      name: livePrice ? "Live Value" : "Today's Value",
      amount: effectiveCurrentValue,
      gainPct: effectiveCurrentGainPct,
      fill: effectiveCurrentGainPct >= 0 ? '#0D9488' : '#DC2626',
    }] : []),
  ]

  // Copy share link
  const handleCopyLink = () => {
    const url = `${window.location.origin}/?ipo=${ipo.id}&amt=${invested}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  // Share on WhatsApp
  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `📊 WhatIfIPO.in: What if I invested ${formatIndianCurrency(invested)} in ${ipo.name} IPO?\n\n` +
      `• Shares Allotted: ${shares} shares (${lots} lot${lots > 1 ? 's' : ''})\n` +
      `• Issue Price: ${formatIndianCurrency(ipo.issue_price)}\n` +
      (hasListing ? `• Listing Day: ${formatIndianCurrency(listing_value)} (${formatPercent(listing_gain_pct)})\n` : '') +
      (effectiveHasCurrent ? `• Today's Value: ${formatIndianCurrency(effectiveCurrentValue)} (${formatPercent(effectiveCurrentGainPct)})\n` : '') +
      `\nCheck your IPO returns here: ${window.location.origin}/?ipo=${ipo.id}&amt=${invested}`
    )
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank')
  }

  // Download card as PNG using html2canvas
  const handleDownloadImage = async () => {
    if (!cardRef.current || downloading) return
    setDownloading(true)
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      })
      const link = document.createElement('a')
      link.download = `WhatIfIPO-${ipo.symbol || ipo.name.replace(/\s+/g, '_')}-Returns.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (err) {
      console.error('Error generating image:', err)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="mt-6 space-y-4 animate-fade-in">
      {/* Printable / downloadable snapshot container */}
      <div ref={cardRef} className="bg-white rounded-3xl p-6 card-shadow-lg border border-gray-100 space-y-6">
        
        {/* IPO Header */}
        <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-primary-600 bg-primary-50 px-2 py-0.5 rounded-md">
                WhatIfIPO.in
              </span>
              {result.current_price && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Market Feed: {formatIndianCurrency(result.current_price)}
                </span>
              )}
              {result.listing_date && (
                <span className="text-xs text-gray-500 font-medium">
                  Launch Date: {new Date(result.listing_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              )}
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900">{ipo.name}</h2>
            <div className="flex items-center flex-wrap gap-2 mt-2">
              {ipo.sector && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary-700">
                  {ipo.sector}
                </span>
              )}
              {ipo.exchange && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                  {ipo.exchange}
                </span>
              )}
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                Issue: {formatIndianCurrency(ipo.issue_price)}
              </span>
            </div>
          </div>

          <div className="text-right flex-shrink-0 bg-gray-50 border border-gray-100 rounded-2xl p-3">
            <div className="text-xs text-gray-400 mb-0.5">Initial Investment</div>
            <div className="text-xl font-extrabold text-gray-900">{formatIndianCurrency(invested)}</div>
            {lots > 0 && (
              <div className="text-xs font-medium text-gray-500 mt-0.5">
                {lots} lot{lots > 1 ? 's' : ''} ({shares} shares)
              </div>
            )}
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <MetricCard title="Shares You'd Get" value={shares} isShares />
          <MetricCard
            title="On Listing Day"
            value={listing_value}
            gain={listing_gain}
            gainPct={listing_gain_pct}
            isUnavailable={!hasListing}
            subtitle={result.listing_price ? `Launch Price: ${formatIndianCurrency(result.listing_price)}` : null}
          />
          <MetricCard
            title={effectiveCurrentPrice ? "Live Market Value" : "Today's Value"}
            value={effectiveCurrentValue}
            gain={effectiveCurrentGain}
            gainPct={effectiveCurrentGainPct}
            isUnavailable={!effectiveHasCurrent}
            subtitle={effectiveCurrentPrice ? `Live Price: ${formatIndianCurrency(effectiveCurrentPrice)}` : null}
          />
        </div>

        {/* Visual Growth Chart (Recharts) */}
        {(hasListing || effectiveHasCurrent) && (
          <div className="bg-slate-50/70 border border-slate-100 rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary-600" />
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Wealth Journey (₹)
                </span>
              </div>
              {effectiveHasCurrent && effectiveCurrentGainPct !== null && (
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${effectiveCurrentGainPct >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  Overall: {formatPercent(effectiveCurrentGainPct)}
                </span>
              )}
            </div>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: '#64748B', fontWeight: 500 }}
                    axisLine={{ stroke: '#E2E8F0' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#94A3B8' }}
                    tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(0,0,0,0.03)' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        return (
                          <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-xl text-xs">
                            <p className="font-semibold text-gray-500 mb-1">{data.name}</p>
                            <p className="text-base font-bold text-gray-900">{formatIndianCurrency(data.amount)}</p>
                            {data.gainPct !== undefined && (
                              <p className={`font-semibold mt-1 ${data.gainPct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatPercent(data.gainPct)} vs Invested
                              </p>
                            )}
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar
                    dataKey="amount"
                    radius={[8, 8, 0, 0]}
                    maxBarSize={60}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Bottom note */}
        <div className="bg-blue-50/80 rounded-xl px-4 py-3 flex items-start gap-2.5">
          <IndianRupee className="w-4 h-4 text-primary-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-primary-800 leading-relaxed">
            Issue price: <strong>{formatIndianCurrency(ipo.issue_price)}</strong> · Lot size: <strong>{ipo.lot_size} shares</strong>.
            {' '}Assuming full retail allotment. Real-world returns may vary based on actual allotment ratio, brokerage, and taxes.
          </p>
        </div>
      </div>

      {/* Action / Share Bar (HTML2Canvas & Web Share) */}
      <div className="bg-white rounded-2xl p-4 card-shadow border border-gray-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
          <Share2 className="w-4 h-4 text-gray-400" />
          Share calculation:
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {/* WhatsApp */}
          <button
            onClick={handleWhatsAppShare}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366]/20 transition-all active:scale-95"
          >
            WhatsApp
          </button>

          {/* Download Image (html2canvas) */}
          <button
            onClick={handleDownloadImage}
            disabled={downloading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all active:scale-95 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            {downloading ? 'Exporting...' : 'Save Image'}
          </button>

          {/* Copy Link */}
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-primary-50 text-primary-700 hover:bg-primary-100 transition-all active:scale-95"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>
      </div>
    </div>
  )
}
