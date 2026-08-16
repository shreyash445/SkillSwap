import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Sheet } from "./Sheet";
import { Button } from "./Button";
import { Field } from "./Field";
import { StarPicker } from "./StarRating";
import { post } from "../api";
import { colors, font, radius, spacing } from "../theme";
import type { Exchange, Rating } from "../types";

export function RateSheet({
  exchange,
  visible,
  onClose,
  onDone,
}: {
  exchange: Exchange;
  visible: boolean;
  onClose: () => void;
  onDone: () => void;
}) {
  const [stars, setStars] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!stars) return setError("Tap a star to rate the swap");
    setSending(true);
    setError("");
    try {
      await post<Rating>(`/exchanges/${exchange.id}/rate`, {
        stars,
        feedback,
      });
      onDone();
      onClose();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <Sheet visible={visible} onClose={onClose}>
      <Text style={styles.title}>How was the swap?</Text>
      <Text style={styles.sub}>
        Rate {exchange.other_user.first_name} for {exchange.skill_wanted_name}
      </Text>

      <View style={styles.pickerWrap}>
        <StarPicker value={stars} onChange={setStars} />
      </View>

      <Field
        label="Feedback (optional)"
        placeholder="What was great about the session?"
        value={feedback}
        onChangeText={setFeedback}
        multiline
        numberOfLines={3}
        maxLength={200}
        style={{ minHeight: 80, textAlignVertical: "top" }}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button label="Submit rating" onPress={submit} loading={sending} />
      <Button label="Cancel" variant="ghost" onPress={onClose} />
    </Sheet>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: font.displayBold,
    fontSize: 24,
    color: colors.text,
    letterSpacing: -0.5,
  },
  sub: {
    fontFamily: font.body,
    fontSize: 14,
    color: colors.textDim,
    marginTop: 4,
    marginBottom: spacing.md,
  },
  pickerWrap: {
    alignItems: "center",
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  error: {
    fontFamily: font.body,
    fontSize: 13,
    color: colors.danger,
    marginBottom: spacing.sm,
  },
});