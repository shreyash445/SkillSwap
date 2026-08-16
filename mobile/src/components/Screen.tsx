import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, font, spacing } from "../theme";

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  scroll?: boolean;
}

export function Screen({ children, style }: Props) {
  return (
    <SafeAreaView style={[styles.safe, style]} edges={["top", "left", "right"]}>
      {children}
    </SafeAreaView>
  );
}

export function Label({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <Text style={styles.label}>{children}</Text>;
}

export function Header({
  title,
  right,
  subtitle,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <View style={styles.header}>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  title: {
    fontFamily: font.displayBold,
    fontSize: 26,
    color: colors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: font.body,
    fontSize: 13,
    color: colors.textDim,
    marginTop: 2,
  },
  label: {
    fontFamily: font.mono,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: colors.textFaint,
  },
});