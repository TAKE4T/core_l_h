import { defineAuth } from "@aws-amplify/backend";

/**
 * Cognito Auth definition (Amplify Gen2 convention).
 *
 * Minimal start: email login.
 * We will expand позже (MFA, groups, triggers, custom email sender, etc.).
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
  },
});
