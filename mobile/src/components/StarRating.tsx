import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withDelay,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { colors, font } from "../theme";

export function Stars({ value, size = 16 }: { value: number; size?: number }) {
  return (
    <View style={{ flexDirection: "row", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Ionicons
          key={i}
          name={value >= i - 0.25 ? "star" : value >= i - 0.75 ? "star-half" : "star-outline"}
          size={size}
          color={colors.star}
        />
      ))}
    </View>
  );
}

export function StarPicker({
  value,
  onChange,
  size = 42,
}: {
  value: number;
  onChange: (v: number) => void;
  size?: number;
}) {
  const [hover, setHover] = useState(0);

  const renderStar = (i: number) => {
    const filled = i <= (hover || value);
    return (
      <StarIcon key={i} active={filled} size={size} onTap={() => onChange(i)} />
    );
  };

  return (
    <View
      style={{ flexDirection: "row", gap: 8 }}
      onTouchStart={() => setHover(0)}
    >
      {[1, 2, 3, 4, 5].map(renderStar)}
    </View>
  );
}

function StarIcon({ active, size, onTap }: { active: boolean; size: number; onTap: () => void }) {
  const scale = useSharedValue(1);

  const style = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      {
        rotate: `${(1 - scale.value) * 25}deg`,
      },
    ],
  }));

  const press = () => {
    scale.value = withSequence(
      withSpring(0.7, { damping: 12 }),
      withDelay(40, withSpring(1.15, { damping: 10 })),
      withDelay(40, withSpring(1, { damping: 14 }))
    );
    onTap();
  };

  return (
    <Pressable onPress={press}>
      <Animated.View style={style}>
        <Ionicons
          name={active ? "star" : "star-outline"}
          size={size}
          color={active ? colors.star : colors.textFaint}
        />
      </Animated.View>
    </Pressable>
  );
}

export function RatingPill({ rating, count }: { rating: number; count: number }) {
  if (count === 0) return <Text style={styles.empty}>New</Text>;
  return (
    <View style={styles.pill}>
      <Ionicons name="star" size={12} color={colors.star} />
      <Text style={styles.rating}>{rating.toFixed(1)}</Text>
      <Text style={styles.count}>({count})</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(255,201,77,0.12)",
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  rating: {
    fontFamily: font.bodySemi,
    color: colors.star,
    fontSize: 13,
  },
  count: {
    fontFamily: font.body,
    color: colors.textFaint,
    fontSize: 12,
  },
  empty: {
    fontFamily: font.bodySemi,
    color: colors.textFaint,
    fontSize: 13,
  },
});