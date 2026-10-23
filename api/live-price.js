// Vercel Serverless Function: /api/live-price
// Dynamically queries live internet market data whenever a customer searches / calculates a stock on the site.

const SYMBOL_MAP = {
  ZOMATO: 'ETERNAL.NS',
  PAYTM: 'PAYTM.NS',
  NYKAA: 'NYKAA.NS',
  POLICYBZR: 'POLICYBZR.NS',
  DELHIVERY: 'DELHIVERY.NS',
  LICI: 'LICI.NS',
  IRCTC: 'IRCTC.NS',
  TATATECH: 'TATATECH.NS',
  HONASA: 'HONASA.NS',
  OLAELEC: 'OLAELEC.NS',
  HYUNDAI: 'HYUNDAI.NS',
  SWIGGY: 'SWIGGY.NS',
  BAJAJHFL: 'BAJAJHFL.NS',
  BRAINBEES: 'BRAINBEES.NS',
  WAAREEENER: 'WAAREEENER.NS',
  DMART: 'DMART.NS',
  COALINDIA: 'COALINDIA.NS',
  RPOWER: 'RPOWER.NS',
  HAL: 'HAL.NS',
  MAZDOCK: 'MAZDOCK.NS',
  IREDA: 'IREDA.NS',
  MANKIND: 'MANKIND.NS',
  SBICARD: 'SBICARD.NS',
  KAYNES: 'KAYNES.NS',
  BIKAJI: 'BIKAJI.NS',
  KALYANKJIL: 'KALYANKJIL.NS',
  DOMS: 'DOMS.NS',
  CELLO: 'CELLO.NS',
  METROBRAND: 'METROBRAND.NS',
  CAMPUS: 'CAMPUS.NS',
  NAZARA: 'NAZARA.NS',
  MAPMYINDIA: 'MAPMYINDIA.NS',
  RATEGAIN: 'RATEGAIN.NS',
  KFINTECH: 'KFINTECH.NS',
  MEDANTA: 'MEDANTA.NS',
  PREMIERENE: 'PREMIERENE.NS',
  KRN: 'KRN.NS',
  NETWEB: 'NETWEB.NS',
  IDEAFORGE: 'IDEAFORGE.NS',
  DATAPATTNS: 'DATAPATTNS.NS',
  PARAS: 'PARAS.NS',
  DEVYANI: 'DEVYANI.NS',
  RBA: 'RBA.NS',
  BARBEQUE: 'BARBEQUE.NS',
  EASEMYTRIP: 'EASEMYTRIP.NS',
  CDSL: 'CDSL.NS',
  BSE: 'BSE.NS',
  HDFCLIFE: 'HDFCLIFE.NS',
  ICICIGI: 'ICICIGI.NS',
  SBILIFE: 'SBILIFE.NS',
  UTKARSHBNK: 'UTKARSHBNK.NS',
  UJJIVANSFB: 'UJJIVANSFB.NS',
  COCHINSHIP: 'COCHINSHIP.NS',
  DIXON: 'DIXON.NS',
  ASTRAL: 'ASTRAL.NS',
  HAPPSTMNDS: 'HAPPSTMNDS.NS',
  ROUTE: 'ROUTE.NS',
  CLEAN: 'CLEAN.NS',
  GLAND: 'GLAND.NS',
  RAINBOW: 'RAINBOW.NS',
  SONACOMS: 'SONACOMS.NS',
  CYIENTDLM: 'CYIENTDLM.NS',
  JYOTICNC: 'JYOTICNC.NS',
  ARKADE: 'ARKADE.NS',
  NORTHARC: 'NORTHARC.NS',
}

async function fetchFromMarket(ticker) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?range=max&interval=1d`
  const response = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
  })
  if (!response.ok) return null
  const data = await response.json()
  return data.chart?.result?.[0] || null
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  let symbol = req.query?.symbol
  if (!symbol && req.url) {
    try {
      const parsedUrl = new URL(req.url, 'http://localhost')
      symbol = parsedUrl.searchParams.get('symbol')
    } catch {}
  }

  if (!symbol) {
    return res.status(400).json({ error: 'Missing symbol parameter' })
  }

  const cleanSym = String(symbol).toUpperCase().trim()
  const primaryTicker = SYMBOL_MAP[cleanSym] || `${cleanSym}.NS`

  try {
    // 1. Try Primary Ticker (NSE)
    let result = await fetchFromMarket(primaryTicker)

    // 2. Fallback to BSE (.BO) if primary wasn't found
    if (!result && !primaryTicker.endsWith('.BO')) {
      result = await fetchFromMarket(`${cleanSym}.BO`)
    }

    if (!result) {
      return res.status(404).json({
        error: `Stock ${cleanSym} not found on live market feed`,
        symbol: cleanSym,
      })
    }

    const meta = result.meta
    const currentPrice = meta?.regularMarketPrice || null
    const currency = meta?.currency || 'INR'

    let listingDate = null
    let listingPrice = null

    if (result.timestamp && result.timestamp.length > 0) {
      const firstTimestamp = result.timestamp[0]
      listingDate = new Date(firstTimestamp * 1000).toISOString().split('T')[0]

      const opens = result.indicators?.quote?.[0]?.open
      if (opens && opens.length > 0) {
        const validOpen = opens.find((val) => val != null && !isNaN(val))
        if (validOpen != null) {
          listingPrice = Number(validOpen.toFixed(2))
        }
      }
    }

    return res.status(200).json({
      success: true,
      symbol: cleanSym,
      ticker: primaryTicker,
      current_price: currentPrice,
      listing_price: listingPrice,
      listing_date: listingDate,
      currency,
      day_high: meta?.regularMarketDayHigh || null,
      day_low: meta?.regularMarketDayLow || null,
      fifty_two_week_high: meta?.fiftyTwoWeekHigh || null,
      fifty_two_week_low: meta?.fiftyTwoWeekLow || null,
      is_live: true,
      fetched_at: new Date().toISOString(),
    })
  } catch (err) {
    console.error('live-price API error:', err)
    return res.status(500).json({ error: err.message, symbol: cleanSym })
  }
}
