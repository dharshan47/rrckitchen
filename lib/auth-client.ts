import { createAuthClient } from "better-auth/react";
import { phoneNumberClient, adminClient, twoFactorClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [
    phoneNumberClient(),
    adminClient(),
    twoFactorClient({
      onTwoFactorRedirect() {
        window.location.href = "/admin/2fa";
      },
    }),
  ],
  fetchOptions: {
    onError: async (context) => {
      const { response } = context;
      if (response.status === 429) {
        const retryAfter = response.headers.get("X-Retry-After");
        console.warn(`Rate limited. Retry after ${retryAfter}s`);
      }
    },
  },
});

export const { useSession, signIn, signUp, signOut, twoFactor } = authClient;
