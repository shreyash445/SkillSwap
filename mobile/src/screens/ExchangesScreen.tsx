import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Screen, Header } from "../components/Screen";
import { Avatar } from "../components/Avatar";
import { Button } from "../components/Button";
import { Stars } from "../components/StarRating";
import { EmptyState } from "../components/EmptyState";
import { RateSheet } from "../components/RateSheet";
import { get, patch } from "../api";
import { useAuth } from "../context/AuthContext";
import { colors, font, radius, spacing } from "../theme";
import type { TabScreenProps } from "../navigation";
import type { Exchange } from "../types";

type Props = TabScreenProps<"Exchanges">;

const STATUS_ORDER = ["pending", "accepted", "completed", "cancelled"] as const;
const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  accepted: "Accepted",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function ExchangesScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [rateFor, setRateFor] = useState<Exchange | null>(null);
  const [acting, setActing] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setExchanges(await get<Exchange[]>("/exchanges"));
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
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

  const act = async (id: string, action: string) => {
    setActing(id);
    try {
      const updated = await patch<Exchange>(`/exchanges/${id}`, { action });
      setExchanges((prev) => prev.map((e) => (e.id === id ? updated : e)));
    } catch {
      /* ignore */
    } finally {
      setActing(null);
    }
  };

  const grouped = STATUS_ORDER.map((status) => ({
    status,
    items: exchanges.filter((e) => e.status === status),
  })).filter((g) => g.items.length > 0);

  const renderExchange = ({ item }: { item: Exchange }) => {
    const isRecipient = item.recipient.id === user?.id;
    const pendingActions = isRecipient ? (
      <>
        <Button label="Accept" onPress={() => act(item.id, "accept")} loading={acting === item.id} style={{ flex: 1 }} />
        <Button label="Decline" variant="danger" onPress={() => act(item.id, "decline")} style={{ flex: 1 }} />
      </>
    ) : (
      <>
        <Button label="Cancel" variant="ghost" onPress={() => act(item.id, "cancel")} style={{ flex: 1 }} />
      </>
    );

    const acceptedActions = (
      <>
        <Button
          label="Message"
          variant="secondary"
          onPress={() => navigation.navigate("Conversation", { exchange: item })}
          style={{ flex: 1 }}
        />
        <Button label="Mark complete" onPress={() => act(item.id, "complete")} loading={acting === item.id} style={{ flex: 1 }} />
      </>
    );

    const completedActions = item.my_rating ? (
      <View style={styles.rated}>
        <Stars value={item.my_rating.stars} size={14} />
        <Text style={styles.ratedText}>You rated this exchange</Text>
      </View>
    ) : (
      <Button label="Rate this exchange" onPress={() => setRateFor(item)} style={{ flex: 1 }} />
    );

    return (
      <View style={styles.card}>
        <View style={styles.cardHead}>
          <Avatar initials={item.other_user.initials} color={item.other_user.avatar_color} size={40} />
          <View style={styles.cardIdentity}>
            <Text style={styles.name}>{item.other_user.full_name}</Text>
            <Text style={styles.meta}>
              {item.proposed_duration} min · {item.proposed_date ?? "date TBD"}
            </Text>
          </View>
          <View style={statusStyle(item.status)}>
            <Text style={[styles.statusText, { color: statusColor(item.status) }]}>
              {STATUS_LABEL[item.status]}
            </Text>
          </View>
        </View>

        <View style={styles.swapRow}>
          <Text style={styles.swapItem}>
            <Text style={styles.swapAccent}>You {isRecipient ? "get" : "teach"}: </Text>
            {item.skill_offered_name}
          </Text>
          <Ionicons name="swap-horizontal" size={16} color={colors.textFaint} />
          <Text style={styles.swapItem}>
            <Text style={styles.swapAccent}>You {isRecipient ? "teach" : "get"}: </Text>
            {item.skill_wanted_name}
          </Text>
        </View>

        {item.message ? <Text style={styles.message}>“{item.message}”</Text> : null}

        <View style={styles.actions}>
          {item.status === "pending" && pendingActions}
          {item.status === "accepted" && acceptedActions}
          {item.status === "completed" && completedActions}
        </View>
      </View>
    );
  };

  return (
    <Screen>
      <Header title="Exchanges" subtitle="Proposals, plans and swaps" />
      <FlatList
        data={grouped}
        keyExtractor={(g) => g.status}
        renderItem={({ item }) => (
          <View style={styles.group}>
            <Text style={styles.groupLabel}>
              {STATUS_LABEL[item.status].toUpperCase()} ({item.items.length})
            </Text>
            <View style={{ gap: spacing.md }}>
              {item.items.map((ex) => (
                <React.Fragment key={ex.id}>{renderExchange({ item: ex })}</React.Fragment>
              ))}
            </View>
          </View>
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.textDim} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator color={colors.accent} style={{ marginTop: 60 }} />
          ) : (
            <EmptyState
              icon="swap-horizontal"
              title="No exchanges yet"
              hint="Head to Discover and propose a swap with someone."
            />
          )
        }
      />

      {rateFor && <RateSheet exchange={rateFor} visible={!!rateFor} onClose={() => setRateFor(null)} onDone={load} />}
    </Screen>
  );
}

const statusStyle = (s: string) => {
  const base = styles.statusBase;
  if (s === "pending") return [base, { borderColor: "rgba(90,200,250,0.4)" }];
  if (s === "accepted") return [base, { borderColor: "rgba(205,255,87,0.4)" }];
  if (s === "completed") return [base, { borderColor: "rgba(74,222,128,0.4)" }];
  return [base, { borderColor: colors.cardBorder }];
};

const statusColor = (s: string) =>
  s === "pending" ? colors.info : s === "accepted" ? colors.accent : s === "completed" ? colors.success : colors.textFaint;

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  group: {
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  groupLabel: {
    fontFamily: font.mono,
    fontSize: 11,
    letterSpacing: 2,
    color: colors.textFaint,
  },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.md,
  },
  cardHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  cardIdentity: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontFamily: font.display,
    fontSize: 16,
    color: colors.text,
  },
  meta: {
    fontFamily: font.body,
    fontSize: 12,
    color: colors.textFaint,
  },
  statusBase: {
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: {
    fontFamily: font.bodySemi,
    fontSize: 11,
  },
  swapRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  swapItem: {
    flex: 1,
    fontFamily: font.bodyMedium,
    fontSize: 13.5,
    color: colors.text,
  },
  swapAccent: {
    color: colors.textFaint,
  },
  message: {
    fontFamily: font.body,
    fontSize: 13,
    color: colors.textDim,
    fontStyle: "italic",
    lineHeight: 19,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  rated: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: 12,
  },
  ratedText: {
    fontFamily: font.body,
    fontSize: 13,
    color: colors.textDim,
  },
});