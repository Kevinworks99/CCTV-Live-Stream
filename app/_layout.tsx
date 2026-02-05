import { Stack } from "expo-router";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "@/global.css";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="home" />
          <Stack.Screen name="add-camera" />
          <Stack.Screen name="live-stream" />
          <Stack.Screen name="gallery" />
        </Stack>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}