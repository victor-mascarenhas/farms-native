import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationLightTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import {
  Provider as PaperProvider,
  MD3DarkTheme,
  MD3LightTheme,
  adaptNavigationTheme,
} from "react-native-paper";
import { AuthProvider, useAuth } from "../AuthProvider";
import LoginScreen from "./login";

import { useColorScheme } from "@/components/useColorScheme";

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  const paperTheme = colorScheme === "dark" ? MD3DarkTheme : MD3LightTheme;
  const { LightTheme, DarkTheme } = adaptNavigationTheme({
    reactNavigationLight: NavigationLightTheme,
    reactNavigationDark: NavigationDarkTheme,
    materialLight: MD3LightTheme,
    materialDark: MD3DarkTheme,
  });

  return (
    <AuthProvider>
      <PaperProvider theme={paperTheme}>
        <RootLayoutNav
          navigationLight={LightTheme}
          navigationDark={DarkTheme}
        />
      </PaperProvider>
    </AuthProvider>
  );
}

type NavProps = { navigationLight: any; navigationDark: any };

function RootLayoutNav({ navigationLight, navigationDark }: NavProps) {
  const colorScheme = useColorScheme();
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!user) {
    return <LoginScreen />;
  }

  const navTheme = colorScheme === "dark" ? navigationDark : navigationLight;
  return (
    <ThemeProvider value={navTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: "modal" }} />
      </Stack>
    </ThemeProvider>
  );
}
