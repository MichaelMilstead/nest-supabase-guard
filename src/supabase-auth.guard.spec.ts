import { SupabaseClient } from "@supabase/supabase-js";
import { SupabaseAuthGuard } from "./supabase-auth.guard";

jest.mock("@supabase/supabase-js", () => {
  return {
    SupabaseClient: jest.fn().mockImplementation(() => ({
      auth: {
        getUser: jest.fn(),
      },
    })),
  };
});

describe("SupabaseAuthGuard", () => {
  let guard: SupabaseAuthGuard;
  let mockSupabaseClient: jest.Mocked<SupabaseClient>;

  beforeEach(() => {
    mockSupabaseClient = new SupabaseClient(
      "test",
      "test"
    ) as jest.Mocked<SupabaseClient>;

    guard = new SupabaseAuthGuard(mockSupabaseClient);
  });

  describe("getUserFromJWT", () => {
    it("should return a user for a valid JWT", async () => {
      const validToken = "valid-token";
      const expectedUser = { id: "test-id", email: "test-email" };
      (mockSupabaseClient.auth.getUser as jest.Mock).mockResolvedValueOnce({
        data: { user: expectedUser },
        error: null,
      });

      const userResult = await guard.getUserFromJWT(validToken);

      expect(userResult).toEqual(expectedUser);
    });

    it("should throw error if no user found in JWT", async () => {
      const invalidToken = "invalid-token";
      (mockSupabaseClient.auth.getUser as jest.Mock).mockResolvedValueOnce({
        data: { user: {} },
        error: null,
      });

      const userResult = await guard.getUserFromJWT(invalidToken);

      await expect(guard.getUserFromJWT(invalidToken)).rejects.toThrow();
    });
  });
});
