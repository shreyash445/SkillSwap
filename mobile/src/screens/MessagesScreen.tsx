import React, { useCallback, useEffect, useState } from "react";
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Screen, Header } from "../components/Screen";
import { Avatar } from "../components/Avatar";
import { EmptyState } from "../components/EmptyState";
import { get } from "../api";
import { useAuth } from "../context/AuthContext";
import { colors, font, radius, spacing } from "../theme";
import type { TabScreenProps } from "../navigation";
import type { Exchange } from "../types";

type Props = TabScreenProps<"Messages">;

export function MessagesScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const all = await get<Exchange[]>("/exchanges");
      const withMsgs = all.filter((e) => e.last_message && e.status !== "cancelled");
      withMsgs.sort(
        (a, b) =>
          new Date(b.last_message!.created_at).getTime() - new Date(a.last_message!.created_at).getTime()
      );
      setExchanges(withMsgs);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 10000);
    return () => clearInterval(t);
  }, [load]);

  const refresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  return (
    <Screen>
      <Header title="Messages" subtitle="Conversations about your swaps" />
      <FlatList
        data={exchanges}
        keyExtractor={(e) => e.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.textDim} />}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const mine = item.last_message!.sender_id === user?.id;
          return (
            <Pressable
              style={styles.row}
              onPress={() => navigation.navigate("Conversation", { exchange: item })}
            >
              <Avatar initials={item.other_user.initials} color={item.other_user.avatar_color} size={46} />
              <View style={{ flex: 1, gap: 2 }}>
                <View style={styles.rowTop}>
                  <Text style={styles.name}>{item.other_user.full_name}</Text>
                  <Text style={styles.time}>
                    {timeAgo(item.last_message!.created_at)}
                  </Text>
                </View>
                <Text numberOfLines={1} style={[styles.preview, mine && styles.previewMine]}>
                  {mine ? "You: " : ""}
                  {item.last_message!.content}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textFaint} />
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <EmptyState
            icon="chatbubbles-outline"
            title="No conversations yet"
            hint="Once someone accepts your proposal, you can chat here to arrange the swap."
          />
        }
      />
    </Screen>
  );
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return new Date(iso).toLocaleDateString([], { month: "short", day: "numeric" });
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.sm,
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
  rowTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  name: {
    fontFamily: font.display,
    fontSize: 15,
    color: colors.text,
  },
  time: {
    fontFamily: font.body,
    fontSize: 11,
    color: colors.textFaint,
  },
  preview: {
    fontFamily: font.body,
    fontSize: 13,
    color: colors.textDim,
  },
  previewMine: {
    color: colors.textFaint,
  },
});