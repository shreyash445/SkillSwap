import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { colors, font, radius, spacing } from "../theme";

interface Props {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  icon?: React.ReactNode;
}

export function Button({ label, onPress, variant = "primary", disabled, loading, style, icon }: Props) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const bg =
    variant === "primary"
      ? colors.accent
      : variant === "secondary"
      ? colors.elevated
      : variant === "danger"
      ? "rgba(255,92,92,0.12)"
      : "transparent";

  const fg =
    variant === "primary"
      ? "#000000"
      : variant === "danger"
      ? colors.danger
      : variant === "ghost"
      ? colors.text
      : colors.text;

  const border =
    variant === "secondary"
      ? { borderWidth: 1, borderColor: colors.cardBorder }
      : variant === "ghost"
      ? { borderWidth: 1, borderColor: colors.cardBorder }
      : {};

  return (
    <Animated.View style={[animatedStyle, style]}>
      <Pressable
        onPressIn={() => {
          scale.value = withSpring(0.97, { damping: 18 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 18 });
        }}
        onPress={onPress}
        disabled={disabled || loading}
        style={({ pressed }) => [
          styles.base,
          { backgroundColor: bg },
          border,
          pressed && { opacity: 0.85 },
          (disabled || loading) && { opacity: 0.4 },
        ]}
      >
        {loading ? (
          <ActivityIndicator color={fg} />
        ) : (
          <>
            {icon}
            <Text style={[styles.label, { color: fg }]}>{label}</Text>
          </>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  label: {
    fontFamily: font.display,
    fontSize: 15,
    letterSpacing: 0.2,
  },
});