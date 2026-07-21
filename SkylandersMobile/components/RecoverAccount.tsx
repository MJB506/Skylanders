import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, TextInput } from "react-native";

import { apiFetch } from "../services/apiFetch";
import { buildPath } from "../services/Path";
import AuthLayout from "./auth/AuthLayout";
import { authStyles as styles } from "./auth/authStyles";

export default function RecoverAccount() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function sendResetCode() {
    setMessage("");

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage("Please enter a valid email address.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await apiFetch(
        buildPath("api/recoveraccount"),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
          }),
        }
      );

      const res = await response.json();

      if (res.error) {
        setMessage(res.error);
        return;
      }

      await AsyncStorage.setItem(
        "resetEmail",
        email.trim()
      );

      router.push({
        pathname: "/password-reset",
        params: {
          email: email.trim(),
        },
      });
    } catch (error: any) {
      setMessage(
        error?.message || "Unable to send a recovery code."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Recover Account"
      description="Enter the email address associated with your account. We’ll send you a recovery code to reset your password."
    >
      <TextInput
        style={styles.input}
        placeholder="Email Address"
        placeholderTextColor="#666"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="send"
        onSubmitEditing={sendResetCode}
      />

      <Pressable
        style={({ pressed }) => [
          styles.primaryButton,
          pressed && styles.pressed,
        ]}
        onPress={sendResetCode}
        disabled={submitting}
      >
        <Text style={styles.primaryButtonText}>
          {submitting
            ? "Sending..."
            : "Send Recovery Code"}
        </Text>
      </Pressable>

      <Text style={styles.linkRow}>
        Remember your password?{" "}
        <Text
          style={styles.link}
          onPress={() => router.replace("/login")}
        >
          Log In
        </Text>
      </Text>

      {message ? (
        <Text style={styles.message}>
          {message}
        </Text>
      ) : null}
    </AuthLayout>
  );
}