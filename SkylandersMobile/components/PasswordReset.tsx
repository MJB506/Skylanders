import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, TextInput } from "react-native";

import { apiFetch } from "../services/apiFetch";
import { buildPath } from "../services/Path";
import AuthLayout from "./auth/AuthLayout";
import { authStyles as styles } from "./auth/authStyles";

export default function PasswordReset() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const resetEmail =
    typeof params.email === "string" ? params.email : "";

  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function resetPassword() {
    setMessage("");

    if (!resetEmail) {
      setMessage(
        "Recovery email is missing. Request a new code."
      );
      return;
    }

    if (!/^\d{6}$/.test(code)) {
      setMessage("Please enter a valid 6-digit code.");
      return;
    }

    if (!/^(?=.*[A-Z])(?=.*\d).{10,}$/.test(password)) {
      setMessage(
        "Password must be at least 10 characters long, contain one uppercase letter, and one number."
      );
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await apiFetch(
        buildPath("api/resetpassword"),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: resetEmail,
            recoveryCode: code,
            newPassword: password,
          }),
        }
      );

      const res = await response.json();

      if (res.error) {
        setMessage(res.error);
        return;
      }

      await AsyncStorage.removeItem("resetEmail");

      router.replace("/login");
    } catch (error: any) {
      setMessage(
        error?.message || "Unable to reset your password."
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function resendCode() {
    setMessage("");

    try {
      const response = await apiFetch(
        buildPath("api/recoveraccount"),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: resetEmail,
          }),
        }
      );

      const res = await response.json();

      setMessage(
        res.error || "A new recovery code has been sent."
      );
    } catch (error: any) {
      setMessage(
        error?.message || "Unable to resend the code."
      );
    }
  }

  return (
    <AuthLayout title="Reset Password">
      <Text style={styles.emailText}>
        Recovery code sent to{"\n"}
        <Text style={styles.email}>
          {resetEmail || "your email address"}
        </Text>
      </Text>

      <TextInput
        style={[styles.input, styles.codeInput]}
        placeholder="Recovery Code"
        placeholderTextColor="#666"
        value={code}
        onChangeText={setCode}
        keyboardType="number-pad"
        maxLength={6}
      />

      <TextInput
        style={styles.input}
        placeholder="New Password"
        placeholderTextColor="#666"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Text style={styles.requirements}>
        Password must contain:{"\n"}
        • At least 10 characters{"\n"}
        • At least 1 uppercase letter{"\n"}
        • At least 1 number
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        placeholderTextColor="#666"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        returnKeyType="done"
        onSubmitEditing={resetPassword}
      />

      <Pressable
        style={({ pressed }) => [
          styles.primaryButton,
          pressed && styles.pressed,
        ]}
        onPress={resetPassword}
        disabled={submitting}
      >
        <Text style={styles.primaryButtonText}>
          {submitting
            ? "Resetting..."
            : "Reset Password"}
        </Text>
      </Pressable>

      <Pressable
        style={({ pressed }) => [
          styles.secondaryButton,
          pressed && styles.pressed,
        ]}
        onPress={resendCode}
      >
        <Text style={styles.secondaryButtonText}>
          Send New Code
        </Text>
      </Pressable>

      {message ? (
        <Text
          style={[
            styles.message,
            message.includes("sent") &&
              styles.successMessage,
          ]}
        >
          {message}
        </Text>
      ) : null}
    </AuthLayout>
  );
}