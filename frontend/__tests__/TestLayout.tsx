import { waitFor } from "expo-router/testing-library";

export const verifyHeaderTitleAndBackButton = async (
  renderResult: any,
  expectedTitle: string,
  isBackVisible: boolean
) => {
  const { queryByTestId } = renderResult;

  await waitFor(() => {
    const headerTitle = queryByTestId("header-text-title");
    expect(headerTitle).toBeTruthy();
    expect(headerTitle.props.children).toBe(expectedTitle);
  });

  await waitFor(() => {
    const headerBack = queryByTestId("header-button-back");
    if (isBackVisible) {
      expect(headerBack).toBeTruthy();
    } else {
      expect(headerBack).toBeFalsy();
    }
  });
};

export const waitUntilLoadingDisappeared = async (renderResult: any) => {
  await waitFor(() => {
    expect(
      renderResult.queryByTestId("test-auth-loading-spinner")
    ).not.toBeTruthy();
  });
};

export const verifyLoginScreenVisible = async (renderResult: any) => {
  await waitFor(() => {
    expect(renderResult.getAllByText(/login.screen*/).length).toBeGreaterThan(
      0
    );
  });
};

export const verifyForgotPasswordScreenVisible = async (renderResult: any) => {
  await waitFor(() => {
    expect(renderResult.getAllByText(/forgot.screen*/).length).toBeGreaterThan(
      0
    );
  });
};

export const verifyVerifyResetScreenVisible = async (renderResult: any) => {
  await waitFor(() => {
    expect(
      renderResult.getAllByText(/verifyreset.screen*/).length
    ).toBeGreaterThan(0);
  });
};

export const verifyRegisterScreenVisible = async (renderResult: any) => {
  await waitFor(() => {
    expect(
      renderResult.getAllByText(/register.screen*/).length
    ).toBeGreaterThan(0);
  });
};

export const verifyVerifyScreenVisible = async (renderResult: any) => {
  await waitFor(() => {
    expect(renderResult.getAllByText(/verify.screen.*/).length).toBeGreaterThan(
      0
    );
  });
};

export const verifyHomeScreenVisible = async (renderResult: any) => {
  await waitFor(() => {
    expect(renderResult.getByText(/home.screen.*/)).toBeTruthy();
  });
};

export const loginScreenSetup = async (renderResult: any) => {
  const { getByTestId } = renderResult;

  await waitUntilLoadingDisappeared(renderResult);

  await verifyHeaderTitleAndBackButton(
    renderResult,
    "login.header.title",
    false
  );
  await verifyLoginScreenVisible(renderResult);

  return {
    mobileInput: getByTestId("login-text-input-mobile"),
    passwordInput: getByTestId("login-text-input-password"),
    loginButton: getByTestId("login-button-login"),
  };
};

export const registerScreenSetup = async (renderResult: any) => {
  await waitUntilLoadingDisappeared(renderResult);

  await verifyHeaderTitleAndBackButton(
    renderResult,
    "register.header.title",
    false
  );
  await verifyRegisterScreenVisible(renderResult);

  return {
    mobileInput: renderResult.getByTestId("register-text-input-mobile"),
    passwordInput: renderResult.getByTestId("register-text-input-password"),
    registerButton: renderResult.getByTestId("register-button-register"),
  };
};

export const verifyScreenSetup = async (renderResult: any) => {
  await waitUntilLoadingDisappeared(renderResult);

  await verifyHeaderTitleAndBackButton(
    renderResult,
    "verify.header.title",
    false
  );
  await verifyVerifyScreenVisible(renderResult);

  return {
    verifyCodeInput: renderResult.getAllByTestId(/verify-text-input-code/),
    verifyButton: renderResult.getByTestId("verify-button-verify"),
  };
};

export const verifySnackBarMessage = async (
  renderResult: any,
  message: string
) => {
  await waitFor(() => {
    expect(renderResult.getAllByText(message).length).toBeGreaterThan(0);
  });
};
