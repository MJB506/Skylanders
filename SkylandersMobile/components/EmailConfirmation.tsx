import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, TextInput } from "react-native";

import { apiFetch } from "../services/apiFetch";
import { buildPath } from "../services/Path";
import AuthLayout from "./auth/AuthLayout";
import { authStyles as styles } from "./auth/authStyles";

export default function EmailConfirmation() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const email =
    typeof params.email === "string" ? params.email : "";

  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function verifyEmail() {
    setMessage("");

    if (!email) {
      setMessage(
        "Email address is missing. Return to sign up and try again."
      );
      return;
    }

    if (!/^\d{6}$/.test(code)) {
      setMessage("Please enter a valid 6-digit code.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await apiFetch(
        buildPath("api/verifyemail"),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            code,
          }),
        }
      );

      const res = await response.json();

      if (res.error) {
        setMessage(res.error);
        return;
      }

      router.replace("/login");
    } catch (error: any) {
      setMessage(
        error?.message || "Unable to verify your email."
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function resendCode() {
    setMessage("");

    try {
      const response = await apiFetch(
        buildPath("api/resendverification"),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
          }),
        }
      );

      const res = await response.json();

      setMessage(
        res.error || "A new verification code has been sent."
      );
    } catch (error: any) {
      setMessage(
        error?.message || "Unable to resend the code."
      );
    }
  }

  return (
    <AuthLayout title="Verify Your Email">
      <Text style={styles.emailText}>
        A verification code has been sent to{"\n"}
        <Text style={styles.email}>
          {email || "your email address"}
        </Text>
      </Text>

      <TextInput
        style={[styles.input, styles.codeInput]}
        placeholder="Verification Code"
        placeholderTextColor="#666"
        value={code}
        onChangeText={setCode}
        keyboardType="number-pad"
        maxLength={6}
        returnKeyType="done"
        onSubmitEditing={verifyEmail}
      />

      <Pressable
        style={({ pressed }) => [
          styles.primaryButton,
          pressed && styles.pressed,
        ]}
        onPress={verifyEmail}
        disabled={submitting}
      >
        <Text style={styles.primaryButtonText}>
          {submitting
            ? "Verifying..."
            : "Verify Email"}
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