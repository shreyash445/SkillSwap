import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Screen, Header } from "../components/Screen";
import { Avatar } from "../components/Avatar";
import { SkillTag } from "../components/SkillTag";
import { Stars, RatingPill } from "../components/StarRating";
import { Button } from "../components/Button";
import { Sheet } from "../components/Sheet";
import { Field } from "../components/Field";
import { ManageSkillsSheet } from "../components/ManageSkillsSheet";
import { useAuth } from "../context/AuthContext";
import { colors, font, radius, spacing } from "../theme";
import type { TabScreenProps } from "../navigation";

type Props = TabScreenProps<"Profile">;

export function ProfileScreen({ navigation }: Props) {
  const { user, logout, updateMe } = useAuth();
  const [editOpen, setEditOpen] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const [bio, setBio] = useState(user?.bio ?? "");
  const [availability, setAvailability] = useState(user?.availability ?? "");
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  const hasSkills = user.offers.length > 0 || user.wants.length > 0;

  const save = async () => {
    setSaving(true);
    await updateMe({ bio, availability });
    setSaving(false);
    setEditOpen(false);
  };

  return (
    <Screen>
      <Header title="Profile" right={<Text style={styles.email}>{user.email}</Text>} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Avatar initials={user.initials} color={user.avatar_color} size={84} />
          <Text style={styles.name}>{user.full_name}</Text>
          <RatingPill rating={user.avg_rating} count={user.rating_count} />
          {user.bio ? <Text style={styles.bio}>{user.bio}</Text> : null}
          {user.availability ? (
            <View style={styles.availRow}>
              <Ionicons name="time-outline" size={13} color={colors.textFaint} />
              <Text style={styles.avail}>{user.availability}</Text>
            </View>
          ) : null}
          <Button label="Edit profile" variant="secondary" onPress={() => setEditOpen(true)} />
          {hasSkills && (
            <Button label="Manage skills" variant="ghost" onPress={() => setManageOpen(true)} />
          )}
        </View>

        {!hasSkills && (
          <View style={styles.prompt}>
            <Text style={styles.promptTitle}>Your profile is empty</Text>
            <Text style={styles.promptText}>Add skills you can teach and want to learn to start matching.</Text>
            <Button label="Add skills" onPress={() => navigation.navigate("Onboarding")} />
          </View>
        )}

        {hasSkills && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>You can teach ({user.offers.length})</Text>
              <View style={styles.tagRow}>
                {user.offers.map((o) => (
                  <SkillTag key={o.skill_id} name={`${o.name} · ${o.level}`} category="technical" accent />
                ))}
              </View>
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>You want to learn ({user.wants.length})</Text>
              <View style={styles.tagRow}>
                {user.wants.map((w) => (
                  <SkillTag key={w.skill_id} name={w.name} />
                ))}
              </View>
            </View>
          </>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your ratings</Text>
          {user.rating_count > 0 ? (
            <View style={styles.ratingsSummary}>
              <Stars value={user.avg_rating} size={16} />
              <Text style={styles.ratingsText}>
                {user.avg_rating.toFixed(1)} average from {user.rating_count} rating{user.rating_count === 1 ? "" : "s"}
              </Text>
            </View>
          ) : (
            <Text style={styles.noRatings}>No ratings yet — complete a swap to earn your first stars.</Text>
          )}
        </View>

        <Pressable style={styles.logout} onPress={logout}>
          <Ionicons name="log-out-outline" size={17} color={colors.danger} />
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>
      </ScrollView>

      <Sheet visible={editOpen} onClose={() => setEditOpen(false)}>
        <Text style={styles.editTitle}>Edit profile</Text>
        <Field
          label="Bio"
          placeholder="What should people know about you?"
          value={bio}
          onChangeText={setBio}
          multiline
          numberOfLines={3}
          maxLength={150}
          style={{ minHeight: 80, textAlignVertical: "top" }}
        />
        <Field
          label="Availability"
          placeholder="e.g. Mon/Wed/Fri evenings"
          value={availability}
          onChangeText={setAvailability}
        />
        <Button label="Save changes" onPress={save} loading={saving} />
      </Sheet>

      <ManageSkillsSheet visible={manageOpen} onClose={() => setManageOpen(false)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  email: {
    fontFamily: font.body,
    fontSize: 13,
    color: colors.textFaint,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  hero: {
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  name: {
    fontFamily: font.displayBold,
    fontSize: 26,
    color: colors.text,
    letterSpacing: -0.7,
  },
  bio: {
    fontFamily: font.body,
    fontSize: 14,
    color: colors.textDim,
    textAlign: "center",
    lineHeight: 21,
  },
  availRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  avail: {
    fontFamily: font.body,
    fontSize: 13,
    color: colors.textFaint,
  },
  prompt: {
    backgroundColor: "rgba(205,255,87,0.06)",
    borderWidth: 1,
    borderColor: "rgba(205,255,87,0.25)",
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
    alignItems: "center",
  },
  promptTitle: {
    fontFamily: font.display,
    fontSize: 17,
    color: colors.text,
  },
  promptText: {
    fontFamily: font.body,
    fontSize: 13.5,
    color: colors.textDim,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    fontFamily: font.mono,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: colors.textFaint,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  ratingsSummary: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  ratingsText: {
    flex: 1,
    fontFamily: font.body,
    fontSize: 13,
    color: colors.textDim,
  },
  noRatings: {
    fontFamily: font.body,
    fontSize: 13,
    color: colors.textFaint,
    lineHeight: 20,
  },
  logout: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    marginTop: spacing.sm,
  },
  logoutText: {
    fontFamily: font.bodySemi,
    fontSize: 15,
    color: colors.danger,
  },
  editTitle: {
    fontFamily: font.displayBold,
    fontSize: 22,
    color: colors.text,
    marginBottom: spacing.md,
  },
});