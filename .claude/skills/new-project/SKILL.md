---
name: new-project
description: Create a dual-compatible Claude Code and Codex project inside AgenTeam with project instructions and optional agents or skills.
---

# /new-project — Add a Project to AgenTeam

## Usage
```
/new-project LOS
/new-project Madko --from ~/Projects/Madko
```

## Process

### Step 1: Create or import

If `--from <path>` is provided:
- Copy the project into `~/Desktop/AgenTeam/<name>/`
- Preserve .git if it exists

If no source:
- Create `~/Desktop/AgenTeam/<name>/`

### Step 2: Create the project instructions

Ask the user:
1. What's the tech stack? (language, framework, package manager)
2. What are the build/test/lint commands?
3. Any project-specific conventions?

Write `<name>/AGENTS.md` as the source of truth. Copy the applicable shared
workflow sections from the AgenTeam `AGENTS.md` (pipeline, principles, rules,
release discipline, and Hebrew bidi rules), then add the project-specific
section below. Do not depend on a parent-file link across a Git boundary.

The project-specific section includes:
```markdown
# <Project Name>

## Commands
- <build command>
- <test command>
- <lint command>

## Stack
<language, framework, key libraries>

## Conventions
<project-specific rules>
```

Also write `<name>/CLAUDE.md` as a Claude Code bridge:

```markdown
@AGENTS.md
```

This keeps the instructions in one place while making the project work in both
Claude Code and Codex.

### Step 3: Add project extensions (if needed)

Ask: "Does this project need any specific agents, rules, or skills beyond the shared ones?"

First, copy the shared workflow assets into every independent Git repository.
Do not rely on parent discovery when the project may be opened on its own.

Copy these directories into the new repository, without overwriting any
project-specific files:

- `.agents/skills/` and `.codex/agents/` for Codex
- `.claude/skills/` and `.claude/agents/` for Claude Code

If the project needs additional extensions, create equivalent native files for
both tools where relevant:
- Instructions — shared conventions stay in `AGENTS.md`; use nested `AGENTS.md`
  files for Codex subtree rules and `.claude/rules/` only for Claude-specific rules
- Subagents — `.codex/agents/*.toml` for Codex and `.claude/agents/*.md` for Claude Code
- Workflows — `.agents/skills/*/SKILL.md` for Codex and
  `.claude/skills/*/SKILL.md` for Claude Code

Keep their behavior equivalent while respecting each tool's schema. Do not
mechanically rename settings, permissions, hooks, or MCP configuration. If the
project needs no additional extensions, the shared copies are sufficient.

After copying, open the new repository as the active working directory and
confirm that `/start` in Claude Code, `$start` in Codex, and the reviewer
subagent are discoverable.

### Step 4: Confirm

```
Created: ~/Desktop/AgenTeam/<name>/
├── AGENTS.md          # Shared workflow + project-specific source of truth
├── CLAUDE.md          # Imports AGENTS.md for Claude Code
├── .codex/agents/     # Codex subagents (if any)
├── .agents/skills/    # Codex skills (if any)
├── .claude/agents/    # Claude Code subagents (if any)
├── .claude/skills/    # Claude Code skills (if any)
└── (project files)

Copied from AgenTeam:
├── shared rules in AGENTS.md
├── .codex/agents/     # Shared Codex subagents
├── .agents/skills/    # Shared Codex skills
├── .claude/agents/    # Shared Claude Code subagents
└── .claude/skills/    # Shared Claude Code skills

Open the project directory in Codex or Claude Code and smoke-test discovery.
```
