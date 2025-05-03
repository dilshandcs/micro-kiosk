import { mockTokenStorage } from "./setupMocks";
import { fireEvent, waitFor } from "@testing-library/react-native";
import {
  loginScreenSetup,
  registerScreenSetup,
  verifyHeaderTitleAndBackButton,
  verifyHomeScreenVisible,
  verifyLoginScreenVisible,
  verifyScreenSetup,
  verifyVerifyScreenVisible,
} from "../TestLayout";
import { renderRouter } from "expo-router/testing-library";
import {
  loginUser,
  registerUser,
  sendCode,
  verifyUserCode,
} from "@/api/authService";
import { SendCodeRequestTypeEnum } from "@/api/openapi";

describe("Token is not stored in the storage and User is not a verified user", () => {
  afterEach(() => {
    jest.clearAllMocks();
    mockTokenStorage.token = null; // Reset token between tests
  });

  it("user should be redirected to verify and from verify to home from login when credentials and verification code are correct", async () => {
    (loginUser as jest.MockedFunction<typeof loginUser>).mockResolvedValueOnce({
      token: "test-token",
      is_verified: false,
    });
    (sendCode as jest.MockedFunction<typeof sendCode>).mockResolvedValueOnce({
      success: true,
    });
    (
      verifyUserCode as jest.MockedFunction<typeof verifyUserCode>
    ).mockResolvedValueOnce({ success: true, token: "new-token" });

    const renderResult = renderRouter("./app", {
      initialUrl: "/login",
    });
    const { mobileInput, passwordInput, loginButton } = await loginScreenSetup(
      renderResult
    );

    fireEvent.changeText(mobileInput, "0771234567");
    fireEvent.changeText(passwordInput, "Password123");
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(loginUser).toHaveBeenCalledWith("0771234567", "Password123");
    });

    await waitFor(() => {
      expect(mockTokenStorage.saveToken).toHaveBeenCalledWith("test-token");
      expect(mockTokenStorage.token).toBe("test-token");
    });

    const { verifyCodeInput, verifyButton } = await verifyScreenSetup(
      renderResult
    );

    await waitFor(() => {
      expect(sendCode).toHaveBeenCalledWith(
        "0771234567",
        SendCodeRequestTypeEnum.MobileVerification
      );
    });

    const inputValue: string[] = ["1", "2", "3", "4", "5", "6"];

    inputValue.forEach((digit, index) => {
      fireEvent.changeText(verifyCodeInput[index], digit);
    });
    fireEvent.press(verifyButton);

    await waitFor(() => {
      expect(verifyUserCode).toHaveBeenCalledWith(
        "0771234567",
        "123456",
        "test-token"
      );
    });

    await verifyHomeScreenVisible(renderResult);
    await verifyHeaderTitleAndBackButton(
      renderResult,
      "home.header.title",
      false
    );

    await waitFor(() => {
      expect(mockTokenStorage.saveToken).toHaveBeenCalledWith("new-token");
      expect(mockTokenStorage.token).toBe("new-token");
    });
  });

  it("should register a new user, navigate to verify, no back button in  verify, signout should be redirected to login", async () => {
    (
      registerUser as jest.MockedFunction<typeof registerUser>
    ).mockResolvedValueOnce({
      message: "User registered successfully",
      is_verified: false,
      token: "new-token",
      mobile: "0771234567",
    });

    const renderResult = renderRouter("./app", {
      initialUrl: "/register",
    });

    const { mobileInput, passwordInput, registerButton } =
      await registerScreenSetup(renderResult);

    fireEvent.changeText(mobileInput, "0771234567");
    fireEvent.changeText(passwordInput, "Password123");
    fireEvent.press(registerButton);

    await waitFor(() => {
      expect(registerUser).toHaveBeenCalledWith("0771234567", "Password123");
    });

    await verifyVerifyScreenVisible(renderResult);
    await verifyHeaderTitleAndBackButton(
      renderResult,
      "verify.header.title",
      false
    );

    await waitFor(() => {
      expect(mockTokenStorage.saveToken).toHaveBeenCalledWith("new-token");
      expect(mockTokenStorage.token).toBe("new-token");
    });

    const logoutButton = renderResult.getByTestId("header-button-logout");
    fireEvent.press(logoutButton);

    await verifyLoginScreenVisible(renderResult);

    await waitFor(() => {
      expect(mockTokenStorage.removeToken).toHaveBeenCalled();
      expect(mockTokenStorage.token).toBe(null);
    });
  });

  it("should login user, navigate to verify, no back button in  verify, signout should be redirected to login", async () => {
    (loginUser as jest.MockedFunction<typeof loginUser>).mockResolvedValueOnce({
      token: "test-token",
      is_verified: false,
    });
    const renderResult = renderRouter("./app", {
      initialUrl: "/login",
    });

    const { mobileInput, passwordInput, loginButton } = await loginScreenSetup(
      renderResult
    );

    fireEvent.changeText(mobileInput, "0771234567");
    fireEvent.changeText(passwordInput, "Password123");
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(loginUser).toHaveBeenCalledWith("0771234567", "Password123");
    });

    await verifyVerifyScreenVisible(renderResult);
    await verifyHeaderTitleAndBackButton(
      renderResult,
      "verify.header.title",
      false
    );
    await waitFor(() => {
      expect(mockTokenStorage.saveToken).toHaveBeenCalledWith("test-token");
      expect(mockTokenStorage.token).toBe("test-token");
    });

    const logoutButton = renderResult.getByTestId("header-button-logout");
    fireEvent.press(logoutButton);

    await verifyLoginScreenVisible(renderResult);

    await waitFor(() => {
      expect(mockTokenStorage.removeToken).toHaveBeenCalled();
      expect(mockTokenStorage.token).toBe(null);
    });
  });

  it("should login user, navigate to verify, verify request failure", async () => {
    (loginUser as jest.MockedFunction<typeof loginUser>).mockResolvedValueOnce({
      token: "test-token",
      is_verified: false,
    });
    (sendCode as jest.MockedFunction<typeof sendCode>).mockResolvedValueOnce({
      success: true,
    });
    (
      verifyUserCode as jest.MockedFunction<typeof verifyUserCode>
    ).mockRejectedValueOnce(new Error("Invalid code"));

    const renderResult = renderRouter("./app", {
      initialUrl: "/login",
    });

    const { mobileInput, passwordInput, loginButton } = await loginScreenSetup(
      renderResult
    );

    fireEvent.changeText(mobileInput, "0771234567");
    fireEvent.changeText(passwordInput, "Password123");
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(loginUser).toHaveBeenCalledWith("0771234567", "Password123");
    });

    await verifyVerifyScreenVisible(renderResult);
    await verifyHeaderTitleAndBackButton(
      renderResult,
      "verify.header.title",
      false
    );

    const { verifyCodeInput, verifyButton } = await verifyScreenSetup(
      renderResult
    );

    await waitFor(() => {
      expect(sendCode).toHaveBeenCalledWith(
        "0771234567",
        SendCodeRequestTypeEnum.MobileVerification
      );
    });

    const inputValue: string[] = ["1", "2", "3", "4", "5", "6"];

    inputValue.forEach((digit, index) => {
      fireEvent.changeText(verifyCodeInput[index], digit);
    });
    fireEvent.press(verifyButton);

    await waitFor(() => {
      expect(verifyUserCode).toHaveBeenCalledWith(
        "0771234567",
        "123456",
        "test-token"
      );
    });

    expect(
      renderResult.queryByText(/verify.screen.error.invalidCode/)
    ).toBeTruthy();
  });
});
