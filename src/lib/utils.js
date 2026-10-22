import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/**
 * Format number in Indian numbering system with ₹ symbol
 * e.g. 100000 → ₹1,00,000
 */
export function formatIndianCurrency(amount, decimals = 0) {
  if (amount === null || amount === undefined || isNaN(amount)) return '₹0'
  
  const num = Math.abs(Number(amount))
  const sign = Number(amount) < 0 ? '-' : ''
  
  const formatted = num.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
  
  return `${sign}₹${formatted}`
}

/**
 * Format percentage with + or - sign
 */
export function formatPercent(pct) {
  if (pct === null || pct === undefined || isNaN(pct)) return '0%'
  const sign = pct >= 0 ? '+' : ''
  return `${sign}${pct.toFixed(2)}%`
}

/**
 * Calculate IPO returns dynamically from live market data (Launch date, launch price, current price)
 * Shares are always in multiples of lot_size (as per real IPO allotment rules)
 */
export function calculateIPOReturns(amount, ipo, liveData = null) {
  const issue_price = Number(ipo.issue_price)
  const lot_size = Number(ipo.lot_size) || 1

  // Dynamic live prices from internet integration (prioritized over any fallback)
  const effectiveListingPrice =
    liveData?.listing_price != null
      ? Number(liveData.listing_price)
      : ipo.listing_price
      ? Number(ipo.listing_price)
      : null

  const effectiveCurrentPrice =
    liveData?.current_price != null
      ? Number(liveData.current_price)
      : ipo.current_price
      ? Number(ipo.current_price)
      : null

  const effectiveListingDate = liveData?.listing_date || ipo.listing_date || null

  // IPOs are allotted in lots — you can't get a fraction of a lot
  const lots = Math.floor(amount / (issue_price * lot_size))
  const shares = lots * lot_size
  const invested = shares * issue_price

  const hasListing = effectiveListingPrice != null && effectiveListingPrice > 0
  const hasCurrent = effectiveCurrentPrice != null && effectiveCurrentPrice > 0

  const listing_value = hasListing ? shares * effectiveListingPrice : null
  const listing_gain = hasListing ? listing_value - invested : null
  const listing_gain_pct =
    hasListing && invested > 0 ? (listing_gain / invested) * 100 : null

  const current_value = hasCurrent ? shares * effectiveCurrentPrice : null
  const current_gain = hasCurrent ? current_value - invested : null
  const current_gain_pct =
    hasCurrent && invested > 0 ? (current_gain / invested) * 100 : null

  return {
    shares,
    lots,
    invested,
    listing_price: effectiveListingPrice,
    listing_date: effectiveListingDate,
    current_price: effectiveCurrentPrice,
    listing_value,
    listing_gain,
    listing_gain_pct,
    current_value,
    current_gain,
    current_gain_pct,
    hasListing,
    hasCurrent,
    is_live: Boolean(liveData?.is_live),
  }
}

/**
 * Format date as DD MMM YYYY (Indian format)
 */
export function formatDate(dateStr) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}
