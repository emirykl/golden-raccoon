# Backend scope

The active application server is the Next.js server under `frontend/src/server` and `frontend/src/app/api`. The former duplicated TypeScript backend and SQLite Prisma schema were removed after verifying that no runtime, build, deployment, or test imports referenced them.

`backend/contracts` remains intentionally separate because it contains the legacy EVM smart-contract workspace. Stellar contracts live under `soroban/`.
