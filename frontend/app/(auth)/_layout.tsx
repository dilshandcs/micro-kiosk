import { router, Slot, useFocusEffect } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { ActivityIndicator, View } from "react-native";
import React from "react";

export default function AuthLayout() {
  const { loading, isAuthenticated, isVerified } = useAuth();

  useFocusEffect(
    React.useCallback(() => {
      // Wait until loading is done before checking authentication
      if (loading) return;

      if (isAuthenticated) {
        if (isVerified) {
          // If authenticated and verified, redirect to home page
          router.replace("/home");
        } else {
          // If authenticated but not verified, redirect to verify page
          router.replace("/verify");
        }
      }
    }, [isAuthenticated, isVerified, loading])
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" testID="test-auth-loading-spinner" />
      </View>
    );
  }

  return <Slot />;
}
