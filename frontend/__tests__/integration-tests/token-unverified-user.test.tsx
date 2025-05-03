import { mockTokenStorage } from "./setupMocks";
import { fireEvent, waitFor } from "@testing-library/react-native";
import {
  verifyHeaderTitleAndBackButton,
  verifyHomeScreenVisible,
  verifyScreenSetup,
  waitUntilLoadingDisappeared,
} from "../TestLayout";
import { renderRouter } from "expo-router/testing-library";
import { getUserInfo, sendCode, verifyUserCode } from "@/api/authService";
import { SendCodeRequestTypeEnum } from "@/api/openapi";

describe("Token stored in the storage and user is a unverified user", () => {
  afterEach(() => {
    jest.clearAllMocks();
    mockTokenStorage.token = null; // Reset token between tests
  });

  it("should go to verify from login if token is already existing and user is not verified", async () => {
    mockTokenStorage.token = "existing-token";

    (
      getUserInfo as jest.MockedFunction<typeof getUserInfo>
    ).mockResolvedValueOnce({ is_verified: false, mobile: "0771234567" });
    (sendCode as jest.MockedFunction<typeof sendCode>).mockResolvedValueOnce({
      success: true,
    });
    (
      verifyUserCode as jest.MockedFunction<typeof verifyUserCode>
    ).mockResolvedValueOnce({ success: true, token: "new-token" });

    const renderResult = renderRouter("./app", {
      initialUrl: "/login",
    });

    await waitFor(() => {
      expect(
        renderResult.queryByTestId("test-auth-loading-spinner")
      ).not.toBeTruthy();
    });

    await waitFor(() => {
      expect(getUserInfo).toHaveBeenCalledWith("existing-token");
    });

    expect(mockTokenStorage.getToken()).toBe("existing-token");

    const { verifyCodeInput, verifyButton } = await verifyScreenSetup(
      renderResult
    );
    await verifyHeaderTitleAndBackButton(
      renderResult,
      "verify.header.title",
      false
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
        "existing-token"
      );
    });

    await verifyHomeScreenVisible(renderResult);
    await verifyHeaderTitleAndBackButton(
      renderResult,
      "home.header.title",
      false
    );

    expect(mockTokenStorage.getToken()).toBe("new-token");
  });

  it("should go to verify from register if token is already existing and user is not verified", async () => {
    mockTokenStorage.token = "existing-token";

    (
      getUserInfo as jest.MockedFunction<typeof getUserInfo>
    ).mockResolvedValueOnce({ is_verified: false, mobile: "0771234567" });
    (sendCode as jest.MockedFunction<typeof sendCode>).mockResolvedValueOnce({
      success: true,
    });
    (
      verifyUserCode as jest.MockedFunction<typeof verifyUserCode>
    ).mockResolvedValueOnce({ success: true, token: "new-token" });

    const renderResult = renderRouter("./app", {
      initialUrl: "/register",
    });

    await waitUntilLoadingDisappeared(renderResult);

    await waitFor(() => {
      expect(getUserInfo).toHaveBeenCalledWith("existing-token");
    });

    expect(mockTokenStorage.getToken()).toBe("existing-token");

    const { verifyCodeInput, verifyButton } = await verifyScreenSetup(
      renderResult
    );
    await verifyHeaderTitleAndBackButton(
      renderResult,
      "verify.header.title",
      false
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
        "existing-token"
      );
    });

    await verifyHomeScreenVisible(renderResult);
    await verifyHeaderTitleAndBackButton(
      renderResult,
      "home.header.title",
      false
    );

    expect(mockTokenStorage.getToken()).toBe("new-token");
  });

  it("should go to verify when /home requested if token is already existing and user is not verified", async () => {
    mockTokenStorage.token = "existing-token";

    (
      getUserInfo as jest.MockedFunction<typeof getUserInfo>
    ).mockResolvedValueOnce({ is_verified: false, mobile: "0771234567" });
    (sendCode as jest.MockedFunction<typeof sendCode>).mockResolvedValueOnce({
      success: true,
    });
    (
      verifyUserCode as jest.MockedFunction<typeof verifyUserCode>
    ).mockResolvedValueOnce({ success: true, token: "new-token" });

    const renderResult = renderRouter("./app", {
      initialUrl: "/home",
    });
    await waitUntilLoadingDisappeared(renderResult);

    await waitFor(() => {
      expect(getUserInfo).toHaveBeenCalledWith("existing-token");
    });

    expect(mockTokenStorage.getToken()).toBe("existing-token");

    const { verifyCodeInput, verifyButton } = await verifyScreenSetup(
      renderResult
    );
    await verifyHeaderTitleAndBackButton(
      renderResult,
      "verify.header.title",
      false
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
        "existing-token"
      );
    });

    await verifyHomeScreenVisible(renderResult);
    await verifyHeaderTitleAndBackButton(
      renderResult,
      "home.header.title",
      false
    );

    expect(mockTokenStorage.getToken()).toBe("new-token");
  });

  it("should go to verify when /verify requested if token is already existing and user is not verified", async () => {
    mockTokenStorage.token = "existing-token";

    (
      getUserInfo as jest.MockedFunction<typeof getUserInfo>
    ).mockResolvedValueOnce({ is_verified: false, mobile: "0771234567" });
    (sendCode as jest.MockedFunction<typeof sendCode>).mockResolvedValueOnce({
      success: true,
    });
    (
      verifyUserCode as jest.MockedFunction<typeof verifyUserCode>
    ).mockResolvedValueOnce({ success: true, token: "new-token" });

    const renderResult = renderRouter("./app", {
      initialUrl: "/verify",
    });

    await waitUntilLoadingDisappeared(renderResult);

    await waitFor(() => {
      expect(getUserInfo).toHaveBeenCalledWith("existing-token");
    });

    expect(mockTokenStorage.getToken()).toBe("existing-token");

    const { verifyCodeInput, verifyButton } = await verifyScreenSetup(
      renderResult
    );
    await verifyHeaderTitleAndBackButton(
      renderResult,
      "verify.header.title",
      false
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
        "existing-token"
      );
    });

    await verifyHomeScreenVisible(renderResult);
    await verifyHeaderTitleAndBackButton(
      renderResult,
      "home.header.title",
      false
    );

    expect(mockTokenStorage.getToken()).toBe("new-token");
  });
});
