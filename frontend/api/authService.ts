import {
  Configuration,
  DefaultApi,
  SendCodeRequestTypeEnum,
} from "../api/openapi";

export const api = new DefaultApi(
  new Configuration({ basePath: process.env.EXPO_PUBLIC_API_URL })
);

export const loginUser = async (mobile: string, password: string) => {
  try {
    const response = await api.loginUser({ mobile, password });
    return response.data;
  } catch (error) {
    console.error("Login API error:", error);
    throw error;
  }
};

export const registerUser = async (mobile: string, password: string) => {
  try {
    const response = await api.registerUser({ mobile, password });
    return response.data;
  } catch (error) {
    console.error("Register API error:", error);
    throw error;
  }
};

export const sendCode = async (
  mobile: string,
  type: SendCodeRequestTypeEnum
) => {
  try {
    const response = await api.sendCode({ mobile, type });
    return response.data;
  } catch (error) {
    console.error("Verify API error:", error);
    throw error;
  }
};

export const verifyUserCode = async (
  mobile: string,
  code: string,
  token: string | null
) => {
  try {
    if (!token) {
      throw new Error("verifyUserCode: token is missing");
    }
    const response = await api.verifyUserCode(
      { mobile, code },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Verify API error:", error);
    throw error;
  }
};

export const getUserInfo = async (token: string) => {
  try {
    const response = await api.getUserInfo({
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Me API error:", error);
    throw error;
  }
};
