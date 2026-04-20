<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Naming conventions

- **Variables**: nouns with enough context to be self-explanatory (`characterMovementVector`, not `moveVec`; `characterPosition`, not `pos`)
- **Functions**: verbs that describe what they do (`applyCollision`, not `collision`)
- **Booleans**: start with a word that answers a yes/no question (`isRunning`, `hasWall`, `shouldSnap`)
