import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "../components/Screen";
import { Avatar } from "../components/Avatar";
import { SkillTag } from "../components/SkillTag";
import { Stars, RatingPill } from "../components/StarRating";
import { Button } from "../components/Button";
import { ProposeSheet } from "../components/ProposeSheet";
import { get } from "../api";
import { colors, font, spacing } from "../theme";
import type { RootStackParamList } from "../navigation";
import type { Rating, User } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "UserProfile">;

export function UserProfileScreen({ navigation, route }: Props) {
  const [user, setUser] = useState<User>(route.params.user);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [propose, setPropose] = useState(false);

  useEffect(() => {
    get<User>(`/users/${user.id}`)
      .then((u) => {
        setUser(u);
        setRatings(u.recent_ratings ?? []);
      })
      .catch(() => {});
  }, [user.id]);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Avatar initials={user.initials} color={user.avatar_color} size={72} />
          <Text style={styles.name}>{user.full_name}</Text>
          <RatingPill rating={user.avg_rating} count={user.rating_count} />
          {user.bio ? <Text style={styles.bio}>{user.bio}</Text> : null}
          {user.availability ? (
            <View style={styles.availRow}>
              <Ionicons name="time-outline" size={13} color={colors.textFaint} />
              <Text style={styles.avail}>{user.availability}</Text>
            </View>
          ) : null}
          <Button label="Propose an exchange" onPress={() => setPropose(true)} style={{ alignSelf: "stretch" }} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Can teach</Text>
          <View style={styles.tagRow}>
            {user.offers.map((o) => (
              <SkillTag key={o.skill_id} name={o.name} category="technical" accent />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Wants to learn</Text>
          <View style={styles.tagRow}>
            {user.wants.map((w) => (
              <SkillTag key={w.skill_id} name={w.name} />
            ))}
          </View>
        </View>

        {ratings.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ratings</Text>
            <View style={styles.ratingList}>
              {ratings.map((r) => (
                <View key={r.id} style={styles.ratingCard}>
                  <View style={styles.ratingHead}>
                    <Text style={styles.ratingName}>{r.rater_name}</Text>
                    <Stars value={r.stars} size={13} />
                  </View>
                  {r.feedback ? <Text style={styles.ratingFeedback}>"{r.feedback}"</Text> : null}
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      <ProposeSheet user={user} visible={propose} onClose={() => setPropose(false)} onDone={() => setPropose(false)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  hero: {
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  name: {
    fontFamily: font.displayBold,
    fontSize: 26,
    color: colors.text,
    letterSpacing: -0.7,
  },
  bio: {
    fontFamily: font.body,
    fontSize: 14.5,
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
  ratingList: {
    gap: spacing.sm,
  },
  ratingCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 14,
    padding: spacing.md,
    gap: 6,
  },
  ratingHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  ratingName: {
    fontFamily: font.bodySemi,
    fontSize: 14,
    color: colors.text,
  },
  ratingFeedback: {
    fontFamily: font.body,
    fontSize: 13.5,
    color: colors.textDim,
    lineHeight: 20,
  },
});