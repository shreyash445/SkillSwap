import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Sheet } from "./Sheet";
import { Button } from "./Button";
import { Field } from "./Field";
import { Label } from "./Screen";
import { post } from "../api";
import { useAuth } from "../context/AuthContext";
import { colors, font, radius, spacing, withAlpha } from "../theme";
import type { Exchange, User } from "../types";

const DURATIONS = [30, 60, 90];

export function ProposeSheet({
  user,
  visible,
  onClose,
  onDone,
}: {
  user: User;
  visible: boolean;
  onClose: () => void;
  onDone: () => void;
}) {
  const { user: me } = useAuth();
  const [mySkill, setMySkill] = useState<string | null>(null);
  const [theirSkill, setTheirSkill] = useState<string | null>(null);
  const [duration, setDuration] = useState(60);
  const [date, setDate] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState<Exchange | null>(null);

  const defaults = useMemo(() => {
    if (!me) return { mine: null, theirs: null };
    const theirWants = new Set(user.wants.map((w) => w.skill_id));
    const mine = me.offers.find((o) => theirWants.has(o.skill_id));
    const myWants = new Set(me.wants.map((w) => w.skill_id));
    const theirs = user.offers.find((o) => myWants.has(o.skill_id));
    return { mine: mine?.name ?? me.offers[0]?.name ?? null, theirs: theirs?.name ?? user.offers[0]?.name ?? null };
  }, [me, user]);

  const mySkillId = useMemo(() => {
    const s = me?.offers.find((o) => o.name === (mySkill ?? defaults.mine));
    return s?.skill_id ?? null;
  }, [me, mySkill, defaults.mine]);

  const theirSkillId = useMemo(() => {
    const s = user.offers.find((o) => o.name === (theirSkill ?? defaults.theirs));
    return s?.skill_id ?? null;
  }, [user, theirSkill, defaults.theirs]);

  const send = async () => {
    if (!mySkillId || !theirSkillId) return setError("Pick one skill for each side");
    setSending(true);
    setError("");
    try {
      const ex = await post<Exchange>("/exchanges", {
        recipient_id: user.id,
        skill_offered_id: mySkillId,
        skill_wanted_id: theirSkillId,
        proposed_duration: duration,
        proposed_date: date || null,
        message,
      });
      setSent(ex);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <Sheet visible={visible} onClose={onClose}>
      {sent ? (
        <View style={styles.sentWrap}>
          <View style={[styles.sentIcon, { backgroundColor: colors.accent }]}>
            <Ionicons name="paper-plane" size={26} color="#000000" />
          </View>
          <Text style={styles.sentTitle}>Proposal sent!</Text>
          <Text style={styles.sentText}>
            You offered to teach {sent.skill_offered_name} to {user.first_name} in exchange for{" "}
            {sent.skill_wanted_name}. They&apos;ll see it on their dashboard.
          </Text>
          <Button label="Done" onPress={onDone} />
        </View>
      ) : (
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Label>Exchange proposal</Label>
          <Text style={styles.title}>Swap with {user.first_name}</Text>

          <View style={styles.skillBox}>
            <View style={styles.skillBoxRow}>
              <Text style={styles.skillBoxTag}>You teach</Text>
              <SkillSelect
                options={me?.offers ?? []}
                value={mySkill ?? defaults.mine ?? ""}
                onChange={setMySkill}
              />
            </View>
            <View style={styles.arrowIcon}>
              <Ionicons name="swap-vertical" size={20} color={colors.textFaint} />
            </View>
            <View style={styles.skillBoxRow}>
              <Text style={styles.skillBoxTag}>They teach</Text>
              <SkillSelect
                options={user.offers}
                value={theirSkill ?? defaults.theirs ?? ""}
                onChange={setTheirSkill}
              />
            </View>
          </View>

          <Label style={{ marginTop: spacing.lg }}>Duration</Label>
          <View style={styles.durationRow}>
            {DURATIONS.map((d) => (
              <Pressable
                key={d}
                onPress={() => setDuration(d)}
                style={[styles.duration, duration === d && { backgroundColor: colors.accent, borderColor: colors.accent }]}
              >
                <Text style={[styles.durationText, duration === d && { color: "#000000" }]}>
                  {d} min
                </Text>
              </Pressable>
            ))}
          </View>

          <Field
            label="Proposed date"
            placeholder="e.g. 2026-08-22"
            value={date}
            onChangeText={setDate}
            autoCapitalize="none"
          />
          <Field
            label="Message (optional)"
            placeholder="Say hi, suggest a time, share your plans..."
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={3}
            style={{ minHeight: 84, textAlignVertical: "top" }}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.actions}>
            <Button label="Send proposal" onPress={send} loading={sending} />
            <Button label="Cancel" variant="ghost" onPress={onClose} />
          </View>
        </ScrollView>
      )}
    </Sheet>
  );
}

function SkillSelect({
  options,
  value,
  onChange,
}: {
  options: { skill_id: number; name: string; level?: string }[];
  value: string;
  onChange: (name: string) => void;
}) {
  return (
    <View style={styles.selectWrap}>
      {options.length === 0 ? (
        <Text style={styles.noSkill}>No skills added</Text>
      ) : (
        options.map((o) => {
          const active = o.name === value;
          return (
            <Pressable
              key={o.skill_id}
              onPress={() => onChange(o.name)}
              style={[
                styles.select,
                active && {
                  backgroundColor: withAlpha(colors.accent, 0.12),
                  borderColor: colors.accentDim,
                },
              ]}
            >
              <Text style={[styles.selectText, active && { color: colors.accent }]}>{o.name}</Text>
            </Pressable>
          );
        })
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: font.displayBold,
    fontSize: 24,
    color: colors.text,
    letterSpacing: -0.5,
    marginBottom: spacing.md,
  },
  skillBox: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.md,
  },
  skillBoxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  skillBoxTag: {
    fontFamily: font.mono,
    fontSize: 10,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: colors.textFaint,
    width: 64,
  },
  arrowIcon: {
    alignItems: "center",
  },
  selectWrap: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  select: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.elevated,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  selectText: {
    fontFamily: font.bodyMedium,
    fontSize: 13,
    color: colors.textDim,
  },
  noSkill: {
    fontFamily: font.body,
    fontSize: 13,
    color: colors.textFaint,
  },
  durationRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: spacing.md,
  },
  duration: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: "center",
  },
  durationText: {
    fontFamily: font.bodySemi,
    fontSize: 14,
    color: colors.textDim,
  },
  error: {
    fontFamily: font.body,
    fontSize: 13,
    color: colors.danger,
    marginTop: spacing.xs,
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  sentWrap: {
    alignItems: "center",
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  sentIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  sentTitle: {
    fontFamily: font.displayBold,
    fontSize: 22,
    color: colors.text,
  },
  sentText: {
    fontFamily: font.body,
    fontSize: 14,
    color: colors.textDim,
    textAlign: "center",
    lineHeight: 21,
    marginBottom: spacing.sm,
  },
});