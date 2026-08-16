import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
} from "react-native-reanimated";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Screen } from "../components/Screen";
import { LavaLampBackground } from "../components/LavaLampBackground";
import { Field } from "../components/Field";
import { Button } from "../components/Button";
import { Logo } from "../components/Logo";
import { useAuth } from "../context/AuthContext";
import { colors, font, spacing } from "../theme";
import type { RootStackParamList } from "../navigation";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export function LoginScreen({ navigation }: Props) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const heroOpacity = useSharedValue(0);
  const heroScale = useSharedValue(0.92);
  const heroY = useSharedValue(30);
  const formOpacity = useSharedValue(0);
  const formY = useSharedValue(80);

  useEffect(() => {
    heroOpacity.value = withTiming(1, { duration: 500 });
    heroScale.value = withTiming(1, { duration: 500 });
    heroY.value = withSequence(
      withTiming(0, { duration: 500 }),
      withDelay(250, withTiming(-90, { duration: 500 }))
    );
    formOpacity.value = withDelay(750, withTiming(1, { duration: 500 }));
    formY.value = withDelay(750, withTiming(0, { duration: 500 }));
  }, []);

  const heroStyle = useAnimatedStyle(() => ({
    opacity: heroOpacity.value,
    transform: [{ translateY: heroY.value }, { scale: heroScale.value }],
  }));
  const formStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [{ translateY: formY.value }],
  }));

  const submit = async () => {
    setError("");
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <LavaLampBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <Animated.View style={[styles.hero, heroStyle]}>
          <Logo size={96} color={colors.accent} />
          <Text style={styles.brand}>SkillSwap</Text>
          <Text style={styles.tagline}>Teach what you know. Learn what you don't.</Text>
        </Animated.View>

        <Animated.View style={[styles.form, formStyle]}>
          <Field
            label="Email"
            placeholder="you@email.com"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <Field
            label="Password"
            placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Button label="Sign in" onPress={submit} loading={loading} />
          <Pressable style={styles.switch} onPress={() => navigation.navigate("Register")}>
            <Text style={styles.switchText}>
              New here? <Text style={styles.switchAccent}>Create an account</Text>
            </Text>
          </Pressable>
        </Animated.View>
      </KeyboardAvoidingView>
      </LavaLampBackground>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  hero: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  brand: {
    fontFamily: font.displayBold,
    fontSize: 40,
    letterSpacing: -1.5,
    color: colors.text,
  },
  tagline: {
    fontFamily: font.body,
    fontSize: 16,
    color: colors.textDim,
    textAlign: "center",
    lineHeight: 24,
  },
  form: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  error: {
    fontFamily: font.body,
    color: colors.danger,
    marginBottom: spacing.md,
    fontSize: 14,
  },
  switch: {
    marginTop: spacing.lg,
    alignItems: "center",
  },
  switchText: {
    fontFamily: font.body,
    fontSize: 14,
    color: colors.textDim,
  },
  switchAccent: {
    fontFamily: font.bodySemi,
    color: colors.accent,
  },
});