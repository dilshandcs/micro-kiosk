import { useState, useEffect } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useHeaderConfig } from "@/actions/useHeaderConfig";
import { updatePassword } from "@/api/authService";
import { useTranslation } from "react-i18next";
import { ModelErrorErrorCodeEnum } from "@/api/openapi";

export default function VerifyResetScreen() {
  const { mobile } = useLocalSearchParams();
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const { t } = useTranslation();

      useHeaderConfig(t('verifyreset.header.title'), true); 
  
      
useEffect(() => {
  if (!mobile) {
    router.replace({ pathname: "/(auth)/forgot-password" }); // Redirect back safely
  }
}, [mobile]);

  const handleReset = async () => {
    try {
      const res = await updatePassword(Array.isArray(mobile) ? mobile[0] : mobile, code, newPassword);

      if (res.success) {
        setError("");
        router.replace("/login");
      }
    } catch (err: any) {
      if (err?.errorCode === ModelErrorErrorCodeEnum.InvalidPassword) {
        setError(t('verifyreset.screen.error.invalidPwd'));
      } else if(err?.errorCode === ModelErrorErrorCodeEnum.IncorrectVerifyCode) {
        setError(t('verifyreset.screen.error.incorrectVerifyCode'));
      } else {
        setError(t('verifyreset.screen.error.updatePWFailed'));
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Your Password</Text>
      <TextInput
        style={styles.input}
        placeholder={t('verifyreset.screen.input.code')}
        keyboardType="number-pad"
        testID="verifyreset-text-input-code"
        onChangeText={setCode}
        value={code}
      />
      <TextInput
        style={styles.input}
        placeholder={t('verifyreset.screen.input.password')}
        secureTextEntry
        onChangeText={setNewPassword}
        testID="verifyreset-text-input-new-pw"
        value={newPassword}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button title={t('verifyreset.screen.button.resetPassword')} onPress={handleReset} testID='verifyreset-button-reset-pw'/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, marginTop: 80 },
  title: { fontSize: 24, marginBottom: 20 },
  input: { borderBottomWidth: 1, marginBottom: 20, padding: 8 },
  error: { color: "red", marginBottom: 10 },
  success: { color: "green", marginBottom: 10 },
});
