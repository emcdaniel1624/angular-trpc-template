import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/server/db/schema.ts",
  dialect: "postgresql",
  out: "./src/server/db/migrations",
  verbose: true,
  strict: true,
  dbCredentials: {
    url: "postgresql://user:password@localhost:5432/db",
  },
});
