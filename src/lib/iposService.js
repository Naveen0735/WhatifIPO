import { FALLBACK_IPOS } from '../data/fallbackIpos'

/**
 * 100% Standalone Primary Market IPO Catalog
 * Operates purely on the verified 199+ Indian Mainboard IPO master list.
 * Zero database overhead, zero environment variable requirements.
 */

// Sorted master catalog of listed IPOs
const LISTED_IPOS = [...FALLBACK_IPOS]
  .filter((ipo) => ipo.listing_date && ipo.listing_price)
  .sort((a, b) => {
    const da = a.listing_date ? new Date(a.listing_date).getTime() : 0
    const db = b.listing_date ? new Date(b.listing_date).getTime() : 0
    return db - da
  })

/**
 * Get all listed Indian IPOs (2002 - Present)
 */
export async function getMergedIPOs() {
  return LISTED_IPOS
}

/**
 * Search across IPO catalog (by name, symbol, sector)
 */
export async function searchMergedIPOs(q) {
  if (!q || !q.trim()) return []
  const lowerQ = q.toLowerCase().trim()

  return LISTED_IPOS.filter((ipo) => {
    return (
      ipo.name?.toLowerCase().includes(lowerQ) ||
      ipo.symbol?.toLowerCase().includes(lowerQ) ||
      ipo.sector?.toLowerCase().includes(lowerQ)
    )
  }).slice(0, 10)
}

/**
 * Return curated popular & suggested IPOs for quick selection when search is focused
 */
export async function getSuggestedIPOs(limit = 10) {
  const popularSymbols = [
    'ZOMATO',
    'DMART',
    'TATATECH',
    'IRCTC',
    'MAZDOCK',
    'COALINDIA',
    'RPOWER',
    'PAYTM',
    'LICI',
    'SWIGGY',
    'WAAREEENER',
    'BAJAJHFL',
    'HAL',
    'IREDA',
    'MANKIND',
  ]

  const map = new Map(LISTED_IPOS.map((i) => [i.symbol?.toUpperCase(), i]))
  const curated = popularSymbols.map((sym) => map.get(sym)).filter(Boolean)

  if (curated.length >= limit) return curated.slice(0, limit)

  // Append recent listings if needed
  const existingIds = new Set(curated.map((i) => i.id))
  for (const item of LISTED_IPOS) {
    if (!existingIds.has(item.id)) {
      curated.push(item)
      if (curated.length >= limit) break
    }
  }
  return curated
}

/**
 * Get single IPO by ID or symbol
 */
export async function getIPOById(id) {
  if (!id) return null
  const numId = Number(id)
  return (
    LISTED_IPOS.find((i) => i.id === numId || String(i.id) === String(id) || i.symbol?.toUpperCase() === String(id).toUpperCase()) || null
  )
}
