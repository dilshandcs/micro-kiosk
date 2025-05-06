jest.unmock("../authService");
import { registerUser, verifyUserCode, getUserInfo, updatePassword, sendCode } from "../authService";
import * as authService from "../authService";
import {
  LoginResponse,
  RegisterResponse,
  SendCodeRequestTypeEnum,
  SendCodeResponse,
  UpdatePasswordResponse,
  UserInfoResponse,
  VerifyUserCodeResponse,
} from "../openapi";

jest.mock("../openapi");

describe("authService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("loginUser", () => {
    it("should call loginUser API and return data on success", async () => {
      const mockResponse: LoginResponse = {
        token: "test-token",
        is_verified: true,
      };

      authService.api.loginUser = jest
        .fn()
        .mockResolvedValueOnce({ data: mockResponse });

      const result = await authService.loginUser("1234567890", "password");

      expect(result).toEqual(mockResponse);
    });

    it("should throw an error if loginUser API fails", async () => {
      authService.api.loginUser = jest
        .fn()
        .mockRejectedValue(new Error("Login failed"));

      await expect(
        authService.loginUser("1234567890", "password")
      ).rejects.toThrow("Login failed");
    });
  });

  describe("registerUser", () => {
    it("should call registerUser API and return data on success", async () => {
      const mockResponse: RegisterResponse = {
        mobile: "1234567890",
        is_verified: false,
        token: "test-token",
      };
      authService.api.registerUser = jest
        .fn()
        .mockResolvedValueOnce({ data: mockResponse });

      const result = await registerUser("1234567890", "password");

      expect(authService.api.registerUser).toHaveBeenCalledWith({
        mobile: "1234567890",
        password: "password",
      });
      expect(result).toEqual(mockResponse);
    });

    it("should throw an error if registerUser API fails", async () => {
      authService.api.registerUser = jest
        .fn()
        .mockRejectedValue(new Error("Registration failed"));

      await expect(registerUser("1234567890", "password")).rejects.toThrow(
        "Registration failed"
      );
      expect(authService.api.registerUser).toHaveBeenCalledWith({
        mobile: "1234567890",
        password: "password",
      });
    });
  });

  describe("verifyUserCode", () => {
    it("should call verifyUserCode API and return data on success", async () => {
      const mockResponse: VerifyUserCodeResponse = {
        token: "test-token",
        success: false,
      };
      authService.api.verifyUserCode = jest
        .fn()
        .mockResolvedValueOnce({ data: mockResponse });

      const result = await verifyUserCode("1234567890", "123456", "test-token");

      expect(authService.api.verifyUserCode).toHaveBeenCalledWith(
        { mobile: "1234567890", code: "123456" },
        { headers: { Authorization: `Bearer test-token` } }
      );
      expect(result).toEqual(mockResponse);
    });

    it("should throw an error if verifyUserCode API fails", async () => {
      authService.api.verifyUserCode = jest
        .fn()
        .mockRejectedValue(new Error("Verification failed"));

      await expect(
        verifyUserCode("1234567890", "123456", "test-token")
      ).rejects.toThrow("Verification failed");
      expect(authService.api.verifyUserCode).toHaveBeenCalledWith(
        { mobile: "1234567890", code: "123456" },
        { headers: { Authorization: `Bearer test-token` } }
      );
    });

    
    it("should throw an error if if token is null", async () => {
      await expect(
        verifyUserCode("1234567890", "123456", null)
      ).rejects.toThrow("verifyUserCode: token is missing");
    });
  });

  describe("getUserInfo", () => {
    it("should call getUserInfo API and return data on success", async () => {
      const mockResponse: UserInfoResponse = {
        mobile: "0701234567",
        is_verified: false,
      };
      authService.api.getUserInfo = jest
        .fn()
        .mockResolvedValueOnce({ data: mockResponse });

      const result = await getUserInfo("test-token");

      expect(authService.api.getUserInfo).toHaveBeenCalledWith({
        headers: { Authorization: "Bearer test-token" },
      });
      expect(result).toEqual(mockResponse);
    });

    it("should throw an error if getUserInfo API fails", async () => {
      authService.api.getUserInfo = jest
        .fn()
        .mockRejectedValue(new Error("Get user info failed"));

      await expect(getUserInfo("test-token")).rejects.toThrow(
        "Get user info failed"
      );
      expect(authService.api.getUserInfo).toHaveBeenCalledWith({
        headers: { Authorization: "Bearer test-token" },
      });
    });
  });

  describe("sendCode", () => {
    it("should call sendCode API and return data on success", async () => {
      const mockResponse: SendCodeResponse = {
        success: true,
      };
      authService.api.sendCode = jest
        .fn()
        .mockResolvedValueOnce({ data: mockResponse });

      const result = await authService.sendCode("1234567890", SendCodeRequestTypeEnum.PasswordReset);

      expect(authService.api.sendCode).toHaveBeenCalledWith(
        { mobile: "1234567890", type: "password_reset" }
      );
      expect(result).toEqual(mockResponse);
    });

    it("should throw an error if updatePassword API fails", async () => {
      authService.api.sendCode = jest
        .fn()
        .mockRejectedValue(new Error("Verification failed"));

      await expect(
        sendCode("1234567890", SendCodeRequestTypeEnum.MobileVerification)
      ).rejects.toThrow("Verification failed");
      expect(authService.api.sendCode).toHaveBeenCalledWith(
        { mobile: "1234567890", type: "mobile_verification" }
      );
    });
  });

  describe("updatePassword", () => {
    it("should call updatePassword API and return data on success", async () => {
      const mockResponse: UpdatePasswordResponse = {
        success: true,
      };
      authService.api.updatePassword = jest
        .fn()
        .mockResolvedValueOnce({ data: mockResponse });

      const result = await authService.updatePassword("1234567890", "123456", "Test1234");

      expect(authService.api.updatePassword).toHaveBeenCalledWith(
        { mobile: "1234567890", code: "123456", newPassword: "Test1234" }
      );
      expect(result).toEqual(mockResponse);
    });

    it("should throw an error if updatePassword API fails", async () => {
      authService.api.updatePassword = jest
        .fn()
        .mockRejectedValue(new Error("Verification failed"));

      await expect(
        updatePassword("1234567890", "123456", "Test1234")
      ).rejects.toThrow("Verification failed");
      expect(authService.api.updatePassword).toHaveBeenCalledWith(
        { mobile: "1234567890", code: "123456", newPassword: "Test1234" }
      );
    });
  });
});
