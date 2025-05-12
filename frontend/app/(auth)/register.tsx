import { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { useHeaderConfig } from "@/actions/useHeaderConfig";
import { useTranslation } from "react-i18next";
import { registerUser } from "@/api/authService";

// Validate mobile number
const isValidMobile = (mobile: string) => {
  const regex = /^(0?(70|71|72|75|76|77|78))[0-9]{7}$/;
  return regex.test(mobile);
};

// Validate password strength
const isValidPassword = (password: string) => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return regex.test(password);
};

export default function RegisterScreen() {
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const { t } = useTranslation();

  useHeaderConfig(t("register.header.title"), true);

  const handleRegister = async () => {
    if (!isValidMobile(mobile)) {
      setError(t("register.screen.error.invalidMobile"));
      return;
    }

    if (!isValidPassword(password)) {
      setError(t("register.screen.error.invalidPassword"));
      return;
    }

    try {
      const formattedMobile = mobile.startsWith("0") ? mobile : `0${mobile}`;
      const res = await registerUser(formattedMobile, password);

      await login(res.token, res.is_verified, res.mobile); // Save token and user data in context
      setError("");
      router.replace("/verify"); // Navigate to home after successful registration
    } catch (err) {
      console.log("❌ Register error:", err);
      setError(t("register.screen.error.regFailed"));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("register.screen.label.register")}</Text>

      {/* Mobile input with +94 label */}
      <View style={styles.phoneInputContainer}>
        <Text style={styles.prefix}>+94</Text>
        <TextInput
          style={styles.phoneInput}
          placeholder={t("register.screen.input.mobile")}
          testID="register-text-input-mobile"
          keyboardType="numeric"
          onChangeText={(text) => {
            const digitsOnly = text.replace(/[^0-9]/g, "");
            setMobile(digitsOnly);
          }}
          value={mobile}
        />
      </View>

      {/* Password input */}
      <TextInput
        style={styles.input}
        placeholder={t("register.screen.input.password")}
        secureTextEntry
        testID="register-text-input-password"
        onChangeText={setPassword}
        value={password}
      />

      {/* Error message */}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {/* Buttons */}
      <Button
        title={t("register.screen.button.register")}
        onPress={handleRegister}
        testID="register-button-register"
      />
      <Button
        title={t("register.screen.button.login")}
        testID="register-button-login"
        onPress={() => router.replace("/login")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, marginTop: 80 },
  title: { fontSize: 24, marginBottom: 20 },
  phoneInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    marginBottom: 20,
    paddingVertical: 8,
  },
  prefix: {
    fontSize: 16,
    marginRight: 5,
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
  },
  input: {
    borderBottomWidth: 1,
    marginBottom: 20,
    padding: 8,
  },
  error: {
    color: "red",
    marginBottom: 10,
  },
});
