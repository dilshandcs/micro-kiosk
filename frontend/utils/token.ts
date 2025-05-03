import { Platform } from "react-native";
import * as SecureStore from 'expo-secure-store';

const isWeb = Platform.OS === "web";
// Save the token
export const saveToken = async (token: string) => {
  try {
    isWeb ? localStorage.setItem('token', token) : await SecureStore.setItemAsync('token', token);  // Correct method for saving
  } catch (error) {
    console.error('Error saving token:', error);
  }
};

// Get the token
export const getToken = async () => {
  try {
    const token = isWeb ? localStorage.getItem("token") : await SecureStore.getItemAsync('token');  // Correct method for getting
    return token;  // Return the token if found
  } catch (error) {
    console.error('Error retrieving token:', error);  // Log error if any
    return null;  // Return null if token is not found or there's an error
  }
};

// Remove the token (e.g., when the user logs out)
export const removeToken = async () => {
  try {
    isWeb ? localStorage.removeItem("token"): await SecureStore.deleteItemAsync('token');  // Correct method for deleting
  } catch (error) {
    console.error('Error removing token:', error);  // Log error if any
  }
};
