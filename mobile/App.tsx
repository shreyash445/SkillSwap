import React, { useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import Animated, { useSharedValue, withTiming } from "react-native-reanimated";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StatusBar } from "expo-status-bar";
import {
  useFonts,
  Sora_600SemiBold,
  Sora_700Bold,
} from "@expo-google-fonts/sora";
import {
  InstrumentSans_400Regular,
  InstrumentSans_500Medium,
  InstrumentSans_600SemiBold,
} from "@expo-google-fonts/instrument-sans";
import { SpaceMono_400Regular } from "@expo-google-fonts/space-mono";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { colors } from "./src/theme";
import type { RootStackParamList, TabParamList } from "./src/navigation";

import { Splash } from "./src/components/Splash";
import { DockTabBar } from "./src/components/DockTabBar";
import { LoginScreen } from "./src/screens/LoginScreen";
import { RegisterScreen } from "./src/screens/RegisterScreen";
import { WelcomeScreen } from "./src/screens/WelcomeScreen";
import { OnboardingScreen } from "./src/screens/OnboardingScreen";
import { DiscoverScreen } from "./src/screens/DiscoverScreen";
import { ExchangesScreen } from "./src/screens/ExchangesScreen";
import { MessagesScreen } from "./src/screens/MessagesScreen";
import { LeaderboardScreen } from "./src/screens/LeaderboardScreen";
import { ProfileScreen } from "./src/screens/ProfileScreen";
import { UserProfileScreen } from "./src/screens/UserProfileScreen";
import { ConversationScreen } from "./src/screens/ConversationScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<TabParamList>();

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.bg,
    card: colors.surface,
    border: colors.cardBorder,
    primary: colors.accent,
    text: colors.text,
  },
};

function MainTabs() {
  return (
    <Tabs.Navigator
      tabBar={(props) => <DockTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen name="Discover" component={DiscoverScreen} />
      <Tabs.Screen name="Exchanges" component={ExchangesScreen} />
      <Tabs.Screen name="Messages" component={MessagesScreen} />
      <Tabs.Screen name="Leaderboard" component={LeaderboardScreen} />
      <Tabs.Screen name="Profile" component={ProfileScreen} />
    </Tabs.Navigator>
  );
}

function RootNavigator() {
  const { user, initializing } = useAuth();

  if (initializing) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  const needsOnboarding = !!user && user.offers.length === 0 && user.wants.length === 0;
  const initialRoute = !user ? "Login" : needsOnboarding ? "Welcome" : "Main";

  return (
    <Stack.Navigator
      key={user ? "authed" : "anon"}
      initialRouteName={initialRoute}
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg },
        animation: "slide_from_right",
      }}
    >
      {!user ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ animation: "slide_from_bottom" }} />
        </>
      ) : (
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ animation: "fade" }} />
          <Stack.Screen
            name="Onboarding"
            component={OnboardingScreen}
            options={{ animation: "slide_from_bottom" }}
          />
          <Stack.Screen name="UserProfile" component={UserProfileScreen} options={{ animation: "slide_from_right" }} />
          <Stack.Screen name="Conversation" component={ConversationScreen} options={{ animation: "slide_from_right" }} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Sora_600SemiBold,
    Sora_700Bold,
    InstrumentSans_400Regular,
    InstrumentSans_500Medium,
    InstrumentSans_600SemiBold,
    SpaceMono_400Regular,
  });
  const [navReady, setNavReady] = useState(false);
  const [splashGone, setSplashGone] = useState(false);
  const splashOpacity = useSharedValue(1);

  if (!fontsLoaded) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  const handleSplashDone = () => {
    setNavReady(true);
    splashOpacity.value = withTiming(0, { duration: 520 });
    setTimeout(() => setSplashGone(true), 560);
  };

  return (
    <SafeAreaProvider>
      <AuthProvider>
        {navReady && (
          <NavigationContainer theme={navTheme}>
            <StatusBar style="light" />
            <RootNavigator />
          </NavigationContainer>
        )}
        {!splashGone && (
          <Animated.View
            style={[StyleSheet.absoluteFill, { opacity: splashOpacity }]}
            pointerEvents="none"
          >
            <Splash onDone={handleSplashDone} />
          </Animated.View>
        )}
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
  },
});