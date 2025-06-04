import { beforeAll } from "vitest";
import * as dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Ensure required environment variables are available
beforeAll(() => {
  const requiredEnvVars = [
    "VITE_SUPABASE_URL",
    "VITE_SUPABASE_KEY",
    "VITE_TEST_EMAIL",
    "VITE_TEST_PASS",
  ];

  const missing = requiredEnvVars.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }
});
