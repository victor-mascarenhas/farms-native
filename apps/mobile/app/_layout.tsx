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
import useGoalNotifier from "../useGoalNotifier";
import NotificationProvider from "../NotificationProvider";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });
  const colorScheme = useColorScheme();

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
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
      <NotificationProvider>
        <PaperProvider theme={paperTheme}>
          <RootLayoutNav
            navigationLight={LightTheme}
            navigationDark={DarkTheme}
          />
        </PaperProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

type NavProps = { navigationLight: any; navigationDark: any };

function RootLayoutNav({ navigationLight, navigationDark }: NavProps) {
  const colorScheme = useColorScheme();
  const { user, loading } = useAuth();
  useGoalNotifier();

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
