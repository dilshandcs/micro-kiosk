import React, { act } from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { Button, Text } from "react-native";
import { SnackbarProvider, useSnackbar } from "../SnackbarProvider";
import { Provider as PaperProvider } from "react-native-paper";

const TestComponent = () => {
  const { showMessage } = useSnackbar();

  return (
    <>
      <Text testID="label">Snackbar Test</Text>
      <Button
        title="Show Snackbar"
        onPress={() => showMessage("Test Snackbar Message")}
      />
    </>
  );
};

// Helper to wrap everything
const renderWithProviders = (ui: React.ReactNode) => {
  return render(
    <PaperProvider>
      <SnackbarProvider>{ui}</SnackbarProvider>
    </PaperProvider>
  );
};

describe("SnackbarProvider", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });
  it("displays the snackbar when showMessage is called", async () => {
    const { getByText, queryByText } = renderWithProviders(
      <TestComponent />
    );

    expect(queryByText("Test Snackbar Message")).toBeNull();

    fireEvent.press(getByText("Show Snackbar"));

    expect(getByText("Test Snackbar Message")).toBeTruthy();

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(6000);
    });
    await waitFor(
      () => {
        expect(queryByText("Test Snackbar Message")).toBeNull();
      });
  });

  it("dismisses snackbar when OK is pressed", async () => {
    const { getByText, queryByText } = renderWithProviders(<TestComponent />);

    fireEvent.press(getByText("Show Snackbar"));

    expect(getByText("Test Snackbar Message")).toBeTruthy();

    fireEvent.press(getByText("OK"));

    await waitFor(() => {
      expect(queryByText("Test Snackbar Message")).toBeNull();
    });
  });

  it("throws an error if useSnackbar is used outside of SnackbarProvider", () => {
    const TestComponent = () => {
      useSnackbar();
      return null;
    };
  
    expect(() => render(<TestComponent />)).toThrow(
      "useSnackbar must be used within SnackbarProvider"
    );
  });

  
  it("renders children correctly within SnackbarProvider", () => {
    const { getByTestId } = renderWithProviders(<TestComponent />);
    expect(getByTestId("label").props.children).toBe("Snackbar Test");
  });
});

