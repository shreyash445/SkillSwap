import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { Screen, Header } from "../components/Screen";
import { Avatar } from "../components/Avatar";
import { get } from "../api";
import { colors, font, radius, spacing } from "../theme";
import type { TabScreenProps } from "../navigation";
import type { LeaderboardEntry } from "../types";

type Props = TabScreenProps<"Leaderboard">;

const MEDALS = ["🥇", "🥈", "🥉"];
const PODIUM_COLORS = ["#CDFF57", "#C0C0C8", "#D99B5C"];

export function LeaderboardScreen({ navigation }: Props) {
  const [rows, setRows] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setRows(await get<LeaderboardEntry[]>("/leaderboard"));
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const refresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const renderRow = ({ item, index }: { item: LeaderboardEntry; index: number }) => {
    const top3 = index < 3;
    return (
      <Animated.View entering={FadeInDown.delay(index * 35).duration(300)}>
        <Pressable
          style={[styles.row, top3 && { borderColor: "rgba(205,255,87,0.35)" }]}
          onPress={() => navigation.navigate("UserProfile", { user: item.user })}
        >
          <View style={styles.rank}>
            {top3 ? <Text style={styles.medal}>{MEDALS[index]}</Text> : <Text style={styles.rankNum}>{item.rank}</Text>}
          </View>
          <Avatar initials={item.user.initials} color={item.user.avatar_color} size={40} />
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{item.user.full_name}</Text>
            <Text style={styles.count}>{item.completed_exchanges} completed swap{item.completed_exchanges === 1 ? "" : "s"}</Text>
          </View>
          <View style={styles.ratingBox}>
            <Ionicons name="star" size={14} color={colors.star} />
            <Text style={styles.rating}>{item.avg_rating.toFixed(1)}</Text>
          </View>
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <Screen>
      <Header title="Leaderboard" subtitle="Top skill exchangers on campus" />
      <FlatList
        data={rows}
        keyExtractor={(r) => r.user.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.textDim} />}
        contentContainerStyle={styles.list}
        renderItem={renderRow}
        ListHeaderComponent={
          <View style={styles.note}>
            <Ionicons name="information-circle-outline" size={16} color={colors.accent} />
            <Text style={styles.noteText}>Ranked by average star rating from completed swaps.</Text>
          </View>
        }
        ListEmptyComponent={
          loading ? <ActivityIndicator color={colors.accent} style={{ marginTop: 60 }} /> : null
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.sm,
  },
  note: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(205,255,87,0.06)",
    borderWidth: 1,
    borderColor: "rgba(205,255,87,0.2)",
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  noteText: {
    flex: 1,
    fontFamily: font.body,
    fontSize: 12.5,
    color: colors.textDim,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  rank: {
    width: 36,
    alignItems: "center",
  },
  medal: {
    fontSize: 20,
  },
  rankNum: {
    fontFamily: font.displayBold,
    fontSize: 17,
    color: colors.textFaint,
  },
  name: {
    fontFamily: font.display,
    fontSize: 15,
    color: colors.text,
  },
  count: {
    fontFamily: font.body,
    fontSize: 12,
    color: colors.textFaint,
  },
  ratingBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,201,77,0.1)",
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  rating: {
    fontFamily: font.displayBold,
    fontSize: 14,
    color: colors.star,
  },
});