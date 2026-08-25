import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { colors, font } from "../theme";
import { Logo } from "./Logo";

export function Splash({ onDone }: { onDone: () => void }) {
  const markScale = useSharedValue(0.5);
  const markOpacity = useSharedValue(0);
  const textY = useSharedValue(20);
  const textOpacity = useSharedValue(0);
  const tagOpacity = useSharedValue(0);
  const contentX = useSharedValue(0);
  const contentY = useSharedValue(0);
  const contentOpacity = useSharedValue(1);

  useEffect(() => {
    markScale.value = withSpring(1, { damping: 11, stiffness: 170 });
    markOpacity.value = withTiming(1, { duration: 280 });
    textY.value = withDelay(200, withSpring(0, { damping: 13, stiffness: 150 }));
    textOpacity.value = withDelay(200, withTiming(1, { duration: 350 }));
    tagOpacity.value = withDelay(460, withTiming(1, { duration: 400 }));
    const t = setTimeout(() => {
      contentX.value = withTiming(0, { duration: 520 });
      contentY.value = withTiming(-220, { duration: 520 });
      contentOpacity.value = withTiming(0, { duration: 520 });
      onDone();
    }, 1700);
    return () => clearTimeout(t);
  }, [onDone]);

  const markStyle = useAnimatedStyle(() => ({
    opacity: markOpacity.value,
    transform: [{ scale: markScale.value }],
  }));
  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textY.value }],
  }));
  const tagStyle = useAnimatedStyle(() => ({ opacity: tagOpacity.value }));
  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateX: contentX.value }, { translateY: contentY.value }],
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.inner, contentStyle]}>
        <Animated.View style={[styles.mark, markStyle]}>
          <Logo size={110} color={colors.accent} />
        </Animated.View>
        <Animated.View style={textStyle}>
          <Text style={styles.brand}>SkillSwap</Text>
        </Animated.View>
        <Animated.Text style={[styles.tagline, tagStyle]}>
          Teach what you know. Learn what you don&apos;t.
        </Animated.Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  inner: {
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  mark: {
    width: 110,
    height: 110,
    alignItems: "center",
    justifyContent: "center",
  },
  brand: {
    fontFamily: font.displayBold,
    fontSize: 40,
    letterSpacing: -1.5,
    color: colors.text,
  },
  tagline: {
    fontFamily: font.body,
    fontSize: 15,
    color: colors.textDim,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 32,
  },
});