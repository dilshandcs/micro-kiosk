import { Slot } from "expo-router";
import { AuthProvider } from "@/context/AuthContext";
import { HeaderProvider } from "@/context/HeaderContext";
import { Header } from "@/components/Header";

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
        <RootLayout />
      </HeaderProvider>
    </AuthProvider>
  );
}
