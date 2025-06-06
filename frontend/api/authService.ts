import axios from "axios";
import {
  Configuration,
  DefaultApi,
  SendCodeRequestTypeEnum,
} from "../api/openapi";

export const api = new DefaultApi(
  new Configuration({ basePath: process.env.EXPO_PUBLIC_API_URL })
);

const throwError = (error: any) => {
  if (error?.response?.data?.errorCode) {
    const { errorCode, message } = error.response.data;
    throw { errorCode, message };
  }
  throw { errorCode: "UNKNOWN_ERROR", message: "Unexpected error occurred" };
};

export const loginUser = async (mobile: string, password: string) => {
  try {
    const response = await api.loginUser({ mobile, password });
    return response.data;
  } catch (error) {
    console.error("Login API error:", error);
    throwError(error);
  }
};

export const registerUser = async (mobile: string, password: string) => {
  try {
    const response = await api.registerUser({ mobile, password });
    return response.data;
  } catch (error) {
    console.error("Register API error:", error);
    throwError(error);
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
    throwError(error);
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
    throwError(error);
  }
};

export const updatePassword = async (
  mobile: string,
  code: string,
  newPassword: string
) => {
  try {
    const response = await api.updatePassword({ mobile, code, newPassword });
    return response.data;
  } catch (error) {
    console.error("Verify API error:", error);
    throwError(error);
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
    throwError(error);
  }
};
