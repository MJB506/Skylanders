import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

export default function RootLayout(){
 return <>
  <Stack screenOptions= {
    {headerShown: false, contentStyle: {backgroundColor: "#09071d" }}}>
   <Stack.Screen name = "index"/>
   <Stack.Screen name = "login"/>
   <Stack.Screen name = "signup"/>
   <Stack.Screen name = "recover-account"/>
   <Stack.Screen name = "password-reset"/>
   <Stack.Screen name = "verify-email"/>
   <Stack.Screen name = "collection"/>
   <Stack.Screen name = "wishlist"/>
   <Stack.Screen name = "search"/>
   <Stack.Screen name = "friends"/>
  </Stack>
  <StatusBar style = "light"/>
 </>;
}
