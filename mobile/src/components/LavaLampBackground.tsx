import React, { useEffect } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { colors } from "../theme";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface BlobDef {
  size: number;
  color: string;
  initialX: number;
  initialY: number;
  dx: number;
  dy: number;
  duration: number;
}

const BLOBS: BlobDef[] = [
  { size: 320, color: "#ff0000", initialX: -40, initialY: 80, dx: 160, dy: 200, duration: 6500 },
  { size: 360, color: "#ff0000", initialX: SCREEN_WIDTH - 200, initialY: 40, dx: -140, dy: 240, duration: 8000 },
  { size: 340, color: "#ff0000", initialX: 20, initialY: SCREEN_HEIGHT - 360, dx: 180, dy: -160, duration: 8500 },
  { size: 300, color: "#ff0000", initialX: SCREEN_WIDTH - 220, initialY: SCREEN_HEIGHT - 280, dx: -120, dy: -180, duration: 7000 },
  { size: 280, color: "#ff0000", initialX: SCREEN_WIDTH / 2 - 140, initialY: SCREEN_HEIGHT / 2 - 140, dx: 90, dy: -100, duration: 6000 },
  { size: 220, color: "#f83838", initialX: 100, initialY: 260, dx: 130, dy: 150, duration: 5500 },
  { size: 180, color: "#f83838", initialX: SCREEN_WIDTH - 260, initialY: SCREEN_HEIGHT - 180, dx: -100, dy: -120, duration: 6200 },
];

function LavaBlob({ blob }: { blob: BlobDef }) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    translateX.value = withRepeat(
      withSequence(
        withTiming(blob.dx, { duration: blob.duration, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: blob.duration, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      true
    );

    translateY.value = withRepeat(
      withSequence(
        withTiming(blob.dy, { duration: blob.duration * 1.15, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: blob.duration * 1.15, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      true
    );

    scale.value = withRepeat(
      withSequence(
        withTiming(1.25, { duration: blob.duration * 0.8, easing: Easing.inOut(Easing.quad) }),
        withTiming(0.85, { duration: blob.duration * 0.8, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.blob,
        {
          width: blob.size,
          height: blob.size,
          borderRadius: blob.size / 2,
          backgroundColor: blob.color,
          left: blob.initialX,
          top: blob.initialY,
        },
        animatedStyle,
      ]}
    />
  );
}

export function LavaLampBackground({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.container}>
      <View style={StyleSheet.absoluteFill}>
        {BLOBS.map((blob, index) => (
          <LavaBlob key={index} blob={blob} />
        ))}
      </View>

      <BlurView
        intensity={100}
        tint="dark"
        experimentalBlurMethod="dimezisBlurView"
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.scrim} />

      <View style={styles.contentContainer}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    overflow: "hidden",
  },
  blob: {
    position: "absolute",
    opacity: 0.85,
  },
  contentContainer: {
    flex: 1,
    zIndex: 1,
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
});