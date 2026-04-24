# Bitunix BD Prospector

Herramienta de outreach para KOLs de Bitunix exchange — powered by Groq AI con busqueda web en tiempo real.

## Stack

- Frontend: HTML/CSS/JS (sin frameworks)
- Backend: Vercel Serverless Functions
- AI: Groq Compound Beta (busqueda real) + Llama 3.3 70B (emails)

## Variables de entorno en Vercel

GROQ_API_KEY = tu key de Groq (empieza con gsk_...)

## Endpoints

- POST /api/search  — Busca KOLs en tiempo real
- POST /api/email   — Genera emails personalizados
- POST /api/lookup  — Busca perfil de un KOL especifico
- POST /api/analyze — Analiza respuestas y hace scoring
- GET  /api/test    — Diagnostico de conexion con Groq
