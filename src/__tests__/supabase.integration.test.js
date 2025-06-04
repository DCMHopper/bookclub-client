import { describe, it, expect, beforeAll } from "vitest";
import { envMissing } from "./setup";

const describeFn = envMissing || missingCreds ? describe.skip : describe;
let supabase;

// Ensure you have a .env file at the root with VITE_TEST_EMAIL and VITE_TEST_PASS for these tests
// or configure these credentials securely for your test environment.

// These tests assume there is some data in your database to fetch.
// For more robust tests, consider dedicated test data setup and teardown.

const TEST_USER_EMAIL =
  process.env.VITE_TEST_EMAIL || import.meta.env.VITE_TEST_EMAIL;
const TEST_USER_PASSWORD =
  process.env.VITE_TEST_PASS || import.meta.env.VITE_TEST_PASS;

const missingCreds = !TEST_USER_EMAIL || !TEST_USER_PASSWORD;

let testUserId = null;
let testClubId = null; // This will be populated from the user's JWT or a known club
let testReadingId = null; // This will be populated from a fetched meeting

describeFn("Supabase Integration Tests", () => {
  beforeAll(async () => {
    if (envMissing || missingCreds) {
      return;
    }
    const module = await import("../supabaseClient");
    supabase = module.default;

    try {
      const { data: signInData, error: signInError } =
        await supabase.auth.signInWithPassword({
          email: TEST_USER_EMAIL,
          password: TEST_USER_PASSWORD,
        });

      if (signInError) {
        throw new Error(`Test setup: Sign-in failed - ${signInError.message}`);
      }
      if (!signInData?.session) {
        throw new Error("Test setup: No session after sign-in.");
      }

      testUserId = signInData.user.id;
      console.log("Successfully signed in test user:", testUserId);

      // Get club_id from JWT
      try {
        const jwt = signInData.session.access_token;
        const [, payload] = jwt.split(".");
        const decoded = JSON.parse(atob(payload));
        testClubId = decoded.club_id;

        if (testClubId) {
          console.log("Found club_id in JWT:", testClubId);
        }
      } catch (e) {
        console.warn("Could not extract club_id from JWT:", e.message);
      }

      // Fallback to members table if no club_id in JWT
      if (!testClubId) {
        console.log("Attempting to fetch club_id from members table...");
        const { data: memberData, error: memberError } = await supabase
          .from("members")
          .select("club_id")
          .eq("user_id", testUserId)
          .limit(1)
          .single();

        if (memberError) {
          console.warn("Could not fetch member data:", memberError.message);
        } else if (memberData) {
          testClubId = memberData.club_id;
          console.log("Found club_id from members table:", testClubId);
        }
      }

      if (!testClubId) {
        console.warn(
          "No club_id found in JWT or members table. Some tests will be skipped."
        );
      }
    } catch (error) {
      console.error("Test setup failed:", error);
      throw error;
    }
  });

  it("should allow a signed-in user to be fetched", async () => {
    expect(testUserId).toBeTypeOf("string");
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    expect(error).toBeNull();
    expect(user).not.toBeNull();
    expect(user.id).toBe(testUserId);
  });

  it("should fetch a list of all clubs", async () => {
    const { data: clubs, error } = await supabase
      .from("clubs")
      .select("*")
      .limit(5);
    expect(error).toBeNull();
    expect(clubs).toBeInstanceOf(Array);
    if (clubs.length > 0) {
      expect(clubs[0]).toHaveProperty("id");
      expect(clubs[0]).toHaveProperty("club_name");
    }
  });

  it("should fetch members for a specific club if testClubId is available", async () => {
    if (!testClubId) {
      console.warn("Skipping test: testClubId not available.");
      return;
    }
    const { data: members, error } = await supabase
      .from("members")
      .select("*")
      .eq("club_id", testClubId)
      .limit(5);
    expect(error).toBeNull();
    expect(members).toBeInstanceOf(Array);
    if (members.length > 0) {
      expect(members[0]).toHaveProperty("user_id");
      expect(members[0]).toHaveProperty("club_id", testClubId);
    }
  });

  it("should fetch meetings for a specific club if testClubId is available", async () => {
    if (!testClubId) {
      console.warn("Skipping test: testClubId not available.");
      return;
    }
    const { data: meetings, error } = await supabase
      .from("meetings")
      .select("*, readings!inner(id, title)") // Example of joining with readings
      .eq("club_id", testClubId)
      .limit(5);

    expect(error).toBeNull();
    expect(meetings).toBeInstanceOf(Array);
    if (meetings.length > 0) {
      expect(meetings[0]).toHaveProperty("id");
      expect(meetings[0]).toHaveProperty("club_id", testClubId);
      expect(meetings[0]).toHaveProperty("readings"); // Check for the joined reading data
      if (meetings[0].readings) {
        testReadingId = meetings[0].readings.id; // Save for the next test
      }
    }
  });

  it("should fetch details for a specific reading if testReadingId is available", async () => {
    if (!testReadingId) {
      console.warn(
        "Skipping test: testReadingId not available (dependent on meetings test)."
      );
      return;
    }
    const { data: reading, error } = await supabase
      .from("readings")
      .select("*")
      .eq("id", testReadingId)
      .single();

    expect(error).toBeNull();
    expect(reading).not.toBeNull();
    expect(reading.id).toBe(testReadingId);
    expect(reading).toHaveProperty("title");
  });

  // You can add more tests here, for example:
  // - Testing creation of a new reading (requires cleanup)
  // - Testing role permissions if you have logic for that accessible via RPCs
  // - Testing specific Supabase query features you rely on
});
