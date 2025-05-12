import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { useHeaderConfig } from "@/actions/useHeaderConfig";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { loginUser } from "@/api/authService";

export default function LoginScreen() {
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const { t } = useTranslation();

  useHeaderConfig(t("login.header.title"), false);

  const handleLogin = async () => {
    try {
      const res = await loginUser(mobile, password);

      console.log("✅ Login response:", res);

      // store the token
      await login(res.token, res.is_verified, mobile); // Save token and user data in context
      setError(""); // ✅ Clear any previous errors
      // Navigate to home
      router.replace("/home");
    } catch (err) {
      console.log("❌ Login error:", err);
      setError(t("login.screen.error.invalidCred")); // Only show error on actual failure
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("login.screen.label.login")}</Text>

      <TextInput
        style={styles.input}
        placeholder={t("login.screen.input.mobile")}
        keyboardType="phone-pad"
        onChangeText={setMobile}
        value={mobile}
        testID="login-text-input-mobile"
      />
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder={t("login.screen.input.password")}
          secureTextEntry={!showPassword}
          onChangeText={setPassword}
          value={password}
          testID="login-text-input-password"
        />
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          testID="login-button-toggle-password"
        >
          <Ionicons
            name={showPassword ? "eye-off" : "eye"}
            size={24}
            color="gray"
          />
        </TouchableOpacity>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button
        title={t("login.screen.button.login")}
        onPress={handleLogin}
        testID="login-button-login"
      />
      <Button
        title={t("login.screen.button.register")}
        testID="login-button-register"
        onPress={() => router.push("/register")}
      />
      <TouchableOpacity
        style={styles.forgotPasswordContainer}
        onPress={() => router.push("/forgot-password")}
      >
        <Text
          testID="login-button-forgot-password"
          style={styles.forgotPasswordText}
        >
          {t("login.screen.button.forgotPassword")}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, marginTop: 80 },
  title: { fontSize: 24, marginBottom: 20 },
  input: { borderBottomWidth: 1, marginBottom: 20, padding: 8 },
  error: { color: "red", marginBottom: 10 },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    marginBottom: 20,
    paddingRight: 8,
  },
  passwordInput: {
    flex: 1,
    padding: 8,
  },
  forgotPasswordContainer: {
    alignItems: "center",
    marginTop: 10,
  },
  forgotPasswordText: {
    color: "blue",
    textAlign: "center",
  },
});
