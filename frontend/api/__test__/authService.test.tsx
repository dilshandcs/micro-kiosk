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

    it("throws structured login error for known error code", async () => {
      const errorResponse = {
        response: {
          data: {
            errorCode: "INCORRECT_MOBILE_PWD",
            message: "Incorrect mobile number",
          },
        },
      };
  
      (authService.api.loginUser as jest.Mock).mockRejectedValue(errorResponse);
  
      await expect(authService.loginUser("1234567890", "password")).rejects.toEqual({
        errorCode: "INCORRECT_MOBILE_PWD",
        message: "Incorrect mobile number",
      });
    });
  
    it("throws unknown login error for unexpected failure", async () => {
      const unknownError = new Error("Something went wrong");
  
      (authService.api.loginUser as jest.Mock).mockRejectedValue(unknownError);
  
      await expect(authService.loginUser("1234567890", "password")).rejects.toEqual({
        errorCode: "UNKNOWN_ERROR",
        message: "Unexpected error occurred",
      });
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

    it("throws structured register error for known error code", async () => {
      const errorResponse = {
        response: {
          data: {
            errorCode: "INVALID_MOBILE",
            message: "Invalid mobile number",
          },
        },
      };
  
      (authService.api.registerUser as jest.Mock).mockRejectedValue(errorResponse);
  
      await expect(authService.registerUser("1234567890", "password")).rejects.toEqual({
        errorCode: "INVALID_MOBILE",
        message: "Invalid mobile number",
      });
    });
  
    it("throws unknown register error for unexpected failure", async () => {
      const unknownError = new Error("Something went wrong");
  
      (authService.api.registerUser as jest.Mock).mockRejectedValue(unknownError);
  
      await expect(authService.registerUser("1234567890", "password")).rejects.toEqual({
        errorCode: "UNKNOWN_ERROR",
        message: "Unexpected error occurred",
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

    it("throws structured verify user code error for known error code", async () => {
      const errorResponse = {
        response: {
          data: {
            errorCode: "INCORRECT_VERIFY_CODE",
            message: "Invalid code",
          },
        },
      };
  
      (authService.api.verifyUserCode as jest.Mock).mockRejectedValue(errorResponse);
  
      await expect(authService.verifyUserCode("1234567890", "123456", "test-token")).rejects.toEqual({
        errorCode: "INCORRECT_VERIFY_CODE",
        message: "Invalid code",
      });
    });
  
    it("throws unknown verify user code error for unexpected failure", async () => {
      const unknownError = new Error("Something went wrong");
  
      (authService.api.verifyUserCode as jest.Mock).mockRejectedValue(unknownError);
  
      await expect(authService.verifyUserCode("1234567890", "123456", "test-token")).rejects.toEqual({
        errorCode: "UNKNOWN_ERROR",
        message: "Unexpected error occurred",
      });
    });
    
    it("should throw an error if if token is null", async () => {
      await expect(
        verifyUserCode("1234567890", "123456", null)
      ).rejects.toEqual({
        errorCode: "UNKNOWN_ERROR",
        message: "Unexpected error occurred",
      });
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

    it("throws structured getinfo error for known error code", async () => {
      const errorResponse = {
        response: {
          data: {
            errorCode: "INVALID_TOKEN",
            message: "Invalid token",
          },
        },
      };
  
      (authService.api.getUserInfo as jest.Mock).mockRejectedValue(errorResponse);
  
      await expect(authService.getUserInfo("test-token")).rejects.toEqual({
        errorCode: "INVALID_TOKEN",
        message: "Invalid token",
      });
    });
  
    it("throws unknown getinfo error for unexpected failure", async () => {
      const unknownError = new Error("Something went wrong");
  
      (authService.api.getUserInfo as jest.Mock).mockRejectedValue(unknownError);
  
      await expect(authService.getUserInfo("test-token")).rejects.toEqual({
        errorCode: "UNKNOWN_ERROR",
        message: "Unexpected error occurred",
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
    
    it("throws structured sendCode error for known error code", async () => {
      const errorResponse = {
        response: {
          data: {
            errorCode: "INCORRECT_MOBILE_PWD",
            message: "user doesn't exist",
          },
        },
      };
  
      (authService.api.sendCode as jest.Mock).mockRejectedValue(errorResponse);
  
      await expect(authService.sendCode("1234567890", SendCodeRequestTypeEnum.MobileVerification)).rejects.toEqual({
        errorCode: "INCORRECT_MOBILE_PWD",
        message: "user doesn't exist",
      });
    });
  
    it("throws unknown sendCode error for unexpected failure", async () => {
      const unknownError = new Error("Something went wrong");
  
      (authService.api.sendCode as jest.Mock).mockRejectedValue(unknownError);
  
      await expect(authService.sendCode("1234567890", SendCodeRequestTypeEnum.MobileVerification)).rejects.toEqual({
        errorCode: "UNKNOWN_ERROR",
        message: "Unexpected error occurred",
      });
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
    
    it("throws structured updatePassword error for known error code", async () => {
      const errorResponse = {
        response: {
          data: {
            errorCode: "INVALID_PASSWORD",
            message: "Invalid password",
          },
        },
      };
  
      (authService.api.updatePassword as jest.Mock).mockRejectedValue(errorResponse);
  
      await expect(authService.updatePassword("1234567890", "123456", "Test1234")).rejects.toEqual({
        errorCode: "INVALID_PASSWORD",
        message: "Invalid password",
      });
    });
  
    it("throws unknown updatePassword error for unexpected failure", async () => {
      const unknownError = new Error("Something went wrong");
  
      (authService.api.updatePassword as jest.Mock).mockRejectedValue(unknownError);
  
      await expect(authService.updatePassword("1234567890", "123456", "Test1234")).rejects.toEqual({
        errorCode: "UNKNOWN_ERROR",
        message: "Unexpected error occurred",
      });
    });
  });
});
