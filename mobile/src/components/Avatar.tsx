import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { font } from "../theme";

interface Props {
  initials: string;
  color: string;
  size?: number;
}

export function Avatar({ initials, color, size = 44 }: Props) {
  return (
    <View
      style={[
        styles.wrap,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
      ]}
    >
      <Text style={[styles.initials, { fontSize: size * 0.38 }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  initials: {
    fontFamily: font.displayBold,
    color: "#000000",
    letterSpacing: 0.5,
  },
});