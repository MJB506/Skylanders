import { Image, StyleSheet, View } from "react-native";

export default function PageTitle() {
  return (
    <View style = {styles.header}>
      <Image source = {require("../assets/images/skylanders-logo.webp")}
        style = {styles.logo}
        resizeMode = "contain"
        accessibilityLabel ="Skylanders logo" />
    </View>
  );
}
const styles = StyleSheet.create(
  {
    header:
    {
      alignItems: "center",
      marginBottom: 20
    },
    logo:
    {
      width: "88%",
      maxWidth: 350,
      height: 112
    }
  }
);
