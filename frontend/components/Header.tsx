import { useRouter } from "expo-router";
import { View, Text, Pressable, Modal, TouchableOpacity } from "react-native";
import { useHeader } from "../context/HeaderContext";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons"; // for language and logout icons
import i18next from "@/i18next";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";

export const Header = () => {
  const router = useRouter();
  const { logout, isAuthenticated } = useAuth();

  const { title, showBack } = useHeader();
  const { t } = useTranslation();

  const shouldShowBack = showBack && (router.canGoBack?.() ?? false);
  const [modalVisible, setModalVisible] = useState(false);

  const languages = [
    { code: "en", label: "English", testId: "header-listitem-language-en" },
    { code: "si", label: "සිංහල", testId: "header-listitem-language-si" },
  ];

  const changeLanguage = (code: string) => {
    i18next.changeLanguage(code);
    setModalVisible(false);
  };

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <View
      style={{
        height: 60,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
      }}
    >
      {shouldShowBack ? (
        <Pressable onPress={handleBack} testID="header-button-back">
          <Text>{t("header.back")}</Text>
        </Pressable>
      ) : (
        <View style={{ width: 50 }} />
      )}

      <Text style={{ fontWeight: "bold" }} testID="header-text-title">
        {title}
      </Text>

      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Pressable
          onPress={() => setModalVisible(true)}
          testID="header-button-language"
        >
          <Ionicons
            name="globe-outline"
            size={24}
            style={{ marginRight: 16 }}
          />
        </Pressable>

        {isAuthenticated && (
          <Pressable onPress={handleLogout} testID="header-button-logout">
            <Ionicons name="exit-outline" size={24} />
          </Pressable>
        )}
      </View>

      <Modal visible={modalVisible} transparent animationType="slide">
        <TouchableOpacity
          style={{ flex: 1 }}
          onPress={() => setModalVisible(false)}
        >
          <View
            style={{
              position: "absolute",
              top: 60,
              right: 16,
              backgroundColor: "white",
              borderRadius: 8,
              padding: 10,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 5,
            }}
            testID={"header-list-language"}
          >
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                onPress={() => changeLanguage(lang.code)}
                style={{ paddingVertical: 8 }}
                testID={lang.testId}
              >
                <Text>{lang.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};
