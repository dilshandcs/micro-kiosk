import { mockTokenStorage } from './setupMocks'; 
import { fireEvent, waitFor } from "@testing-library/react-native";
import {
  loginScreenSetup,
  registerScreenSetup,
  verifyHeaderTitleAndBackButton,
  verifyHomeScreenVisible,
  verifyLoginScreenVisible,
  verifyRegisterScreenVisible,
  verifyScreenSetup,
  waitUntilLoadingDisappeared,
} from "../TestLayout";
import { renderRouter } from 'expo-router/testing-library';
import { loginUser, registerUser, sendCode, verifyUserCode } from '@/api/authService';
import { SendCodeRequestTypeEnum } from '@/api/openapi';

describe("Tests general UI flows", () => {
  afterEach(() => {
    jest.clearAllMocks();
    mockTokenStorage.token = null; // Reset token between tests
  });

  it("login should have main buttons", async () => {
    (loginUser as jest.MockedFunction<typeof loginUser>).mockRejectedValueOnce(new Error("Invalid credentials"));

    const renderResult = renderRouter("./app", {
      initialUrl: "/login",
    });

    await waitUntilLoadingDisappeared(renderResult);
    await verifyLoginScreenVisible(renderResult);

    expect(renderResult.getByTestId("login-button-login")).toBeTruthy();
    expect(renderResult.getByTestId("login-button-register")).toBeTruthy();
    expect(renderResult.getByTestId("login-button-forgot-password")).toBeTruthy();
  });

  it("should show an error message on login failure", async () => {
    (loginUser as jest.MockedFunction<typeof loginUser>).mockRejectedValueOnce(new Error("Invalid credentials"));

    const renderResult = renderRouter("./app", {
      initialUrl: "/login",
    });

    const { mobileInput, passwordInput, loginButton } = await loginScreenSetup(
      renderResult
    );
    fireEvent.changeText(mobileInput, "0771234567");
    fireEvent.changeText(passwordInput, "WrongPassword");
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(loginUser).toHaveBeenCalledWith("0771234567", "WrongPassword");
      expect(
        renderResult.queryByText(/login.screen.error.invalidCred/)
      ).toBeTruthy();
    });
    await verifyHeaderTitleAndBackButton(
      renderResult,
      "login.header.title",
      false
    );
  });

  it("should show an error message on registration failure", async () => {
    (registerUser as jest.MockedFunction<typeof registerUser>).mockRejectedValueOnce(
      new Error("Registration failed")
    );

    const renderResult = renderRouter("./app", {
      initialUrl: "/register",
    });


    const { mobileInput, passwordInput, registerButton } = await registerScreenSetup(
      renderResult
    );

    fireEvent.changeText(mobileInput, "0771234567");
    fireEvent.changeText(passwordInput, "Password123");
    fireEvent.press(registerButton);

    await waitFor(() => {
      expect(registerUser).toHaveBeenCalledWith("0771234567", "Password123");
      expect(renderResult.queryByText(/register.screen.error.regFailed/)).toBeTruthy();
    });
  });


  it('should navigate to the register screen when "Go to Register" is pressed', async () => {
    const renderResult = renderRouter("./app", {
      initialUrl: "/login",
    });
    const { getByTestId } = renderResult;

    await loginScreenSetup(renderResult);

    const registerButton = getByTestId("login-button-register");
    fireEvent.press(registerButton);

    await waitFor(() => {
      expect(getByTestId("register-button-register")).toBeTruthy();
    });
    await verifyHeaderTitleAndBackButton(
      renderResult,
      "register.header.title",
      true
    );
    const backButton = getByTestId("header-button-back");
    fireEvent.press(backButton);

    await verifyLoginScreenVisible(renderResult);
    await verifyHeaderTitleAndBackButton(
      renderResult,
      "login.header.title",
      false
    );
  });

  it("no back button if user lands on register screen directly", async () => {
    const renderResult = renderRouter("./app", {
      initialUrl: "/register",
    });

    await waitUntilLoadingDisappeared(renderResult);
    await verifyRegisterScreenVisible(renderResult);
    await verifyHeaderTitleAndBackButton(
      renderResult,
      "register.header.title",
      false
    );
  });

  it("should register a new user, verify the code, and navigate to home", async () => {
    (registerUser as jest.MockedFunction<typeof registerUser>).mockResolvedValueOnce({
        message: "User registered successfully",
        is_verified: false,
        token: "new-token",
        mobile: "0771234567",
      });
    (sendCode as jest.MockedFunction<typeof sendCode>).mockResolvedValueOnce({ success: true });
    (verifyUserCode as jest.MockedFunction<typeof verifyUserCode>).mockResolvedValueOnce({ success: true, token: "new-new-token" });
    
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

    expect(mockTokenStorage.getToken()).toBe("new-token");

    const { verifyCodeInput, verifyButton} = await verifyScreenSetup(renderResult);

    await waitFor(() => {
      expect(sendCode).toHaveBeenCalledWith("0771234567", SendCodeRequestTypeEnum.MobileVerification);
    });
    
    const inputValue: string[] = ["1", "2", "3", "4", "5", "6"];
    
    inputValue.forEach((digit, index) => {
      fireEvent.changeText(verifyCodeInput[index], digit);
    });
    fireEvent.press(verifyButton);

    await waitFor(() => {
      expect(verifyUserCode).toHaveBeenCalledWith("0771234567", "123456", "new-token");
    });

    await verifyHomeScreenVisible(renderResult);
    await verifyHeaderTitleAndBackButton(renderResult, "home.header.title", false); 
    
    expect(mockTokenStorage.getToken()).toBe("new-new-token");

  });

  it('should navigate to the login screen when "Go to Login" is pressed', async () => {
    const renderResult = renderRouter("./app", {
      initialUrl: "/register",
    });

    await waitUntilLoadingDisappeared(renderResult);
    await verifyRegisterScreenVisible(renderResult);

    fireEvent.press(renderResult.getByTestId("register-button-login"));

    await verifyLoginScreenVisible(renderResult);
  });

  it('should navigate to the login screen when hit verify (no token)', async () => {
    const renderResult = renderRouter("./app", {
      initialUrl: "/home",
    });

    await waitUntilLoadingDisappeared(renderResult);
    await verifyLoginScreenVisible(renderResult);
  });
  
  it('should navigate to the login screen when hit verify (no token)', async () => {
    const renderResult = renderRouter("./app", {
      initialUrl: "/verify",
    });
    await waitUntilLoadingDisappeared(renderResult);
    await verifyLoginScreenVisible(renderResult);
  });

  it('toggles password visibility when show password button is pressed', async () => {
    const renderResult= renderRouter("./app", {
      initialUrl: "/login",
    });
    
    await waitUntilLoadingDisappeared(renderResult);
    await verifyLoginScreenVisible(renderResult);
    
    const passwordInput = renderResult.getByTestId('login-text-input-password');
    const toggleButton = renderResult.getByTestId('login-button-toggle-password');

    expect(passwordInput.props.secureTextEntry).toBe(true);

    fireEvent.press(toggleButton);

    expect(passwordInput.props.secureTextEntry).toBe(false);
  });

  it("should redirect to the login page", async () => {
    const renderResult = renderRouter("./app", {
      initialUrl: "/",
    });
    await waitUntilLoadingDisappeared(renderResult);
    await verifyLoginScreenVisible(renderResult);
  });
});
