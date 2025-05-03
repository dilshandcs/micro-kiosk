import { mockTokenStorage } from "./setupMocks";
import { fireEvent, waitFor } from "@testing-library/react-native";
import {
  loginScreenSetup,
  verifyHeaderTitleAndBackButton,
  verifyHomeScreenVisible,
} from "../TestLayout";
import { renderRouter } from "expo-router/testing-library";
import { loginUser } from "@/api/authService";

describe("Token is not stored in the storage and User is a verified user", () => {
  afterEach(() => {
    jest.clearAllMocks();
    mockTokenStorage.token = null; // Reset token between tests
  });

  it("user should be redirected to home from login when credentials are correct", async () => {
    (loginUser as jest.MockedFunction<typeof loginUser>).mockResolvedValueOnce({
      token: "test-token",
      is_verified: true,
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

    await waitFor(() => {
      expect(mockTokenStorage.saveToken).toHaveBeenCalledWith("test-token");
      expect(mockTokenStorage.token).toBe("test-token");
    });

    await verifyHomeScreenVisible(renderResult);
    await verifyHeaderTitleAndBackButton(
      renderResult,
      "home.header.title",
      false
    );
  });
});
