import { View, Text, StyleSheet } from "react-native";
import { useHeaderConfig } from "@/actions/useHeaderConfig";
import { useTranslation } from "react-i18next";

export default function HomeScreen() {
  const { t } = useTranslation();
  useHeaderConfig(t("home.header.title"), false);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{t("home.screen.text.main")}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  text: { fontSize: 24 },
});
