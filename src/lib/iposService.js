import { supabase } from './supabase'
import { FALLBACK_IPOS } from '../data/fallbackIpos'

/**
 * Merge Supabase IPOs with extended historical dataset.
 * Supabase entries take priority for real-time price accuracy.
 */
export async function getMergedIPOs() {
  try {
    const { data: supabaseData, error } = await supabase
      .from('ipos')
      .select('*')
      .order('listing_date', { ascending: false })

    if (error) {
      console.warn('Supabase fetch error, falling back to extended dataset:', error.message)
      return FALLBACK_IPOS
    }

    const dbIpos = supabaseData || []
    
    // Create lookup maps for fast matching by symbol and sanitized name
    const fallbackMap = new Map()
    FALLBACK_IPOS.forEach(item => {
      if (item.symbol) fallbackMap.set(item.symbol.toUpperCase(), item)
      if (item.name) fallbackMap.set(item.name.toLowerCase().trim(), item)
    })

    // Deep merge: If Supabase row has missing/null fields, hydrate them from fallback catalog
    const mergedDbIpos = dbIpos.map(dbItem => {
      const fb = (dbItem.symbol && fallbackMap.get(dbItem.symbol.toUpperCase())) ||
                 (dbItem.name && fallbackMap.get(dbItem.name.toLowerCase().trim()))
      if (!fb) return dbItem
      return {
        ...fb,
        ...dbItem,
        listing_price: dbItem.listing_price ?? fb.listing_price ?? null,
        listing_date: dbItem.listing_date ?? fb.listing_date ?? null,
        current_price: dbItem.current_price ?? fb.current_price ?? null,
        issue_price: dbItem.issue_price ?? fb.issue_price ?? null,
        lot_size: dbItem.lot_size ?? fb.lot_size ?? 1,
        min_investment: dbItem.min_investment ?? fb.min_investment ?? 0,
        sector: dbItem.sector ?? fb.sector ?? 'Others',
        exchange: dbItem.exchange ?? fb.exchange ?? 'NSE / BSE',
      }
    })

    const existingSymbols = new Set(mergedDbIpos.map((i) => i.symbol?.toUpperCase()))
    const existingNames = new Set(mergedDbIpos.map((i) => i.name?.toLowerCase().trim()))

    // Include fallback IPOs that aren't already present in Supabase
    const additional = FALLBACK_IPOS.filter(
      (item) =>
        !existingSymbols.has(item.symbol?.toUpperCase()) &&
        !existingNames.has(item.name?.toLowerCase().trim())
    )

    const all = [...mergedDbIpos, ...additional]

    // Only include listed IPOs that have actually debuted on the exchange.
    // Exclude upcoming/unlisted pipeline issues (such as Jio Platforms, Reliance Retail, Ather, etc.)
    const UPCOMING_SYMBOLS = new Set(['JIOP', 'JIOPLATFORMS', 'RELRETAIL', 'ATHER', 'BOAT', 'OYO', 'ZEPTO', 'PINELABS', 'HEROFIN', 'HDBFS'])
    const listedOnly = all.filter((ipo) => {
      const sym = ipo.symbol?.toUpperCase()
      const name = ipo.name?.toLowerCase() || ''
      if (UPCOMING_SYMBOLS.has(sym)) return false
      if (name.includes('jio platforms')) return false
      if (!ipo.listing_date) return false
      return true
    })

    // Sort by listing date descending
    listedOnly.sort((a, b) => {
      const da = a.listing_date ? new Date(a.listing_date).getTime() : 0
      const db = b.listing_date ? new Date(b.listing_date).getTime() : 0
      return db - da
    })

    return listedOnly
  } catch (err) {
    console.error('getMergedIPOs error:', err)
    return FALLBACK_IPOS.filter(i => i.listing_date && i.symbol !== 'JIOP' && !i.name?.toLowerCase().includes('jio platforms'))
  }
}

/**
 * Search across merged IPO catalog (by name, symbol, sector).
 */
export async function searchMergedIPOs(q) {
  if (!q || !q.trim()) return []
  const all = await getMergedIPOs()
  const lowerQ = q.toLowerCase().trim()

  return all.filter((ipo) => {
    return (
      ipo.name?.toLowerCase().includes(lowerQ) ||
      ipo.symbol?.toLowerCase().includes(lowerQ) ||
      ipo.sector?.toLowerCase().includes(lowerQ)
    )
  }).slice(0, 10)
}

/**
 * Return curated popular & suggested IPOs for quick selection when search is focused.
 */
export async function getSuggestedIPOs(limit = 8) {
  const all = await getMergedIPOs()
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

  const map = new Map(all.map((i) => [i.symbol?.toUpperCase(), i]))
  const curated = popularSymbols.map((sym) => map.get(sym)).filter(Boolean)

  if (curated.length >= limit) return curated.slice(0, limit)

  // Append recent listings if needed
  const existingIds = new Set(curated.map((i) => i.id))
  for (const item of all) {
    if (!existingIds.has(item.id)) {
      curated.push(item)
      if (curated.length >= limit) break
    }
  }
  return curated
}

/**
 * Get single IPO by ID
 */
export async function getIPOById(id) {
  if (!id) return null
  const numId = Number(id)
  
  // Try Supabase first
  try {
    const { data } = await supabase
      .from('ipos')
      .select('*')
      .eq('id', numId)
      .single()

    if (data) return data
  } catch {
    // Ignore and fallback
  }

  // Check fallback
  return FALLBACK_IPOS.find((i) => i.id === numId) || null
}
