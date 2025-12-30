import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

function log(message) {
  // Vercel log-friendly
  console.log(message);
}

function getAmplifyAppId() {
  return (
    process.env.AMPLIFY_APP_ID ||
    process.env.AMPLIFY_BACKEND_APP_ID ||
    process.env.BACKEND_APP_ID ||
    ""
  );
}

function getBranchName() {
  return (
    process.env.AMPLIFY_BRANCH ||
    process.env.VERCEL_GIT_COMMIT_REF ||
    process.env.GITHUB_REF_NAME ||
    "main"
  );
}

function isPlaceholderOutputs(filePath) {
  if (!existsSync(filePath)) return true;
  try {
    const json = JSON.parse(readFileSync(filePath, "utf8"));
    // Placeholder we keep in git is { version: "1.4" }
    return Object.keys(json).length <= 1 && typeof json.version === "string";
  } catch {
    return true;
  }
}

const outputsPath = new URL("../amplify_outputs.json", import.meta.url);

const appId = getAmplifyAppId();
const branch = getBranchName();

if (!appId) {
  log(
    "[vercel] AMPLIFY_APP_ID is not set; skipping `ampx generate outputs`. Using existing amplify_outputs.json."
  );
  process.exit(0);
}

try {
  log(`[vercel] Generating amplify outputs (appId=${appId}, branch=${branch})...`);
  execFileSync(
    "npx",
    [
      "ampx",
      "generate",
      "outputs",
      "--app-id",
      appId,
      "--branch",
      branch,
      "--out-dir",
      ".",
    ],
    { stdio: "inherit" }
  );

  if (isPlaceholderOutputs(outputsPath)) {
    log(
      "[vercel] WARN: amplify_outputs.json still looks like a placeholder. Check AWS credentials and app/branch values."
    );
  } else {
    log("[vercel] amplify_outputs.json generated successfully.");
  }
} catch (err) {
  log(
    "[vercel] WARN: `ampx generate outputs` failed; continuing with existing amplify_outputs.json."
  );

  // Ensure the file exists so Next build doesn't fail on import.
  if (!existsSync(outputsPath)) {
    writeFileSync(outputsPath, JSON.stringify({ version: "1.4" }, null, 2) + "\n");
  }

  process.exit(0);
}
