/**
 * InsForge SDK singleton.
 *
 * The SDK reads NEXT_PUBLIC_INSFORGE_URL and NEXT_PUBLIC_INSFORGE_ANON_KEY
 * automatically when no explicit config is passed. We pass them explicitly
 * to make the dependency clear.
 *
 * Session storage: the SDK keeps the access token in-memory (browser) and
 * uses the refresh cookie on init. We additionally mirror the access token
 * in a session store for app-side reactivity (see store/session-store.ts).
 */

import { createClient, type InsForgeClient } from "@insforge/sdk";

const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL;
const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY;

if (!baseUrl) {
  throw new Error("Missing NEXT_PUBLIC_INSFORGE_URL in environment");
}
if (!anonKey) {
  throw new Error("Missing NEXT_PUBLIC_INSFORGE_ANON_KEY in environment");
}

let _client: InsForgeClient | null = null;

/** Lazily-instantiated singleton for the browser/SSR client. */
export function getInsForge(): InsForgeClient {
  if (!_client) {
    _client = createClient({ baseUrl: baseUrl!, anonKey: anonKey! });
  }
  return _client;
}

/** For tests or scoped re-instantiation. */
export function resetInsForgeClient(): void {
  _client = null;
}