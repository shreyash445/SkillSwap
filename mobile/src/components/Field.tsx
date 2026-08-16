import React from "react";
import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";
import { colors, font, radius, spacing } from "../theme";

interface Props extends TextInputProps {
  label?: string;
  error?: string;
}

export function Field({ label, error, style, ...props }: Props) {
  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={colors.textFaint}
        selectionColor={colors.accent}
        style={[styles.input, error && styles.error, style]}
        {...props}
      />
      {error ? <Text style={styles.err}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 6,
    marginBottom: spacing.md,
  },
  label: {
    fontFamily: font.mono,
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: colors.textDim,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    fontFamily: font.body,
    fontSize: 16,
    color: colors.text,
  },
  error: {
    borderColor: colors.danger,
  },
  err: {
    fontFamily: font.body,
    fontSize: 12,
    color: colors.danger,
  },
});