# core_l_h

MVP implementation scaffold (Next.js App Router + TypeScript + Tailwind).

Amplify Gen2 backend is wired for:

- Auth (Cognito)
- Data (AppSync + DynamoDB) with a minimal `Todo` model

## Requirements

- Node.js 22+

## Dev

- Install deps: `npm install`
- Run dev server: `npm run dev`

## Amplify Gen2 (local sandbox)

This repo expects `amplify_outputs.json` to exist at the project root.

- Start a per-developer cloud sandbox (generates/updates `amplify_outputs.json`): `npm run amplify:sandbox`
- In another terminal, run the app: `npm run dev`
- Cleanup sandbox: `npm run amplify:sandbox:delete`

## Notes

- Spec SSOT is maintained in `../SPEC_SSOT.md` (repo root workspace).
- Frontend reads `amplify_outputs.json` from the project root.
