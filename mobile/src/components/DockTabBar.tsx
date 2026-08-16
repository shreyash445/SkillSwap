import React, { useEffect, useState } from "react";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from "react-native-reanimated";
import { get } from "../api";
import { colors, font } from "../theme";

const SCREEN_WIDTH = Dimensions.get("window").width;
const DOCK_SIDE = 28;
const DOCK_WIDTH = SCREEN_WIDTH - DOCK_SIDE * 2;
const DOCK_HEIGHT = 58;
const DOCK_RADIUS = DOCK_HEIGHT / 2;

const ICONS: Record<string, [keyof typeof Ionicons.glyphMap, keyof typeof Ionicons.glyphMap]> = {
  Discover: ["compass-outline", "compass"],
  Exchanges: ["swap-horizontal-outline", "swap-horizontal"],
  Messages: ["chatbubbles-outline", "chatbubbles"],
  Leaderboard: ["podium-outline", "podium"],
  Profile: ["person-outline", "person"],
};

const LABELS: Record<string, string> = {
  Discover: "Discover",
  Exchanges: "Swaps",
  Messages: "Chat",
  Leaderboard: "Top",
  Profile: "You",
};

function BadgeIcon({ name, focused, color }: { name: string; focused: boolean; color: string }) {
  const [outline, filled] = ICONS[name] ?? ["ellipse-outline", "ellipse"];
  const [total, setTotal] = useState(0);
  const scale = useSharedValue(1);
  const showBadge = name === "Messages" || name === "Exchanges";

  useEffect(() => {
    if (!showBadge) return;
    const poll = async () => {
      try {
        const n = await get<{ unread_messages: number; pending_exchanges: number }>("/notifications");
        const sum = n.unread_messages + n.pending_exchanges;
        setTotal((prev) => {
          if (sum > prev) {
            scale.value = withSequence(
              withSpring(1.4, { damping: 8 }),
              withSpring(1, { damping: 12 })
            );
          }
          return sum;
        });
      } catch {
        /* ignore */
      }
    };
    poll();
    const t = setInterval(poll, 8000);
    return () => clearInterval(t);
  }, []);

  const badgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View>
      <Ionicons name={focused ? filled : outline} size={22} color={color} />
      {showBadge && total > 0 && (
        <Animated.View style={[styles.badge, badgeStyle]}>
          <View style={styles.badgeDot} />
        </Animated.View>
      )}
    </View>
  );
}

export function DockTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <BlurView intensity={80} tint="dark" style={styles.dock}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const opts = descriptors[route.key].options;

          return (
            <Pressable
              key={route.key}
              style={styles.tab}
              accessibilityRole="button"
              accessibilityLabel={opts.tabBarAccessibilityLabel}
              onPress={() => {
                const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
                if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
              }}
            >
              <BadgeIcon
                name={route.name}
                focused={focused}
                color={focused ? colors.accent : colors.textFaint}
              />
              <Text style={[styles.label, focused && { color: colors.accent }]}>
                {LABELS[route.name] ?? route.name}
              </Text>
            </Pressable>
          );
        })}
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 12,
    alignItems: "center",
    backgroundColor: "transparent",
  },
  dock: {
    flexDirection: "row",
    alignItems: "center",
    width: DOCK_WIDTH,
    height: DOCK_HEIGHT,
    borderRadius: DOCK_RADIUS,
    overflow: "hidden",
    backgroundColor: "rgba(13,13,13,0.78)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    paddingHorizontal: 6,
    shadowColor: "#000",
    shadowOpacity: 0.45,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 1,
  },
  label: {
    fontFamily: font.bodyMedium,
    fontSize: 10,
    color: colors.textFaint,
  },
  badge: {
    position: "absolute",
    top: -3,
    right: -8,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.accent,
    borderWidth: 1.5,
    borderColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.bg,
  },
});
