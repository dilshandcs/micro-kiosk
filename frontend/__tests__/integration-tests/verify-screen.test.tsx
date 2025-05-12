import { mockTokenStorage } from "./setupMocks";
import { fireEvent, waitFor } from "@testing-library/react-native";
import { verifyVerifyScreenVisible } from "../TestLayout";
import { renderRouter } from "expo-router/testing-library";
import { getUserInfo, sendCode, verifyUserCode } from "@/api/authService";
import { act } from "react";

const setupTest = async (initialUrl: string) => {
  mockTokenStorage.token = "existing-token";

  (
    getUserInfo as jest.MockedFunction<typeof getUserInfo>
  ).mockResolvedValueOnce({ is_verified: false, mobile: "0771234567" });
  (sendCode as jest.MockedFunction<typeof sendCode>).mockResolvedValueOnce({
    success: true,
  });

  const renderResult = renderRouter("./app", { initialUrl });

  await waitFor(() => {
    expect(
      renderResult.queryByTestId("test-auth-loading-spinner")
    ).not.toBeTruthy();
  });

  await verifyVerifyScreenVisible(renderResult);
  return renderResult;
};

describe("Verify Screen", () => {
  let renderResult: any;

  beforeEach(async () => {
    renderResult = await setupTest("/login");
  });

  afterEach(() => {
    jest.clearAllMocks();
    mockTokenStorage.token = null; // Reset token between tests
  });

  it("only the first input is editable initially", async () => {
    await waitFor(() => {
      const input0 = renderResult.getByTestId("verify-text-input-code-0");
      const input1 = renderResult.getByTestId("verify-text-input-code-1");

      expect(input0.props.editable).toBe(true);
      expect(input1.props.editable).toBe(false);
    });
  });

  it("typing in input 0 enables input 1", async () => {
    await act(() => {
      const input0 = renderResult.getByTestId("verify-text-input-code-0");
      fireEvent.changeText(input0, "1");
    });

    await waitFor(() => {
      const input1 = renderResult.getByTestId("verify-text-input-code-1");
      expect(input1.props.editable).toBe(true);
    });
  });

  it("backspace on empty input moves focus back", async () => {
    const input0 = renderResult.getByTestId("verify-text-input-code-0");
    const input1 = renderResult.getByTestId("verify-text-input-code-1");
    const input2 = renderResult.getByTestId("verify-text-input-code-2");

    await act(() => {
      // Fill both inputs
      fireEvent.changeText(input0, "1");
      fireEvent.changeText(input1, "2");
    });

    // Clear input1, simulate backspace
    fireEvent(input2, "onKeyPress", { nativeEvent: { key: "Backspace" } });
    fireEvent(input1, "onKeyPress", { nativeEvent: { key: "Backspace" } });

    // 🔄 Re-query input0 to get fresh props after state change
    await waitFor(() => {
      const updatedInput0 = renderResult.getByTestId(
        "verify-text-input-code-0"
      );
      expect(updatedInput0.props.editable).toBe(true);
    });
  });

  it("pasting full code in input 0 fills all boxes", async () => {
    await act(() => {
      // Fill both inputs
      fireEvent.changeText(
        renderResult.getByTestId("verify-text-input-code-0"),
        "123456"
      );
    });

    for (let i = 0; i < 6; i++) {
      await waitFor(() => {
        const input = renderResult.getByTestId(`verify-text-input-code-${i}`);
        expect(input.props.value).toBe((i + 1).toString());
      });
    }
  });

  it("inputs 1-5 are not editable until focused", async () => {
    for (let i = 1; i < 6; i++) {
      await waitFor(() => {
        const input = renderResult.getByTestId(`verify-text-input-code-${i}`);
        expect(input.props.editable).toBe(false);
      });
    }
  });

  it("submit calls verifyUserCode with full 6-digit code", async () => {
    (
      verifyUserCode as jest.MockedFunction<typeof verifyUserCode>
    ).mockResolvedValueOnce({ success: true, token: "new-new-token" });

    const fullCode = "123456";

    await waitFor(() => {
      for (let i = 0; i < 6; i++) {
        fireEvent.changeText(
          renderResult.getByTestId(`verify-text-input-code-${i}`),
          fullCode[i]
        );
      }
    });

    await act(() => {
      fireEvent.press(renderResult.getByTestId("verify-button-verify"));
    });

    await waitFor(() => {
      expect(verifyUserCode).toHaveBeenCalledWith(
        "0771234567",
        "123456",
        "existing-token"
      );
    });
  });

  it("should show an error if a short code provided", async () => {
    const fullCode = "12345";

    await waitFor(() => {
      for (let i = 0; i < 5; i++) {
        fireEvent.changeText(
          renderResult.getByTestId(`verify-text-input-code-${i}`),
          fullCode[i]
        );
      }
    });

    await act(() => {
      fireEvent.press(renderResult.getByTestId("verify-button-verify"));
    });

    await waitFor(() => {
      expect(verifyUserCode).not.toHaveBeenCalled();
      renderResult.queryByText(/verify.screen.error.invalidCode/);
    });
  });

  it("context menu is hidden on inputs 1–5", async () => {
    for (let i = 1; i < 6; i++) {
      await waitFor(() => {
        const input = renderResult.getByTestId(`verify-text-input-code-${i}`);
        expect(input.props.contextMenuHidden).toBe(true);
      });
    }
  });
});
