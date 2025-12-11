# Legacy Code

This directory contains code from the **001-discord-upstage-integration** feature that has been moved out of the MVP execution flow.

## Contents

| Directory | Description | Tech Stack |
|-----------|-------------|------------|
| `ai_agent_system/` | Python AI agents for Discord capture, intent analysis, content generation | Python 3.10+, discord.py, Upstage SDK |
| `backend/` | Express API for Discord integration | Node.js, Express, MongoDB |

## Why Legacy?

The **002-chat-editor-mvp** feature requires a clean frontend-only SPA without Python dependencies. This code is preserved for:

1. **Future reference** - Implementation patterns for Discord/Upstage integration
2. **Potential v2 integration** - May be reactivated when cloud features are needed
3. **Documentation** - Serves as working examples of the AI agent patterns

## Hard Constraint

**Python is prohibited in MVP runtime**. See `specs/002-chat-editor-mvp/spec.md` for details.

## Reactivation

To use this code again:

```bash
# Move back to root
mv legacy/ai_agent_system ./
mv legacy/backend ./

# Install dependencies
cd ai_agent_system && pip install -r requirements.txt
cd ../backend && npm install
```

## Related Docs

- [Feature Spec](../specs/001-discord-upstage-integration/spec.md)
- [Tasks (100% complete)](../specs/001-discord-upstage-integration/tasks.md)
