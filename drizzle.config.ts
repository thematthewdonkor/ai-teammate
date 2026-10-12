import { config } from "dotenv"
import { defineConfig } from "drizzle-kit"

config({ path: ".env.local", quiet: true })

// Schema pushes need the direct (non-pooled) connection.
const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL

if (!url) {
  throw new Error("DATABASE_URL_UNPOOLED is not set. Run `npx neon env pull`.")
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./lib/schema.ts",
  out: "./drizzle",
  dbCredentials: { url },
})
