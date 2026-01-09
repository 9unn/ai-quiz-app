import { defineConfig } from "drizzle-kit";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required to run drizzle commands");
}

// Ensure connection string has proper timeout settings
const dbUrl = new URL(connectionString);
if (!dbUrl.searchParams.has("connect_timeout")) {
  dbUrl.searchParams.set("connect_timeout", "30");
}
if (!dbUrl.searchParams.has("statement_timeout")) {
  dbUrl.searchParams.set("statement_timeout", "30000");
}
const finalConnectionString = dbUrl.toString();

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: connectionString,
  },
  migrations: {
    table: "__drizzle_migrations__",
  },
});
