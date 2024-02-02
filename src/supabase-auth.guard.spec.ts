import { ExecutionContext } from "@nestjs/common";
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
  let mockExecutionContext: jest.Mocked<ExecutionContext>;
  let mockRequest: any;

  beforeEach(() => {
    mockSupabaseClient = new SupabaseClient(
      "test",
      "test"
    ) as jest.Mocked<SupabaseClient>;

    guard = new SupabaseAuthGuard(mockSupabaseClient);
    mockRequest = {
      headers: {},
    } as unknown as any;
    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }),
    } as unknown as jest.Mocked<ExecutionContext>;
  });

  describe("canActivate", () => {
    it("should return true if authentication is successful", async () => {
      mockRequest.headers.authorization = "Bearer valid-token";
      guard.authenticateRequest = jest
        .fn()
        .mockResolvedValueOnce({ user: "test-user" });

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBeTruthy();
    });

    it("should attach token user to request if authentication is successful", async () => {
      mockRequest.headers.authorization = "Bearer valid-token";
      const expectedUser = { user: "test-user" };
      guard.authenticateRequest = jest.fn().mockResolvedValueOnce(expectedUser);

      await guard.canActivate(mockExecutionContext);

      expect(mockRequest.authUser).toEqual(expectedUser);
    });
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
