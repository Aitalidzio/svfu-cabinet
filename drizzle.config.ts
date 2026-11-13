import { defineConfig } from "drizzle-kit";

// Used only by `npm run db:generate` to turn schema.ts into SQL migrations in ./drizzle.
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/server/db/schema.ts",
  out: "./drizzle",
});
