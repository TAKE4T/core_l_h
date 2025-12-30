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

## Deploy (Vercel)

This frontend can be deployed on Vercel. The Amplify Gen2 backend is still managed via the `amplify/` folder.

1. In Vercel, set the Project Root to this folder (`repo/`).
2. Build command is set via `vercel.json` to `npm run vercel-build`.
3. To connect the deployed frontend to an existing Amplify backend environment, configure these environment variables in Vercel:

- `AMPLIFY_APP_ID`: the Amplify App ID that hosts your Gen2 backend environment
- (optional) `AMPLIFY_BRANCH`: defaults to `VERCEL_GIT_COMMIT_REF` or `main`

`npm run vercel-build` will attempt to run `npx ampx generate outputs ...` at build time.
This requires AWS credentials to be available in the build environment (for example, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `AWS_REGION`) with permissions to read Amplify app/branch outputs.

## Amplify Gen2 (local sandbox)

This repo expects `amplify_outputs.json` to exist at the project root.

You can obtain/update it in one of these ways:

- Download from the Amplify Console (when working against a deployed environment)
- Generate via CLI: `npx ampx generate outputs --branch <branch> --app-id <amplify-app-id>`
- Automatically update via sandbox (per-developer cloud environment)

- Start a per-developer cloud sandbox (generates/updates `amplify_outputs.json`): `npm run amplify:sandbox`
- In another terminal, run the app: `npm run dev`
- Cleanup sandbox: `npm run amplify:sandbox:delete`

### Notes on permissions

When running `npx ampx sandbox`, your local AWS credentials must have permissions to deploy Amplify Gen2 backend resources.
In AWS docs / builders.flash, this is commonly described as attaching an IAM policy like `AmplifyBackendDeployFullAccess` (or an equivalent least-privilege policy) to the IAM principal you use locally.

## Notes

- Spec SSOT is maintained in `../SPEC_SSOT.md` (repo root workspace).
- Frontend reads `amplify_outputs.json` from the project root.
