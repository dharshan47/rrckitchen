import { createAuthClient } from "better-auth/react";
import { adminClient, phoneNumberClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [phoneNumberClient(), adminClient()],
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

export const { phoneNumber, useSession,signIn,signUp,signOut } = authClient;

