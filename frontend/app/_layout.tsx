import { Slot } from "expo-router";
import { AuthProvider } from "@/context/AuthContext";
import { HeaderProvider } from "@/context/HeaderContext";
import { Header } from "@/components/Header";
import { SnackbarProvider } from "@/context/SnackbarProvider";

function RootLayout() {
  return (
    <>
      <Header />
      <Slot />
    </>
  );
}

export default function Layout() {
  return (
    <AuthProvider>
      <HeaderProvider>
        <SnackbarProvider>
          <RootLayout />
        </SnackbarProvider>
      </HeaderProvider>
    </AuthProvider>
  );
}
