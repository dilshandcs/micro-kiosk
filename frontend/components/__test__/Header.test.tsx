import { render, fireEvent } from "@testing-library/react-native";
import { Header } from "../Header";
import { useHeader } from "../../context/HeaderContext";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "expo-router";

const mockLogout = jest.fn();
const mockChangeLanguage = jest.fn();

jest.mock("../../context/HeaderContext", () => ({
  useHeader: jest.fn(),
}));

jest.mock("../../context/AuthContext", () => ({
  useAuth: jest.fn(),
}));

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

jest.mock("i18next", () => ({
  use: jest.fn().mockReturnThis(),
  init: jest.fn().mockResolvedValueOnce(undefined), // Mock init to return a resolved promise
  changeLanguage: (s) => mockChangeLanguage(s),
}));

describe("Header Component", () => {
  const mockRouter = {
    canGoBack: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
  };

  beforeEach(() => {
    (useHeader as jest.Mock).mockReturnValue({
      title: "Test Title",
      showBack: true,
    });

    (useAuth as jest.Mock).mockReturnValue({
      logout: mockLogout,
      isAuthenticated: true,
    });

    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders the title correctly", () => {
    const { getByTestId } = render(<Header />);
    expect(getByTestId("header-text-title").props.children).toBe("Test Title");
  });

  it("renders the back button when showBack is true and canGoBack is true", () => {
    mockRouter.canGoBack.mockReturnValue(true);
    const { getByTestId } = render(<Header />);
    const backButton = getByTestId("header-button-back");
    expect(backButton).toBeTruthy();

    fireEvent.press(backButton);
    expect(mockRouter.back).toHaveBeenCalled();
  });

  it("does not render the back button when showBack is false", () => {
    (useHeader as jest.Mock).mockReturnValue({
      title: "Test Title",
      showBack: false,
    });

    const { queryByTestId } = render(<Header />);
    expect(queryByTestId("header-button-back")).toBeNull();
  });

  it("opens the language modal when the language button is pressed", () => {
    const { getByTestId } = render(<Header />);
    const languageButton = getByTestId("header-button-language");

    fireEvent.press(languageButton);
    expect(getByTestId("header-list-language")).toBeTruthy();
  });

  it("calls changeLanguage when a language is selected", () => {
    const { getByTestId } = render(<Header />);
    const languageButton = getByTestId("header-button-language");

    fireEvent.press(languageButton);
    const languageOption = getByTestId("header-listitem-language-en");
    fireEvent.press(languageOption);
    expect(mockChangeLanguage).toHaveBeenCalledWith("en");
  });

  it("calls logout and redirects to login when logout button is pressed", () => {
    const { getByTestId } = render(<Header />);
    const logoutButton = getByTestId("header-button-logout");

    fireEvent.press(logoutButton);
    expect(mockLogout).toHaveBeenCalled();
    expect(mockRouter.replace).toHaveBeenCalledWith("/login");
  });

  it("does not render the logout button when the user is not authenticated", () => {
    (useAuth as jest.Mock).mockReturnValue({
      logout: mockLogout,
      isAuthenticated: false,
    });

    const { queryByTestId } = render(<Header />);
    expect(queryByTestId("header-button-logout")).toBeNull();
  });
});
it("closes the language modal when the overlay is pressed", () => {
  const { getByTestId, queryByTestId } = render(<Header />);
  const languageButton = getByTestId("header-button-language");

  fireEvent.press(languageButton);
  expect(getByTestId("header-list-language")).toBeTruthy();

  const overlay = getByTestId("header-list-language").parent;
  fireEvent.press(overlay);
  expect(queryByTestId("header-list-language")).toBeNull();
});
