import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { jwtDecode } from "jwt-decode";
import { useState } from "react";
import { Pressable, Text, TextInput } from "react-native";

import { apiFetch } from "../services/apiFetch";
import { buildPath } from "../services/Path";
import { storeToken } from "../services/tokenStorage";
import AuthLayout from "./auth/AuthLayout";
import { authStyles as styles } from "./auth/authStyles";

export default function Login() {
  const router = useRouter();

  const [message, setMessage] = useState("");
  const [loginName, setLoginName] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function doLogin() {
    if (!loginName.trim() || !loginPassword) {
      setMessage("Please enter your username and password.");
      return;
    }

    setSubmitting(true);
    setMessage("");

    try {
      const response = await apiFetch(
        buildPath("api/login"),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            login: loginName.trim(),
            password: loginPassword,
          }),
        }
      );

      const res = await response.json();

      if (res.needsVerification) {
        router.push({
          pathname: "/verify-email",
          params: {
            email: res.email,
          },
        });

        return;
      }

      if (!res.accessToken) {
        setMessage(res.error || "Login failed");
        return;
      }

      await storeToken(res);

      const decoded: any = jwtDecode(res.accessToken);

      await AsyncStorage.setItem(
        "user_data",
        JSON.stringify({
          username: decoded.username,
          id: decoded.userId,
        })
      );

      router.replace("/collection" as never);
    } catch (error: any) {
      setMessage(
        error?.message || "Unable to connect to the server."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout title="Collection Tracker">
      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor="#666"
        value={loginName}
        onChangeText={setLoginName}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="next"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#666"
        value={loginPassword}
        onChangeText={setLoginPassword}
        secureTextEntry
        returnKeyType="done"
        onSubmitEditing={doLogin}
      />

      <Pressable
        style={({ pressed }) => [
          styles.primaryButton,
          pressed && styles.pressed,
        ]}
        onPress={doLogin}
        disabled={submitting}
      >
        <Text style={styles.primaryButtonText}>
          {submitting ? "Logging In..." : "Login"}
        </Text>
      </Pressable>

      <Text style={styles.linkRow}>
        New User?{" "}
        <Text
          style={styles.link}
          onPress={() => router.push("/signup")}
        >
          Sign Up
        </Text>
      </Text>

      <Text style={styles.linkRow}>
        Forgot Your Password?{" "}
        <Text
          style={styles.link}
          onPress={() => router.push("/recover-account")}
        >
          Reset
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