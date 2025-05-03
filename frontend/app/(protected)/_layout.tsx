import { router, Slot, usePathname } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { ActivityIndicator, View } from "react-native";
import { useEffect } from "react";

export default function ProtectedLayout() {
  const { loading, isAuthenticated, isVerified } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    // Not logged in
    if (!isAuthenticated && pathname !== "/login") {
      router.replace("/login");
      return;
    }

    // Authenticated but not verified
    if (isAuthenticated && !isVerified && pathname !== "/verify") {
      router.replace("/verify");
      return;
    }

    // Verified user user is going to relavent screen, if user is currently in verify screen, redirect to home then redirect to home
    if (isAuthenticated && isVerified && pathname === "/verify") {
      router.replace("/home");
      return;
    }
  }, [isAuthenticated, isVerified, loading, pathname]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" testID="test-auth-loading-spinner" />
      </View>
    );
  }

  return (
    <>
      <Slot />
    </>
  );
}
