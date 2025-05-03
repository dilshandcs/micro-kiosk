import React from "react";
import { render, screen, act, fireEvent } from "@testing-library/react-native";
import { Button, Text } from "react-native";
import { HeaderProvider, useHeader } from "../HeaderContext";

describe("HeaderProvider", () => {
  const TestComponent = () => {
    const { title, setTitle, showBack, setShowBack } = useHeader();

    return (
      <>
        <Text testID="title">{title}</Text>
        <Text testID="showBack">{showBack.toString()}</Text>
        <Button title="Set Title" onPress={() => setTitle("New Title")} />
        <Button title="Show Back" onPress={() => setShowBack(true)} />
      </>
    );
  };

  it("should provide default values", () => {
    render(
      <HeaderProvider>
        <TestComponent />
      </HeaderProvider>
    );

    expect(screen.getByTestId("title")).toHaveTextContent("");
    expect(screen.getByTestId("showBack")).toHaveTextContent("false");
  });

  it("should update title and showBack when set functions are called", () => {
    const { getByText } = render(
      <HeaderProvider>
        <TestComponent />
      </HeaderProvider>
    );

    act(() => {
      fireEvent.press(getByText("Set Title"));
      fireEvent.press(getByText("Show Back"));
    });

    expect(screen.getByTestId("title")).toHaveTextContent("New Title");
    expect(screen.getByTestId("showBack")).toHaveTextContent("true");
  });

  it("should throw an error if useHeader is used outside HeaderProvider", () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {}); // Suppress React error log

    const BrokenComponent = () => {
      useHeader(); // Should throw
      return null;
    };

    expect(() => render(<BrokenComponent />)).toThrow(
      "useHeader must be used within HeaderProvider"
    );

    spy.mockRestore();
  });
});
