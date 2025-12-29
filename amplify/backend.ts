import { defineBackend } from "@aws-amplify/backend";
import { auth } from "./auth/resource.js";

/**
 * Amplify Gen2 backend entrypoint.
 * We start minimal (no resources) and will add auth/data/storage incrementally.
 */
export const backend = defineBackend({ auth });
