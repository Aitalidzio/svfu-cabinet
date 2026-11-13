// Only the cookie name lives here: proxy.ts imports it for the optimistic «is there a session cookie at all?»
// check, so this file must stay free of database and `server-only` imports.
export const SESSION_COOKIE = "session";
