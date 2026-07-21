import type { PropsWithChildren } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PageTitle from "../PageTitle";

interface AuthLayoutProps extends PropsWithChildren {
  title: string;
  description?: string;
}

export default function AuthLayout({ title, description, children }: AuthLayoutProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <PageTitle />
            <Text style={styles.title}>{title}</Text>
            {description ? <Text style={styles.description}>{description}</Text> : null}
            {children}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#09071d" },
  flex: {
    flex: 1
  },
  scrollContent:
  {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20
  },
  card:
  {
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
    paddingVertical: 24
  },
  title:
  {
    color: "#90e6ff",
    fontSize: 36,
    lineHeight: 42,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 24
  },
  description:
  {
    color: "#ffffff",
    fontSize: 17,
    lineHeight: 25,
    textAlign: "center",
    marginBottom: 24
  },
});
