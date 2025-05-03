import { mockTokenStorage } from "./setupMocks";
import { fireEvent, waitFor } from "@testing-library/react-native";
import { Text } from "react-native";
import { registerScreenSetup } from "../TestLayout";
import { renderRouter } from "expo-router/testing-library";
import RegisterScreen from "@/app/(auth)/register";
import AuthLayout from "@/app/(auth)/_layout";
import Layout from "@/app/_layout";
import { registerUser } from "@/api/authService";

describe("Tests general UI flows", () => {
  afterEach(() => {
    jest.clearAllMocks();
    mockTokenStorage.token = null; // Reset token between tests
  });

  const validMobilePrefixes = [
    "070",
    "071",
    "072",
    "075",
    "076",
    "077",
    "078",
    "70",
    "71",
    "72",
    "75",
    "76",
    "77",
    "78",
  ];
  const invalidMobileNumbers = ["1234567890", "0812345678", "0791234567"];
  const shortLengthMobileNumbers = ["070123456", "70123456"];
  const longLengthMobileNumbers = ["07512345678", "7512345678"];
  const invalidPasswords = [
    { password: "password", reason: "Missing capital letter and digit" },
    {
      password: "12345678",
      reason: "Missing capital letter and lowercase letter",
    },
    {
      password: "PASSWORD",
      reason: "Missing digit letter and lowercase letter",
    },
    { password: "password1", reason: "Missing capital letter" },
    { password: "passwordS", reason: "Missing digits" },
    { password: "PASSWORD1", reason: "Missing lowercase letter" },
    { password: "Pass123", reason: "Too short" },
  ];

  validMobilePrefixes.forEach((prefix) => {
    it(`should handle successful registration for mobile prefix ${prefix}`, async () => {
      const mobileNumber =
        prefix.length === 2 ? `0${prefix}1234567` : `${prefix}1234567`;

      (
        registerUser as jest.MockedFunction<typeof registerUser>
      ).mockResolvedValueOnce({
        message: "User registered successfully",
        is_verified: false,
        token: "new-token",
        mobile: mobileNumber,
      });

      const renderResult = renderRouter(
        {
          _layout: { default: () => <Layout /> },
          "(auth)/_layout": { default: () => <AuthLayout /> },
          "(auth)/register": { default: () => <RegisterScreen /> },
          "(protected)/verify": { default: () => <Text>Test Verify</Text> },
        },
        {
          initialUrl: "/register",
        }
      );

      const { mobileInput, passwordInput, registerButton } =
        await registerScreenSetup(renderResult);

      fireEvent.changeText(mobileInput, `${prefix}1234567`);
      fireEvent.changeText(passwordInput, "Password123");
      fireEvent.press(registerButton);

      await waitFor(() => {
        expect(registerUser).toHaveBeenCalledWith(mobileNumber, "Password123");
      });

      await waitFor(() => {
        expect(renderResult.getAllByText("Test Verify").length).toBeGreaterThan(
          0
        );
      });
    });
  });

  [
    ...invalidMobileNumbers,
    ...shortLengthMobileNumbers,
    ...longLengthMobileNumbers,
  ].forEach((invalidMobile) => {
    it(`should show an error message for invalid mobile number: ${invalidMobile}`, async () => {
      const renderResult = renderRouter(
        {
          _layout: { default: () => <Layout /> },
          "(auth)/_layout": { default: () => <AuthLayout /> },
          "(auth)/register": { default: () => <RegisterScreen /> },
        },
        {
          initialUrl: "/register",
        }
      );

      const { mobileInput, passwordInput, registerButton } =
        await registerScreenSetup(renderResult);

      fireEvent.changeText(mobileInput, invalidMobile);
      fireEvent.changeText(passwordInput, "Password123");
      fireEvent.press(registerButton);

      await waitFor(() => {
        expect(
          renderResult.queryByText(/register.screen.error.invalidMobile/)
        ).toBeTruthy();
      });

      // Verify that the /register backend endpoint is not called
      expect(registerUser).not.toHaveBeenCalled();
    });
  });

  invalidPasswords.forEach(({ password, reason }) => {
    it(`should show an error message for invalid password: ${reason}`, async () => {
      const renderResult = renderRouter(
        {
          _layout: { default: () => <Layout /> },
          "(auth)/_layout": { default: () => <AuthLayout /> },
          "(auth)/register": { default: () => <RegisterScreen /> },
        },
        {
          initialUrl: "/register",
        }
      );

      const { mobileInput, passwordInput, registerButton } =
        await registerScreenSetup(renderResult);

      fireEvent.changeText(mobileInput, "0771234567");
      fireEvent.changeText(passwordInput, password);
      fireEvent.press(registerButton);

      await waitFor(() => {
        expect(
          renderResult.queryByText(/register.screen.error.invalidPassword/)
        ).toBeTruthy();
      });

      // Verify that the /register backend endpoint is not called
      expect(registerUser).not.toHaveBeenCalled();
    });
  });
});
