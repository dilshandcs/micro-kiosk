import { mockTokenStorage, mockApiUrl } from "./setupMocks";
import { waitFor } from "@testing-library/react-native";
import {
  verifyHeaderTitleAndBackButton,
  verifyHomeScreenVisible,
  verifyLoginScreenVisible,
  waitUntilLoadingDisappeared,
} from "../TestLayout";
import { renderRouter } from "expo-router/testing-library";
import { getUserInfo } from "@/api/authService";

describe("Token stored in the storage and user is a verified user", () => {
  afterEach(() => {
    jest.clearAllMocks();
    mockTokenStorage.token = null; // Reset token between tests
  });

  it("should go to home from login if token is already existing", async () => {
    mockTokenStorage.token = "existing-token";

    (
      getUserInfo as jest.MockedFunction<typeof getUserInfo>
    ).mockResolvedValueOnce({ is_verified: true, mobile: "0771234567" });

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

    await verifyHeaderTitleAndBackButton(
      renderResult,
      "home.header.title",
      false
    );
    await verifyHomeScreenVisible(renderResult);
  });

  it("should go to home from register if token is already existing and user is verified", async () => {
    mockTokenStorage.token = "existing-token";

    (
      getUserInfo as jest.MockedFunction<typeof getUserInfo>
    ).mockResolvedValueOnce({ is_verified: true, mobile: "0771234567" });

    const renderResult = renderRouter("./app", {
      initialUrl: "/register",
    });

    await waitUntilLoadingDisappeared(renderResult);

    await waitFor(() => {
      expect(getUserInfo).toHaveBeenCalledWith("existing-token");
    });

    await verifyHeaderTitleAndBackButton(
      renderResult,
      "home.header.title",
      false
    );
    await verifyHomeScreenVisible(renderResult);
  });

  it("should go to home when /home requested if token is already existing and user is verified", async () => {
    mockTokenStorage.token = "existing-token";

    (
      getUserInfo as jest.MockedFunction<typeof getUserInfo>
    ).mockResolvedValueOnce({ is_verified: true, mobile: "0771234567" });

    const renderResult = renderRouter("./app", {
      initialUrl: "/home",
    });
    await waitUntilLoadingDisappeared(renderResult);

    await waitFor(() => {
      expect(getUserInfo).toHaveBeenCalledWith("existing-token");
    });

    await verifyHeaderTitleAndBackButton(
      renderResult,
      "home.header.title",
      false
    );
    await verifyHomeScreenVisible(renderResult);
  });

  it("should go to home when /verify requested if token is already existing and user is verified", async () => {
    mockTokenStorage.token = "existing-token";

    (
      getUserInfo as jest.MockedFunction<typeof getUserInfo>
    ).mockResolvedValueOnce({ is_verified: true, mobile: "0771234567" });

    const renderResult = renderRouter("./app", {
      initialUrl: "/verify",
    });

    await waitUntilLoadingDisappeared(renderResult);

    await waitFor(() => {
      expect(getUserInfo).toHaveBeenCalledWith("existing-token");
    });

    await verifyHeaderTitleAndBackButton(
      renderResult,
      "home.header.title",
      false
    );
    await verifyHomeScreenVisible(renderResult);
  });

  it("should logout user if token is stored but there is invalid token", async () => {
    mockTokenStorage.token = "existing-token";

    (getUserInfo as jest.MockedFunction<typeof getUserInfo>).mockRejectedValue(
      new Error("Invalid token")
    );

    const renderResult = renderRouter("./app", {
      initialUrl: "/home",
    });

    await waitUntilLoadingDisappeared(renderResult);

    await waitFor(() => {
      expect(getUserInfo).toHaveBeenCalledWith("existing-token");
    });

    await verifyHeaderTitleAndBackButton(
      renderResult,
      "login.header.title",
      false
    );
    await verifyLoginScreenVisible(renderResult);
  });
});
