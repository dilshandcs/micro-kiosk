import React from "react";
import { render, renderHook, waitFor } from "@testing-library/react-native";
import { AuthProvider, useAuth } from "../AuthContext";
import axios from "axios";
import { Text } from "react-native";
import { mockTokenStorage } from "@/__tests__/integration-tests/setupMocks";
import { getUserInfo } from "@/api/authService";

jest.mock("axios");

const mockAxiosGet = axios.get as jest.Mock;

// Test Component
const TestComponent = () => {
  const { token, isVerified, isAuthenticated, mobile, loading } = useAuth();

  return (
    <div>
      <Text testID="token">{token}</Text>
      <Text testID="verified">{isVerified.toString()}</Text>
      <Text testID="authenticated">{isAuthenticated.toString()}</Text>
      <Text testID="mobile">{mobile}</Text>
      <Text testID="loading">{loading.toString()}</Text>
    </div>
  );
};

describe("AuthProvider", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should initialize with no token and logout if no token exists", async () => {
    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    await waitFor(() => {
      expect(getByTestId("authenticated").props.children).toBe("false");
      expect(getByTestId("verified").props.children).toBe("false");
      expect(getByTestId("token").props.children).toBe(null);
      expect(getByTestId("mobile").props.children).toBe(null);
      expect(getByTestId("loading").props.children).toBe("true");
    });
  });

  it("should log in if valid token exists", async () => {
    mockTokenStorage.token = "valid-token";
    (getUserInfo as jest.MockedFunction<typeof getUserInfo>).mockResolvedValue({
      is_verified: true,
      mobile: "1234567890",
    });

    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(getByTestId("authenticated").props.children).toBe("true");
      expect(getByTestId("token").props.children).toBe("valid-token");
      expect(getByTestId("verified").props.children).toBe("true");
      expect(getByTestId("mobile").props.children).toBe("1234567890");
      expect(getByTestId("loading").props.children).toBe("false");
    });
  });

  it("should logout if token is invalid or request fails", async () => {
    mockTokenStorage.token = "valid-token";
    mockAxiosGet.mockRejectedValue(new Error("Unauthorized"));

    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(getByTestId("authenticated").props.children).toBe("false");
      expect(getByTestId("verified").props.children).toBe("false");
      expect(getByTestId("token").props.children).toBe(null);
      expect(getByTestId("mobile").props.children).toBe(null);
      expect(getByTestId("loading").props.children).toBe("true");
    });
  });

  it("should allow manual login and logout through the hook", async () => {
    const LoginLogoutComponent = () => {
      const { login, logout, isAuthenticated } = useAuth();

      React.useEffect(() => {
        const doLoginLogout = async () => {
          await login("abc123", true, "9876543210");
          await logout();
        };
        doLoginLogout();
      }, [login, logout]);

      return <Text testID="auth-status">{isAuthenticated.toString()}</Text>;
    };

    const { getByTestId } = render(
      <AuthProvider>
        <LoginLogoutComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(getByTestId("auth-status").props.children).toBe("false");
    });
  });

  it("should throw error if useAuth used outside of provider", () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {}); // Suppress error log

    const BrokenComponent = () => {
      useAuth(); // This should throw
      return null;
    };

    expect(() => render(<BrokenComponent />)).toThrow(
      "useAuth must be used within AuthProvider"
    );

    spy.mockRestore();
  });

  it("should throw an error when used outside of AuthProvider", () => {
    try {
      renderHook(() => useAuth());
    } catch (err) {
      expect(err).toEqual(
        new Error("useAuth must be used within AuthProvider")
      );
    }
  });
});
