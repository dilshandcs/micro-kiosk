import axios from "axios";
import { jest } from "@jest/globals";

// Mock axios
jest.mock("axios");

// Mock token management functions
export const mockTokenStorage = {
  token: null as string | null,
  getToken: jest.fn((): string | null => mockTokenStorage.token),
  saveToken: jest.fn((newToken: string) => {
    mockTokenStorage.token = newToken;
  }),
  removeToken: jest.fn(() => {
    mockTokenStorage.token = null;
  }),
};

// Mock AuthProvider to use the mocked token functions
jest.mock("../../utils/token", () => ({
  getToken: () => mockTokenStorage.getToken(),
  saveToken: (newToken: string) => mockTokenStorage.saveToken(newToken),
  removeToken: () => mockTokenStorage.removeToken(),
}));

// Mock i18n translations
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: () => new Promise(() => {}),
    },
  }),
  initReactI18next: {
    type: "3rdParty",
    init: () => {},
  },
}));

// Mock vector icons
jest.mock("@expo/vector-icons", () => {
  const { Text } = require("react-native");
  return new Proxy(
    {},
    {
      get: (target, prop) => {
        return () => <Text>{prop}</Text>;
      },
    }
  );
});

// Mock expo-font
jest.mock("expo-font", () => ({
  loadAsync: jest.fn(() => Promise.resolve()), // Mock loadAsync to resolve immediately
  isLoaded: jest.fn(() => true), // Mock isLoaded to always return true
}));

jest.mock("../../api/authService", () => ({
  loginUser: jest.fn(),
  verifyUserCode: jest.fn(),
  registerUser: jest.fn(),
  getUserInfo: jest.fn(),
  sendCode: jest.fn(),
}));

// Export axios mock for reuse
export const mockAxios = axios as jest.Mocked<typeof axios>;

export const mockApiUrl = process.env.EXPO_PUBLIC_API_URL;
