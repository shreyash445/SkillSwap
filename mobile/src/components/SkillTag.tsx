import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, font, radius, withAlpha } from "../theme";

const categoryColor: Record<string, string> = {
  technical: "#5AC8FA",
  creative: "#FF9F5A",
  language: "#CDFF57",
  sports: "#4ADE80",
};

export function SkillTag({
  name,
  category,
  accent,
}: {
  name: string;
  category?: string;
  accent?: boolean;
}) {
  const color = accent ? colors.accent : categoryColor[category ?? "technical"] ?? colors.textDim;
  return (
    <View
      style={[
        styles.tag,
        accent && {
          backgroundColor: withAlpha(colors.accent, 0.10),
          borderColor: withAlpha(colors.accent, 0.35),
        },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.text, accent && { color }]}>{name}</Text>
    </View>
  );
}

export function SkillArrow({ a, b }: { a: string; b: string }) {
  return (
    <View style={styles.arrowRow}>
      <View style={styles.arrowSide}>
        <SkillTag name={a} accent />
      </View>
      <Text style={styles.arrow}>⇄</Text>
      <View style={styles.arrowSide}>
        <SkillTag name={b} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.elevated,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontFamily: font.bodyMedium,
    fontSize: 12,
    color: colors.textDim,
  },
  arrowRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  arrowSide: {
    flexShrink: 1,
  },
  arrow: {
    fontFamily: font.display,
    color: colors.textFaint,
    fontSize: 15,
  },
});