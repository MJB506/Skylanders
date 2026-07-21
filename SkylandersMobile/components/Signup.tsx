import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, TextInput } from "react-native";

import { apiFetch } from "../services/apiFetch";
import { buildPath } from "../services/Path";
import AuthLayout from "./auth/AuthLayout";
import { authStyles as styles } from "./auth/authStyles";

export default function Signup() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function doSignup() {
    setMessage("");

    if (!username || !email || !password || !confirmPassword) {
      setMessage("Please fill out all fields.");
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setMessage(
        "Username may only contain letters, numbers, or underscores."
      );
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage("Please enter a valid email address.");
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
        buildPath("api/register"),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: username.trim(),
            email: email.trim(),
            password,
          }),
        }
      );

      const res = await response.json();

      if (res.error) {
        setMessage(res.error);
        return;
      }

      router.push({
        pathname: "/verify-email",
        params: {
          email: email.trim(),
        },
      });
    } catch (error: any) {
      setMessage(
        error?.message || "Unable to create your account."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout title="Create Account">
      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor="#666"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#666"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
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
        onSubmitEditing={doSignup}
      />

      <Pressable
        style={({ pressed }) => [
          styles.primaryButton,
          pressed && styles.pressed,
        ]}
        onPress={doSignup}
        disabled={submitting}
      >
        <Text style={styles.primaryButtonText}>
          {submitting
            ? "Creating Account..."
            : "Create Account"}
        </Text>
      </Pressable>

      <Text style={styles.linkRow}>
        Already have an account?{" "}
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