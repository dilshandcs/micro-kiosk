import { mockTokenStorage } from './setupMocks'; 
import { fireEvent, waitFor } from "@testing-library/react-native";
import {
  loginScreenSetup,
  registerScreenSetup,
  verifyForgotPasswordScreenVisible,
  verifyHeaderTitleAndBackButton,
  verifyHomeScreenVisible,
  verifyLoginScreenVisible,
  verifyRegisterScreenVisible,
  verifyScreenSetup,
  verifyVerifyResetScreenVisible,
  waitUntilLoadingDisappeared,
} from "../TestLayout";
import { renderRouter } from 'expo-router/testing-library';
import { loginUser, registerUser, sendCode, updatePassword, verifyUserCode } from '@/api/authService';
import { SendCodeRequestTypeEnum } from '@/api/openapi';
import VerifyResetScreen from '@/app/(auth)/verify-reset';

describe("Forgot Password UI flows", () => {
  afterEach(() => {
    jest.clearAllMocks();
    mockTokenStorage.token = null; // Reset token between tests
  });

  it("view forgot password screen", async () => {
    const renderResult = renderRouter("./app", {
      initialUrl: "/login",
    });

    await waitUntilLoadingDisappeared(renderResult);
    await verifyLoginScreenVisible(renderResult);

    const forgotPassButton = renderResult.getByTestId("login-button-forgot-password");
    fireEvent.press(forgotPassButton);

    await verifyForgotPasswordScreenVisible(renderResult);
    await verifyHeaderTitleAndBackButton(
      renderResult,
      "forgot.header.title",
      true
    );


    const renderResult2 = renderRouter("./app", {
      initialUrl: "/forgot-password",
    });
    await waitUntilLoadingDisappeared(renderResult2);
    await verifyForgotPasswordScreenVisible(renderResult2);
    await verifyHeaderTitleAndBackButton(
      renderResult2,
      "forgot.header.title",
      false
    );
  });

  it("update password flow", async () => {
    (sendCode as jest.MockedFunction<typeof sendCode>).mockResolvedValueOnce({
      success: true,
    });

    (updatePassword as jest.MockedFunction<typeof updatePassword>).mockResolvedValueOnce({
      success: true,
    });
    const renderResult = renderRouter("./app", {
      initialUrl: "/forgot-password",
    });
    await waitUntilLoadingDisappeared(renderResult);
    await verifyForgotPasswordScreenVisible(renderResult);

    const mobileInput = renderResult.getByTestId("forgot-text-input-mobile");
    const sendCodeButton = renderResult.getByTestId("forgot-button-send-code");

    fireEvent.changeText(mobileInput, "0771234567");
    fireEvent.press(sendCodeButton);

    await waitFor(() => {
      expect(sendCode).toHaveBeenCalledWith(
        "0771234567",
        SendCodeRequestTypeEnum.PasswordReset
      );
    });
    await verifyVerifyResetScreenVisible(renderResult);

    const codeInput = renderResult.getByTestId("verifyreset-text-input-code");
    const newPasswordInput = renderResult.getByTestId("verifyreset-text-input-new-pw");
    const resetButton = renderResult.getByTestId("verifyreset-button-reset-pw");
    fireEvent.changeText(codeInput, "123456");
    fireEvent.changeText(newPasswordInput, "Test1234");
    fireEvent.press(resetButton);
    await waitFor(() => {
      expect(updatePassword).toHaveBeenCalledWith(
        "0771234567",
        "123456",
        "Test1234"
      );
    });

    await verifyLoginScreenVisible(renderResult);
  });

  it("error when sending verification code", async () => {
    (sendCode as jest.MockedFunction<typeof sendCode>).mockRejectedValue(new Error("Network error"));

    const renderResult = renderRouter("./app", {
      initialUrl: "/forgot-password",
    });
    await waitUntilLoadingDisappeared(renderResult);
    await verifyForgotPasswordScreenVisible(renderResult);

    const mobileInput = renderResult.getByTestId("forgot-text-input-mobile");
    const sendCodeButton = renderResult.getByTestId("forgot-button-send-code");

    fireEvent.changeText(mobileInput, "0771234567");
    fireEvent.press(sendCodeButton);

    await waitFor(() => {
      expect(sendCode).toHaveBeenCalledWith(
        "0771234567",
        SendCodeRequestTypeEnum.PasswordReset
      );

      expect(
        renderResult.queryByText(/forgot.screen.error.sendCodeFailed/)
      ).toBeTruthy();
    });
  });

  it("error when updating the password", async () => {
    (sendCode as jest.MockedFunction<typeof sendCode>).mockResolvedValueOnce({
      success: true,
    });

    (updatePassword as jest.MockedFunction<typeof updatePassword>).mockRejectedValue(new Error("Network error"));
    const renderResult = renderRouter("./app", {
      initialUrl: "/forgot-password",
    });
    await waitUntilLoadingDisappeared(renderResult);
    await verifyForgotPasswordScreenVisible(renderResult);

    const mobileInput = renderResult.getByTestId("forgot-text-input-mobile");
    const sendCodeButton = renderResult.getByTestId("forgot-button-send-code");

    fireEvent.changeText(mobileInput, "0771234567");
    fireEvent.press(sendCodeButton);

    await waitFor(() => {
      expect(sendCode).toHaveBeenCalledWith(
        "0771234567",
        SendCodeRequestTypeEnum.PasswordReset
      );
    });
    await verifyVerifyResetScreenVisible(renderResult);

    const codeInput = renderResult.getByTestId("verifyreset-text-input-code");
    const newPasswordInput = renderResult.getByTestId("verifyreset-text-input-new-pw");
    const resetButton = renderResult.getByTestId("verifyreset-button-reset-pw");
    fireEvent.changeText(codeInput, "123456");
    fireEvent.changeText(newPasswordInput, "Test1234");
    fireEvent.press(resetButton);
    await waitFor(() => {
      expect(updatePassword).toHaveBeenCalledWith(
        "0771234567",
        "123456",
        "Test1234"
      );

      expect(
        renderResult.queryByText(/reset.screen.error.updatePWFailed/)
      ).toBeTruthy();
    });
  });

  it("should navigate to forgot password if verify reset is called without mobile directly", async () => {

    (updatePassword as jest.MockedFunction<typeof updatePassword>).mockRejectedValue(new Error("Network error"));
    const renderResult = renderRouter("./app", {
      initialUrl: "/verify-reset",
    });
    await waitUntilLoadingDisappeared(renderResult);
    await verifyForgotPasswordScreenVisible(renderResult);
  });
});
