# WhatIfIPO.in

> **What if you had invested in that IPO?**  
> An interactive investment return simulator for Indian IPOs with **real-time live market pricing**, dynamic listing returns, and live upcoming exchange feeds.

---

## ⚡ Zero-Configuration & Standalone

WhatIfIPO is **100% self-sufficient** and requires **zero external databases or API keys** to deploy.
- **Zero environment variables required**
- **Zero database maintenance**
- **1-Click Deployment** on Vercel, Netlify, or any static host

---

## 🚀 Live Features

1. **Live Real-Time Market Feed (`/api/live-price`)**
   - Automatically fetches current live market prices and 52-week ranges directly from Indian market feeds (.NS / .BO) when a user searches or selects an IPO.

2. **Live Upcoming & Active IPOs (`/api/upcoming-ipos`)**
   - Synced with official NSE / BSE exchange subscription feeds.
   - Shows active bidding statuses, live subscription demand multiples (e.g. 5.5x), and verified regulatory timelines.

3. **199+ Historical Indian IPO Catalog (2002 – Present)**
   - Master verified catalog of Indian Mainboard IPOs from 2002 (Bharti Airtel, Maruti, TCS) to recent debuts (Swiggy, Waaree Energies, Hyundai, Bajaj Housing Finance).

4. **Instant Search Suggestions**
   - Clicking or focusing on the search bar immediately displays popular household IPOs with past listing returns.

---

## 🛠️ Tech Stack

- **React 18 + Vite** — High-performance frontend
- **Tailwind CSS** — Clean, responsive financial UI
- **TanStack React Query** — Caching and dynamic background re-sync
- **Lucide React** — Modern icon set
- **Vercel Serverless Functions** — Serverless endpoints for live market feeds

---

## 📦 Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Run locally
```bash
npm run dev
```

### 3. Build for production
```bash
npm run build
```

---

## 🌐 Deploy to Vercel (1-Click)

1. Go to **[vercel.com/new](https://vercel.com/new)**.
2. Import your GitHub repository: `https://github.com/Naveen0735/WhatifIPO`.
3. Click **Deploy** — zero environment variables needed!
