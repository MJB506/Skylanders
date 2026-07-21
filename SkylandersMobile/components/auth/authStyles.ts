import { StyleSheet } from "react-native";

export const authStyles = StyleSheet.create({
  input:
  {
    width: "100%",
    minHeight: 54,
    backgroundColor: "#efefef",
    color: "#111111",
    borderRadius: 6,
    paddingHorizontal: 14,
    fontSize: 18,
    marginBottom: 16
  },

  codeInput:
  {
    textAlign: "center",
    letterSpacing: 6,
    fontSize: 24,
    fontWeight: "600"
  },

  primaryButton:
  {
    width: "100%",
    minHeight: 56,
    backgroundColor: "#91dbf3",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4
  },

  pressed:
  {
    opacity: 0.8
  },

  primaryButtonText:
  {
    color: "#08111f",
    fontSize: 20,
    fontWeight: "700"
  },

  secondaryButton:
  {
    width: "100%",
    minHeight: 54,
    borderWidth: 2,
    borderColor: "#90e6ff",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16
  },

  secondaryButtonText:
  {
    color: "#90e6ff",
    fontSize: 18,
    fontWeight: "700"
  },

  linkRow:
  {
    color: "#ffffff",
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    marginTop: 18
  },

  link:
  {
    color: "#7fdcff",
    fontWeight: "700"
  },

  message:
  {
    color: "#ff7070",
    fontSize: 16,
    lineHeight: 22,
    textAlign: "center",
    marginTop: 18
  },

  successMessage:
  {
    color: "#90e6ff"
  },

  requirements:
  {
    width: "100%",
    color: "#ffffff",
    fontSize: 15,
    lineHeight: 22,
    marginTop: -4,
    marginBottom: 16
  },

  emailText:
  {
    color: "#ffffff",
    fontSize: 17,
    lineHeight: 25,
    textAlign: "center",
    marginBottom: 22
  },

  email:
  {
    color: "#90e6ff",
    fontWeight: "700"
  },
});
