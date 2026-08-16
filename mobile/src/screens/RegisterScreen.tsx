import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Screen } from "../components/Screen";
import { Field } from "../components/Field";
import { Button } from "../components/Button";
import { useAuth } from "../context/AuthContext";
import { colors, font, spacing } from "../theme";
import type { RootStackParamList } from "../navigation";

type Props = NativeStackScreenProps<RootStackParamList, "Register">;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function RegisterScreen({ navigation }: Props) {
  const { register } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError("");
    if (!firstName.trim()) return setError("Please enter your first name");
    if (!EMAIL_RE.test(email.trim())) return setError("Enter a valid email address");
    if (password.length < 8) return setError("Password must be at least 8 characters");

    setLoading(true);
    try {
      await register({
        email: email.trim(),
        password,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
      });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.sub}>
            Use any email — personal or school.
          </Text>

          <Field label="First name" placeholder="Ada" value={firstName} onChangeText={setFirstName} />
          <Field label="Last name (optional)" placeholder="Lovelace" value={lastName} onChangeText={setLastName} />
          <Field
            label="Email"
            placeholder="ada@email.com"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <Field
            label="Password"
            placeholder="8+ characters"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Button label="Create account" onPress={submit} loading={loading} />
          <Pressable style={styles.switch} onPress={() => navigation.goBack()}>
            <Text style={styles.switchText}>
              Already have an account? <Text style={styles.switchAccent}>Sign in</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    padding: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl,
  },
  title: {
    fontFamily: font.displayBold,
    fontSize: 30,
    letterSpacing: -0.8,
    color: colors.text,
  },
  sub: {
    fontFamily: font.body,
    fontSize: 15,
    color: colors.textDim,
    lineHeight: 22,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
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