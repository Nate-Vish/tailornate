<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Madko / tailornate.com

This is an independent Git repository for Nathan's portfolio, resume, and task
workspace. The user is the pilot and has final authority.

## Workflow

For significant work, use `$start`, then `$spec`, `$plan`, implementation, and
`$verify` as appropriate. Simple, clear tasks can go directly to implementation
and verification. Use the local read-only reviewer after changes.

## Commands

```bash
pnpm install
pnpm dev
pnpm lint
pnpm build
```

## Stack and Rules

- Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, and shadcn/ui.
- Read the matching bundled Next.js guide before changing framework code.
- Preserve the intentional visual system and responsive behavior.
- Never commit secrets from `.env.local`.
- Make surgical changes and run lint/build checks appropriate to the change.

## Local Agent Assets

- Codex skills: `.agents/skills/`
- Codex subagents: `.codex/agents/`
- Claude Code skills and subagents: `.claude/skills/`, `.claude/agents/`
