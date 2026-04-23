# Bitunix BD Prospector

KOL outreach tool for Bitunix exchange — powered by Perplexity Sonar with real-time web search.

## Setup

1. Deploy to Vercel
2. Add environment variable: `PERPLEXITY_API_KEY` = your Perplexity API key
3. Done — the app works immediately

## API Endpoints

- `POST /api/search` — Find KOLs with real-time web search
- `POST /api/email` — Generate personalized outreach emails
- `POST /api/lookup` — Look up a specific KOL's profile
- `POST /api/analyze` — Analyze replies and score prospects

## Stack

- Frontend: Vanilla HTML/CSS/JS
- Backend: Vercel Serverless Functions
- AI: Perplexity Sonar (real-time web search)
