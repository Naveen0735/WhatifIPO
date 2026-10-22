# WhatIfIPO.in

> **What if you had invested in that IPO?**  
> A calculator that shows users what would have happened to their money if they had invested in any Indian IPO.

## 🚀 Tech Stack

- **React 18 + Vite** — Fast dev experience
- **Tailwind CSS** — Utility-first styling
- **Supabase** — Backend database for IPO data
- **React Router v6** — Client-side routing
- **Lucide React** — Icons

## 📦 Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Create a `.env.local` file (already done if you cloned this):

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

### 3. Run locally

```bash
npm run dev
```

### 4. Build for production

```bash
npm run build
```

## 🗄️ Supabase Table Schema

```sql
create table ipos (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  symbol text,
  issue_price numeric not null,
  listing_price numeric,
  current_price numeric,
  listing_date date,
  lot_size integer,
  min_investment numeric,
  sector text,
  exchange text,
  updated_at timestamptz default now()
);
```

## 🌐 Deploy on Vercel

1. Push to GitHub
2. Connect repo on [vercel.com](https://vercel.com)
3. Add environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
4. Deploy!

## 📄 Disclaimer

For educational purposes only. Not financial advice. Data may be delayed or inaccurate.
