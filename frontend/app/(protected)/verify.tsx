import { useState, useEffect, useRef } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";

import { useTranslation } from "react-i18next";
import { sendCode, verifyUserCode } from "@/api/authService";
import { SendCodeRequestTypeEnum } from "@/api/openapi";
import { useHeaderConfig } from "@/actions/useHeaderConfig";

export default function VerifyScreen() {
  const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
  const inputsRef = useRef<Array<TextInput | null>>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState("");
  const { login, mobile, token } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();

  useHeaderConfig(t("verify.header.title"), false);

  useEffect(() => {
    const sendVerifyCode = async () => {
      try {
        await sendCode(
          mobile ?? "",
          SendCodeRequestTypeEnum.MobileVerification
        );
      } catch (err) {
        setError(t("verify.screen.error.invalidCode"));
      }
    };
    sendVerifyCode();
  }, []);

  const handleChange = (text: string, index: number) => {
    const newCode = [...code];

    if (text.length > 1) {
      // Handle paste of full code
      const chars = text.slice(0, 6).split("");
      chars.forEach((char, i) => {
        newCode[i] = char;
      });
      setCode(newCode);
      inputsRef.current[5]?.blur();
      return;
    }

    newCode[index] = text;
    setCode(newCode);

    if (text && index < 5) {
      setCurrentIndex(index + 1);
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const codeStr = code.join("");
    if (codeStr.length < 6) {
      setError(t("verify.screen.error.invalidCode"));
      return;
    }

    try {
      const res = await verifyUserCode(mobile ?? "", codeStr, token);
      await login(res.token, true, mobile);
      router.replace("/home");
    } catch (err) {
      setError(t("verify.screen.error.invalidCode"));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("verify.screen.label.enterCode")}</Text>
      <View style={styles.codeContainer}>
        {code.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => (inputsRef.current[index] = ref)}
            style={styles.codeInput}
            keyboardType="numeric"
            maxLength={index === 0 ? 6 : 1}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={({ nativeEvent }) => {
              if (nativeEvent.key === "Backspace") {
                if (code[index] === "" && index > 0) {
                  const newCode = [...code];
                  newCode[index - 1] = "";
                  setCode(newCode);
                  setCurrentIndex(index - 1);
                  inputsRef.current[index - 1]?.focus();
                }
              }
            }}
            value={digit}
            editable={index === currentIndex}
            selectTextOnFocus={false}
            caretHidden={true}
            contextMenuHidden={index !== 0}
            testID={`verify-text-input-code-${index}`}
          />
        ))}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button
        title={t("verify.screen.button.verify")}
        onPress={handleVerify}
        testID="verify-button-verify"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, marginTop: 80 },
  title: { fontSize: 24, marginBottom: 20 },
  codeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  codeInput: {
    borderBottomWidth: 1,
    width: 40,
    textAlign: "center",
    fontSize: 20,
  },
  error: { color: "red", marginBottom: 10 },
});
