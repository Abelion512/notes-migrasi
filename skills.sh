#!/bin/bash

# Lembaran Notes - Agent Skills Installation Script
# This script installs highly recommended skills for AI agents working on this repo.

echo "🚀 Installing Lembaran Recommended Skills..."

# 1. Discovery Skill
bun x skills add vercel-labs/skills@find-skills -y --agent "*"

# 2. Next.js App Router Patterns (Essential for v15 architecture)
bun x skills add wshobson/agents@nextjs-app-router-patterns -y --agent "*"

# 3. Next.js Best Practices
bun x skills add sickn33/antigravity-awesome-skills@nextjs-best-practices -y --agent "*"

# 4. Security Review (Critical for Sentinel Standard)
bun x skills add sickn33/antigravity-awesome-skills@security-review -y --agent "*"

# 5. Advanced TypeScript (Strict Type Safety)
bun x skills add wshobson/agents@typescript-advanced-types -y --agent "*"

echo "✅ All skills installed successfully!"
