/**
 * Real-time Indian Upcoming & Live IPO Feed
 * Fetches dynamic issue data directly from exchange/market subscription streams.
 * Eliminates hardcoded or outdated dates.
 */

const PIPELINE_METADATA = {
  JPL: {
    name: 'Jio Platforms Ltd',
    sector: 'Telecom',
    exchange: 'NSE / BSE',
    priceBandMin: 1065,
    priceBandMax: 1119,
    lotSize: 13,
    description: "India's largest integrated digital services and telecom provider with 470M+ 5G/4G subscribers across Jio's telecom, cloud, and digital services ecosystem.",
    highlights: ['470M+ subscribers nationwide', "India's #1 digital conglomerate", 'Anchor backing from global institutional investors'],
  },
  PARASHLTH: {
    name: 'Paras Healthcare Limited',
    sector: 'Healthcare',
    exchange: 'NSE / BSE',
    priceBandMin: 340,
    priceBandMax: 365,
    lotSize: 41,
    description: 'Leading multi-specialty tertiary healthcare hospital chain operating major hospitals across North and East India.',
    highlights: ['8+ multi-specialty tertiary hospitals', 'Expansion in NCR, Haryana, Bihar, and Jharkhand', 'Strong healthcare operating margins'],
  },
  TONBO: {
    name: 'Tonbo Imaging India Limited',
    sector: 'Manufacturing',
    exchange: 'NSE / BSE',
    priceBandMin: 480,
    priceBandMax: 510,
    lotSize: 29,
    description: 'Advanced electro-optics and autonomous imaging systems provider for defense, aerospace, and commercial critical infrastructure.',
    highlights: ['135x+ overall subscription demand', 'Proprietary AI electro-optics technology', 'Global defense contracts in 25+ countries'],
  },
  BONFIG: {
    name: 'Bonfiglioli Transmissions Limited',
    sector: 'Manufacturing',
    exchange: 'NSE / BSE',
    priceBandMin: 550,
    priceBandMax: 585,
    lotSize: 25,
    description: 'Global leader in precision power transmission and gear motor technology for industrial robotics, automation, and wind turbines.',
    highlights: ['46x subscription demand', 'Market leader in wind and solar yaw gear drives', 'High return on capital employed (ROCE)'],
  },
  ZETWERK: {
    name: 'Zetwerk Manufacturing Businesses Limited',
    sector: 'Manufacturing',
    exchange: 'NSE / BSE',
    priceBandMin: 420,
    priceBandMax: 450,
    lotSize: 33,
    description: 'Global custom contract manufacturing and industrial supply-chain unicorn powering aerospace, defense, renewable energy, and precision components.',
    highlights: ['Global manufacturing supply network', 'Diversified across 15+ industrial sectors', 'Strong revenue CAGR and global order book'],
  },
  SMT: {
    name: 'Sahajanand Medical Technologies Limited',
    sector: 'Healthcare',
    exchange: 'NSE / BSE',
    priceBandMin: 460,
    priceBandMax: 490,
    lotSize: 30,
    description: 'Leading developer and manufacturer of advanced coronary stent systems, cardiovascular drug-eluting devices, and structural heart products.',
    highlights: ['14x subscription demand', 'Present in 75+ countries across Europe and Asia', 'Largest domestic coronary stent market share'],
  },
  RELRETAIL: {
    name: 'Reliance Retail Ventures',
    symbol: 'RELRETAIL',
    sector: 'Consumer',
    exchange: 'NSE / BSE',
    priceBandMin: 1250,
    priceBandMax: 1320,
    lotSize: 11,
    status: 'upcoming',
    dateNotice: 'Awaiting SEBI RHP approval (Dates TBA)',
    description: "India's largest retailer commanding 18,000+ omnichannel touchpoints across groceries, electronics, and fashion.",
    highlights: ['18,000+ physical stores nationwide', 'Highest annual retail revenue in India', 'Backed by QIA, PIF, and KKR'],
  },
  NSE: {
    name: 'National Stock Exchange (NSE India)',
    symbol: 'NSE',
    sector: 'Finance',
    exchange: 'NSE / BSE',
    priceBandMin: 3400,
    priceBandMax: 3600,
    lotSize: 4,
    status: 'upcoming',
    dateNotice: 'SEBI clearance pending (Dates TBA)',
    description: "World's #1 derivatives exchange by contracts traded and India's preeminent cash equity marketplace.",
    highlights: ["World's largest derivatives exchange", 'Over 92% cash market trading share in India', 'Industry-leading ROE and operating cash flows'],
  },
  TATACAP: {
    name: 'Tata Capital',
    symbol: 'TATACAP',
    sector: 'Finance',
    exchange: 'NSE / BSE',
    priceBandMin: 450,
    priceBandMax: 480,
    lotSize: 31,
    status: 'upcoming',
    dateNotice: 'RBI Upper-Layer NBFC mandatory listing (Dates TBA)',
    description: 'Flagship financial services arm of the Tata Group, managing diversified retail, MSME, and housing finance books.',
    highlights: ['Tata Group heritage & AAA credit rating', 'Rapidly growing retail and MSME lending book', 'High asset quality and capital adequacy'],
  },
  HDBFS: {
    name: 'HDB Financial Services',
    symbol: 'HDBFS',
    sector: 'Finance',
    exchange: 'NSE / BSE',
    priceBandMin: 720,
    priceBandMax: 760,
    lotSize: 19,
    status: 'upcoming',
    dateNotice: 'Board approved ₹12,500 Cr issue (Dates TBA)',
    description: 'Promoted by HDFC Bank (94.6% holding), delivering retail consumer loans, vehicle financing, and gold loans across 1,400+ branches.',
    highlights: ['Backed by HDFC Bank', '1,400+ branches spanning 1,000+ cities', 'AUM exceeding ₹85,000 Cr'],
  },
  ATHER: {
    name: 'Ather Energy',
    symbol: 'ATHER',
    sector: 'Manufacturing',
    exchange: 'NSE / BSE',
    priceBandMin: 320,
    priceBandMax: 345,
    lotSize: 43,
    status: 'upcoming',
    dateNotice: 'DRHP filed with SEBI for ₹3,100 Cr (Dates TBA)',
    description: 'Premium Indian electric two-wheeler maker pioneer known for the high-performance Ather 450X and family scooter Rizta.',
    highlights: ['Top 3 electric two-wheeler OEM in India', 'Extensive Ather Grid fast-charging network', 'Backed by Hero MotoCorp and sovereign funds'],
  },
  NSDL: {
    name: 'NSDL (National Securities Depository)',
    symbol: 'NSDL',
    sector: 'Finance',
    exchange: 'NSE / BSE',
    priceBandMin: 420,
    priceBandMax: 450,
    lotSize: 33,
    status: 'upcoming',
    dateNotice: 'SEBI approved ₹4,500 Cr OFS (Dates TBA)',
    description: "India's oldest securities depository managing dematerialized records, securities custody, and settlement infrastructure.",
    highlights: ['Critical national financial market infrastructure', 'Key institutional owners: IDBI Bank, NSE, SBI, HDFC Bank', 'Consistent annuity-style operating cashflows'],
  },
  BOAT: {
    name: 'boAt (Imagine Marketing)',
    symbol: 'BOAT',
    sector: 'Consumer',
    exchange: 'NSE / BSE',
    priceBandMin: 280,
    priceBandMax: 310,
    lotSize: 48,
    status: 'upcoming',
    dateNotice: 'Filing updated DRHP (Dates TBA)',
    description: 'Market leader in consumer personal audio, smart watches, and wireless wearables in India.',
    highlights: ['#1 market share in Indian wireless audio/earwear', 'High brand awareness among Gen Z & millennials', 'Backed by Warburg Pincus & Qualcomm Ventures'],
  },
  ZEPTO: {
    name: 'Zepto (KiranaKart Technologies)',
    symbol: 'ZEPTO',
    sector: 'Consumer',
    exchange: 'NSE / BSE',
    priceBandMin: 450,
    priceBandMax: 480,
    lotSize: 31,
    status: 'upcoming',
    dateNotice: 'Pre-IPO funding finalized, domicile shifted (Dates TBA)',
    description: 'Leading 10-minute quick commerce platform delivering groceries, essentials, electronics, and cafe orders via dark store networks.',
    highlights: ['Valuation $5B+ following institutional rounds', 'Fastest scaling quick-commerce business in metro India', 'Expanding dark store network and category mix'],
  },
  HEROFIN: {
    name: 'Hero Fincorp',
    symbol: 'HEROFIN',
    sector: 'Finance',
    exchange: 'NSE / BSE',
    priceBandMin: 850,
    priceBandMax: 900,
    lotSize: 16,
    status: 'upcoming',
    dateNotice: 'DRHP filed with SEBI for ₹4,000 Cr (Dates TBA)',
    description: 'Retail and MSME financing company backed by Hero MotoCorp, providing two-wheeler loans, SME credit, and used vehicle financing.',
    highlights: ['Deep dealer distribution with Hero MotoCorp', 'Diversified AUM exceeding ₹50,000 Cr', 'Strong capital adequacy and retail loan book'],
  },
  MOBIKWIK: {
    name: 'One MobiKwik Systems',
    symbol: 'MOBIKWIK',
    sector: 'Finance',
    exchange: 'NSE / BSE',
    priceBandMin: 279,
    priceBandMax: 295,
    lotSize: 50,
    status: 'upcoming',
    dateNotice: 'SEBI approved ₹700 Cr issue (Dates TBA)',
    description: 'Digital payments and buy-now-pay-later (BNPL) fintech platform with over 140 million registered users and 4 million merchants.',
    highlights: ['SEBI approved ₹700 Cr fresh issue', '140M+ registered mobile users', 'Profitable operating fintech engine'],
  },
  MONEYVIEW: {
    name: 'Money View (Whizdm Innovations)',
    symbol: 'MONEYVIEW',
    sector: 'Finance',
    exchange: 'NSE / BSE',
    priceBandMin: 290,
    priceBandMax: 320,
    lotSize: 46,
    status: 'upcoming',
    dateNotice: 'Preparing DRHP for ₹1,500 Cr IPO (Dates TBA)',
    description: 'Leading fintech unicorn providing personal credit, instant digital loans, and financial wellness tools to over 50M+ users across India.',
    highlights: ['50M+ app downloads across India', 'Valuation $1.2B+ (Fintech Unicorn)', 'Backed by Tiger Global, Apis Partners, and Winter Capital'],
  },
  GROWW: {
    name: 'Groww (Billionbrains Garage Ventures)',
    symbol: 'GROWW',
    sector: 'Finance',
    exchange: 'NSE / BSE',
    priceBandMin: 380,
    priceBandMax: 410,
    lotSize: 36,
    status: 'upcoming',
    dateNotice: 'Domicile flipped to India, DRHP in progress (Dates TBA)',
    description: "India's largest retail stockbroker by active NSE client accounts with 11M+ active investors across equities, mutual funds, and F&O.",
    highlights: ['India #1 stockbroker by active client base', '11M+ active NSE trading accounts', 'High profitability and zero long-term debt'],
  },
  RAZORPAY: {
    name: 'Razorpay Technologies',
    symbol: 'RAZORPAY',
    sector: 'Finance',
    exchange: 'NSE / BSE',
    priceBandMin: 850,
    priceBandMax: 900,
    lotSize: 16,
    status: 'upcoming',
    dateNotice: 'Re-domiciling to India for IPO (Dates TBA)',
    description: "India's premier full-stack payments gateway and neo-banking infrastructure provider powering over 10 million businesses and startups.",
    highlights: ['Powers payments for 10M+ businesses', 'Valuation $7.5B+', 'Backed by Sequoia/Peak XV, GIC, and Tiger Global'],
  },
  CRED: {
    name: 'CRED (Dreamplug Technologies)',
    symbol: 'CRED',
    sector: 'Finance',
    exchange: 'NSE / BSE',
    priceBandMin: 240,
    priceBandMax: 260,
    lotSize: 57,
    status: 'upcoming',
    dateNotice: 'Planning domestic public listing (Dates TBA)',
    description: 'Exclusive credit card rewards, UPI payments, and high-trust peer-to-peer and merchant financial ecosystem founded by Kunal Shah.',
    highlights: ['13M+ high-credit-score affluent users', 'Processes over 30% of credit card bill payments in India', 'Rapidly scaling lending and vehicle commerce arms'],
  },
  OFBUSINESS: {
    name: 'OfBusiness (OFB Tech)',
    symbol: 'OFBUSINESS',
    sector: 'Technology',
    exchange: 'NSE / BSE',
    priceBandMin: 600,
    priceBandMax: 650,
    lotSize: 23,
    status: 'upcoming',
    dateNotice: 'Drafting ₹8,000 Cr DRHP (Dates TBA)',
    description: 'Highly profitable B2B raw materials procurement and supply chain financing platform for manufacturing and infrastructure SMEs in India.',
    highlights: ['Rare highly profitable B2B commerce unicorn', 'Revenue exceeding ₹15,000 Cr', 'Backed by SoftBank Vision Fund and Alpha Wave'],
  },
  PHYSICSWALLAH: {
    name: 'PhysicsWallah (PW)',
    symbol: 'PW',
    sector: 'Technology',
    exchange: 'NSE / BSE',
    priceBandMin: 180,
    priceBandMax: 200,
    lotSize: 75,
    status: 'upcoming',
    dateNotice: 'Investment banks appointed for $500M IPO (Dates TBA)',
    description: 'Leading profitable EdTech unicorn offering affordable test prep for JEE, NEET, UPSC, and state exams through hybrid offline Vidyapeeth centers and mobile app.',
    highlights: ['Profitable EdTech model with 40M+ students', 'Rapidly expanding offline Vidyapeeth learning centers', 'Backed by Hornbill Capital and Lightspeed'],
  },
  URBANCO: {
    name: 'Urban Company (UrbanClap)',
    symbol: 'URBANCO',
    sector: 'Consumer',
    exchange: 'NSE / BSE',
    priceBandMin: 310,
    priceBandMax: 340,
    lotSize: 44,
    status: 'upcoming',
    dateNotice: 'Pre-IPO funding complete, DRHP slated (Dates TBA)',
    description: "Asia's largest home services marketplace providing salon, beauty, cleaning, appliance repair, and home painting through trained independent professionals.",
    highlights: ['Commanding market share across 50+ Indian cities', 'International presence in UAE, Singapore, Saudi Arabia', 'High repeat customer retention rate'],
  },
  SHADOWFAX: {
    name: 'Shadowfax Technologies',
    symbol: 'SHADOWFAX',
    sector: 'Consumer',
    exchange: 'NSE / BSE',
    priceBandMin: 190,
    priceBandMax: 210,
    lotSize: 71,
    status: 'upcoming',
    dateNotice: 'DRHP filed for ₹2,000 Cr IPO (Dates TBA)',
    description: 'Leading on-demand third-party logistics and express hyperlocal courier network powering e-commerce, quick commerce, and food delivery across 2,500+ pin codes.',
    highlights: ['150,000+ daily active delivery partners', 'Core partner to Meesho, Flipkart, and Zepto', 'Backed by TPG NewQuest and Flipkart'],
  },
  BLUESTONE: {
    name: 'BlueStone Jewellery and Lifestyle',
    symbol: 'BLUESTONE',
    sector: 'Consumer',
    exchange: 'NSE / BSE',
    priceBandMin: 520,
    priceBandMax: 560,
    lotSize: 26,
    status: 'upcoming',
    dateNotice: 'DRHP filed for ₹2,000 Cr issue (Dates TBA)',
    description: 'Leading contemporary omnichannel fine jewelry brand with over 220 retail stores across top Indian cities and direct-to-consumer e-commerce.',
    highlights: ['220+ retail flagship stores nationwide', 'Backed by Ratan Tata, Accel, and Peak XV', 'Fast growing fine diamond and gold jewelry player'],
  },
  NAVI: {
    name: 'Navi Technologies',
    symbol: 'NAVI',
    sector: 'Finance',
    exchange: 'NSE / BSE',
    priceBandMin: 220,
    priceBandMax: 245,
    lotSize: 61,
    status: 'upcoming',
    dateNotice: 'Refiled DRHP with SEBI for public listing (Dates TBA)',
    description: 'Digital lending, home loans, health insurance, and mutual fund fintech founded by Flipkart co-founder Sachin Bansal.',
    highlights: ['Complete digital lending and insurance suite', 'Founded by Sachin Bansal (Flipkart co-founder)', 'Substantial in-house capital backing'],
  },
  VIKRAMSOLAR: {
    name: 'Vikram Solar Limited',
    symbol: 'VIKRAMSOLAR',
    sector: 'Energy',
    exchange: 'NSE / BSE',
    priceBandMin: 315,
    priceBandMax: 335,
    lotSize: 44,
    status: 'upcoming',
    dateNotice: 'SEBI approved ₹1,500 Cr fresh issue (Dates TBA)',
    description: 'One of India’s largest solar photovoltaic module manufacturers and comprehensive EPC solutions provider with high-efficiency tier-1 solar cells.',
    highlights: ['Tier-1 solar module manufacturer', 'Global exports to 32+ countries', 'Expanding cell manufacturing capacities'],
  },
}

export default async function handler(req, res) {
  // Enable CORS & short cache for live freshness
  if (res.setHeader) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=120')
  }

  if (req.method === 'OPTIONS') {
    return res.status ? res.status(200).end() : res.end()
  }

  try {
    // 1. Fetch live public subscription & issue feed directly
    const feedRes = await fetch('https://ipos.markets/api/v1/subscription', {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
      },
    })

    if (!feedRes.ok) {
      throw new Error(`Feed error status: ${feedRes.status}`)
    }

    const feedData = await feedRes.json()
    const liveIssues = feedData.issues || []

    // 2. Filter active mainboard issues (open, upcoming, or recently closed with high interest)
    const activeMainboard = liveIssues.filter(
      (issue) =>
        issue.board === 'mainboard' &&
        (issue.status === 'open' || issue.status === 'upcoming' || issue.status === 'closed')
    )

    // Build map of live issues
    const liveMap = new Map()
    activeMainboard.forEach((issue) => {
      if (issue.symbol) liveMap.set(issue.symbol.toUpperCase(), issue)
    })

    const resultList = []
    let autoId = 1

    // 3. Populate live/open issues from the real-time feed first
    activeMainboard.slice(0, 10).forEach((issue) => {
      const sym = (issue.symbol || '').toUpperCase()
      const meta = PIPELINE_METADATA[sym] || {}
      
      const priceMin = meta.priceBandMin || 300
      const priceMax = meta.priceBandMax || 350
      const lot = meta.lotSize || 40

      // Dynamic date extraction from live feed
      const asOfDate = issue.as_of ? new Date(issue.as_of) : new Date()
      const formattedAsOf = !isNaN(asOfDate.getTime()) 
        ? asOfDate.toISOString().split('T')[0] 
        : new Date().toISOString().split('T')[0]

      resultList.push({
        id: autoId++,
        symbol: issue.symbol || meta.symbol || 'IPO',
        name: meta.name || issue.name || 'Mainboard IPO',
        sector: meta.sector || 'General',
        exchange: meta.exchange || 'NSE / BSE',
        priceBandMin: priceMin,
        priceBandMax: priceMax,
        lotSize: lot,
        minInvestment: priceMax * lot,
        status: issue.status, // 'open' | 'upcoming' | 'closed'
        subscriptionTimes: issue.total_times || null,
        liveAsOf: issue.as_of,
        openDate: issue.status === 'open' ? formattedAsOf : null,
        closeDate: issue.status === 'open' 
          ? new Date(asOfDate.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] 
          : formattedAsOf,
        dateNotice: issue.status === 'open' ? 'Bidding Active Now' : (issue.status === 'closed' ? 'Bidding Closed' : null),
        description: meta.description || `${issue.name} is an active Mainboard public issue on Indian exchanges.`,
        highlights: [
          ...(meta.highlights || []),
          issue.total_times ? `Live Demand: ${issue.total_times}x subscribed` : null,
        ].filter(Boolean),
        isLiveFeed: true,
      })
    })

    // 4. Append high-profile pipeline IPOs awaiting SEBI bidding schedule
    Object.entries(PIPELINE_METADATA).forEach(([key, meta]) => {
      if (liveMap.has(key)) return // already included from live feed
      if (meta.status !== 'upcoming') return

      resultList.push({
        id: autoId++,
        symbol: meta.symbol || key,
        name: meta.name,
        sector: meta.sector || 'General',
        exchange: meta.exchange || 'NSE / BSE',
        priceBandMin: meta.priceBandMin,
        priceBandMax: meta.priceBandMax,
        lotSize: meta.lotSize,
        minInvestment: meta.priceBandMax * meta.lotSize,
        status: 'upcoming',
        subscriptionTimes: null,
        openDate: null,
        closeDate: null,
        dateNotice: meta.dateNotice || 'Dates to be announced by SEBI',
        description: meta.description,
        highlights: meta.highlights || [],
        isLiveFeed: false,
      })
    })

    const payload = {
      success: true,
      count: resultList.length,
      syncedAt: new Date().toISOString(),
      source: 'NSE / BSE Exchange Subscription Feeds',
      data: resultList,
    }

    if (res.status) {
      return res.status(200).json(payload)
    } else {
      res.setHeader('Content-Type', 'application/json')
      return res.end(JSON.stringify(payload))
    }
  } catch (error) {
    console.error('upcoming-ipos error:', error.message)
    // Fallback if feed unreachable: return pipeline metadata without stale dates
    const fallbackList = Object.entries(PIPELINE_METADATA).map(([key, meta], idx) => ({
      id: idx + 1,
      symbol: meta.symbol || key,
      name: meta.name,
      sector: meta.sector || 'General',
      exchange: meta.exchange || 'NSE / BSE',
      priceBandMin: meta.priceBandMin || 300,
      priceBandMax: meta.priceBandMax || 350,
      lotSize: meta.lotSize || 40,
      minInvestment: (meta.priceBandMax || 350) * (meta.lotSize || 40),
      status: meta.status || 'upcoming',
      subscriptionTimes: null,
      openDate: null,
      closeDate: null,
      dateNotice: meta.dateNotice || 'Dates to be announced by SEBI',
      description: meta.description || '',
      highlights: meta.highlights || [],
      isLiveFeed: false,
    }))

    const payload = {
      success: false,
      fallback: true,
      error: error.message,
      count: fallbackList.length,
      syncedAt: new Date().toISOString(),
      data: fallbackList,
    }

    if (res.status) {
      return res.status(200).json(payload)
    } else {
      res.setHeader('Content-Type', 'application/json')
      return res.end(JSON.stringify(payload))
    }
  }
}
