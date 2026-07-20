import Ably from "ably";

let ablyRest: Ably.Rest | null = null;

export function getAblyRest() {
  const apiKey = process.env.ABLY_API_KEY;
  if (!apiKey) {
    throw new Error("ABLY_API_KEY environment variable is not set");
  }
  if (!ablyRest) {
    ablyRest = new Ably.Rest(apiKey);
  }
  return ablyRest;
}
