import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "../components/Screen";
import { Avatar } from "../components/Avatar";
import { get, post } from "../api";
import { useAuth } from "../context/AuthContext";
import { colors, font, radius, spacing } from "../theme";
import type { RootStackParamList } from "../navigation";
import type { Message } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "Conversation">;

export function ConversationScreen({ route }: Props) {
  const { exchange } = route.params;
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const listRef = useRef<FlatList>(null);

  const load = useCallback(async () => {
    try {
      setMessages(await get<Message[]>(`/exchanges/${exchange.id}/messages`));
    } catch {
      /* ignore */
    }
  }, [exchange.id]);

  useEffect(() => {
    load();
    const t = setInterval(load, 8000);
    return () => clearInterval(t);
  }, [load]);

  const send = async () => {
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    try {
      const msg = await post<Message>(`/exchanges/${exchange.id}/messages`, { content: text });
      setMessages((prev) => [...prev, msg]);
    } catch {
      setDraft(text);
    }
  };

  const other = exchange.other_user;

  return (
    <Screen>
      <View style={styles.header}>
        <Avatar initials={other.initials} color={other.avatar_color} size={34} />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{other.full_name}</Text>
          <Text style={styles.sub}>
            {exchange.skill_offered_name} ⇄ {exchange.skill_wanted_name}
          </Text>
        </View>
        <View style={[styles.status, { borderColor: statusBorder(exchange.status) }]}>
          <Text style={[styles.statusText, { color: statusColor(exchange.status) }]}>{exchange.status}</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={70}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          contentContainerStyle={styles.messages}
          renderItem={({ item }) => {
            const mine = item.sender === user?.id;
            return (
              <View style={[styles.bubbleRow, mine ? styles.rowMine : styles.rowTheirs]}>
                <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
                  <Text style={[styles.bubbleText, mine && styles.bubbleTextMine]}>{item.content}</Text>
                  <Text style={[styles.time, mine ? styles.timeMine : styles.timeTheirs]}>
                    {new Date(item.created_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                  </Text>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="chatbubble-ellipses-outline" size={28} color={colors.textFaint} />
              <Text style={styles.emptyText}>
                Start the conversation — agree on a time for your {exchange.skill_offered_name} ⇄{" "}
                {exchange.skill_wanted_name} swap.
              </Text>
            </View>
          }
        />

        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="Message..."
            placeholderTextColor={colors.textFaint}
            value={draft}
            onChangeText={setDraft}
            multiline
          />
          <Pressable onPress={send} style={styles.send}>
            <Ionicons name="arrow-up" size={20} color="#000000" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const statusColor = (s: string) =>
  s === "accepted" ? colors.accent : s === "completed" ? colors.success : colors.info;
const statusBorder = (s: string) =>
  s === "accepted" ? "rgba(205,255,87,0.4)" : s === "completed" ? "rgba(74,222,128,0.4)" : "rgba(90,200,250,0.4)";

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  name: {
    fontFamily: font.display,
    fontSize: 16,
    color: colors.text,
  },
  sub: {
    fontFamily: font.body,
    fontSize: 12,
    color: colors.textFaint,
  },
  status: {
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: {
    fontFamily: font.bodySemi,
    fontSize: 11,
    textTransform: "capitalize",
  },
  messages: {
    padding: spacing.lg,
    gap: spacing.sm,
    paddingBottom: spacing.xl,
  },
  bubbleRow: {
    flexDirection: "row",
  },
  rowMine: {
    justifyContent: "flex-end",
  },
  rowTheirs: {
    justifyContent: "flex-start",
  },
  bubble: {
    maxWidth: "78%",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleMine: {
    backgroundColor: colors.accent,
    borderBottomRightRadius: 6,
  },
  bubbleTheirs: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderBottomLeftRadius: 6,
  },
  bubbleText: {
    fontFamily: font.body,
    fontSize: 15,
    color: colors.text,
    lineHeight: 21,
  },
  bubbleTextMine: {
    color: "#000000",
  },
  time: {
    fontFamily: font.body,
    fontSize: 10,
    marginTop: 3,
    alignSelf: "flex-end",
  },
  timeMine: {
    color: "rgba(11,11,15,0.55)",
  },
  timeTheirs: {
    color: colors.textFaint,
  },
  empty: {
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  emptyText: {
    fontFamily: font.body,
    fontSize: 14,
    color: colors.textDim,
    textAlign: "center",
    lineHeight: 20,
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.sm,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    backgroundColor: colors.surface,
  },
  input: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 11,
    fontFamily: font.body,
    fontSize: 15,
    color: colors.text,
    maxHeight: 100,
  },
  send: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
});