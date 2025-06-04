import { beforeAll } from "vitest";
import * as dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Track if required environment variables are missing so tests can be skipped
export const envMissing = (() => {
  const requiredEnvVars = [
    "VITE_SUPABASE_URL",
    "VITE_SUPABASE_KEY",
    "VITE_TEST_EMAIL",
    "VITE_TEST_PASS",
  ];

  const missing = requiredEnvVars.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.warn(
      `Missing required environment variables: ${missing.join(", ")}`
    );
    return true;
  }
  return false;
})();

beforeAll(() => {
  if (envMissing) {
    console.warn("Supabase environment variables not found. Integration tests will be skipped.");
  }
});
