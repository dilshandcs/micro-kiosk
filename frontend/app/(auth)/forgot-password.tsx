import { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import axios from "axios"; // or your API helper
import { SendCodeRequestTypeEnum } from "@/api/openapi";
import { useHeaderConfig } from "@/actions/useHeaderConfig";
import { sendCode } from "@/api/authService";

export default function ForgotPasswordScreen() {
  const [mobile, setMobile] = useState("");
  const [error, setError] = useState("");
  const { t } = useTranslation();

    useHeaderConfig(t('forgot.header.title'), true); 

  const handleSendCode = async () => {
    try {
      const res = await sendCode(mobile, SendCodeRequestTypeEnum.PasswordReset);

      if (res.success) {
        setError("");
        router.push({ pathname: "/(auth)/verify-reset", params: { mobile } });
      }
    } catch (err) {
      setError(t('forgot.screen.error.sendCodeFailed'));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('forgot.screen.label.forgot')}</Text>
      <TextInput
        style={styles.input}
        placeholder={t('forgot.screen.input.mobile')}
        keyboardType="phone-pad"
        onChangeText={setMobile}
        testID="forgot-text-input-mobile"
        value={mobile}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button title={t('forgot.screen.button.sendCode')} onPress={handleSendCode} testID='forgot-button-send-code'/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, marginTop: 80 },
  title: { fontSize: 24, marginBottom: 20 },
  input: { borderBottomWidth: 1, marginBottom: 20, padding: 8 },
  success: { color: "green", marginBottom: 10 },
  error: { color: "red", marginBottom: 10 },
});
