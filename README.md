# tailornate.com — Nathan Hai Vishnevski's Portfolio

Personal portfolio website. Single-page, dark theme, AI chatbot.

**Live:** [tailornate.com](https://tailornate.com)

## Stack

- **Next.js 16** (App Router) + TypeScript
- **Tailwind CSS v4** + shadcn/ui
- **Framer Motion** — scroll reveals
- **Vercel AI SDK** + Google Gemma 3 — AI chatbot

## Local Development

```bash
pnpm install
cp .env.example .env.local   # Add your Google AI API key
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

```env
GOOGLE_GENERATIVE_AI_API_KEY=your_key_here
```

Get a free key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey).

## Deploy

Deployed on Vercel. Auto-deploys from the `main` branch.
