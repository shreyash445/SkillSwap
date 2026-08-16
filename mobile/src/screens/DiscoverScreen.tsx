import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Screen, Header } from "../components/Screen";
import { Avatar } from "../components/Avatar";
import { SkillTag } from "../components/SkillTag";
import { RatingPill } from "../components/StarRating";
import { EmptyState } from "../components/EmptyState";
import { PerplexityVerticalList } from "../components/PerplexityVerticalList";
import { ProposeSheet } from "../components/ProposeSheet";
import { Sheet } from "../components/Sheet";
import { Field } from "../components/Field";
import { get } from "../api";
import { photoForSkill, FALLBACK_PHOTO } from "../utils/skillPhotos";
import { colors, font, radius, spacing, withAlpha } from "../theme";
import type { TabScreenProps } from "../navigation";
import type { Skill, User } from "../types";

type Props = TabScreenProps<"Discover">;

type Sort = "match" | "recent" | "rating";

export function DiscoverScreen({ navigation }: Props) {
  const [users, setUsers] = useState<User[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [filterSkill, setFilterSkill] = useState<number | null>(null);
  const [direction, setDirection] = useState<"offered" | "wanted" | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sort, setSort] = useState<Sort>("match");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [proposeFor, setProposeFor] = useState<User | null>(null);

  const load = useCallback(async () => {
    try {
      const [u, s] = await Promise.all([
        get<User[]>(`/users?sort=${sort}`),
        get<Skill[]>("/skills"),
      ]);
      setUsers(u);
      setSkills(s);
    } catch {
      /* ignore */
    }
  }, [sort]);

  useEffect(() => {
    load();
  }, [load]);

  const refresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const filtered = users.filter(
    (u) =>
      !filterSkill ||
      (direction === "offered"
        ? u.offers.some((o) => o.skill_id === filterSkill)
        : u.wants.some((w) => w.skill_id === filterSkill))
  );

  const filterSkillName = skills.find((s) => s.id === filterSkill)?.name;

  const renderCard = ({ item, index }: { item: User; index: number }) => {
    const isMatch = (item.match_score ?? 0) >= 50;
    const mainSkill = item.offers[0]?.name ?? item.wants[0]?.name ?? "Learning";
    const [photoOk, setPhotoOk] = React.useState(true);
    return (
      <Pressable
        style={styles.card}
        onPress={() => navigation.navigate("UserProfile", { user: item })}
      >
        <View style={styles.photoWrap}>
          <Image
            source={{ uri: photoOk ? photoForSkill(mainSkill) : FALLBACK_PHOTO }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
            onError={() => setPhotoOk(false)}
          />
          <View style={styles.photoShade} />
          <View style={styles.cardTop}>
            <Avatar initials={item.initials} color={item.avatar_color} size={46} />
            <View style={styles.cardIdentity}>
              <Text style={styles.name}>{item.full_name}</Text>
              <Text style={styles.avail}>
                <Ionicons name="time-outline" size={12} color={colors.textFaint} />{" "}
                {item.availability || "Flexible"}
              </Text>
            </View>
            <RatingPill rating={item.avg_rating} count={item.rating_count} />
          </View>
        </View>

        <View style={styles.skills}>
          <View style={styles.skillGroup}>
            <Text style={styles.groupLabel}>OFFERS</Text>
            <View style={styles.tagWrap}>
              {item.offers.map((o) => (
                <SkillTag key={o.skill_id} name={o.name} category="technical" accent />
              ))}
            </View>
          </View>
          <View style={styles.skillGroup}>
            <Text style={styles.groupLabel}>WANTS</Text>
            <View style={styles.tagWrap}>
              {item.wants.map((w) => (
                <SkillTag key={w.skill_id} name={w.name} />
              ))}
            </View>
          </View>
        </View>

        <View style={styles.cardFooter}>
          {isMatch ? (
            <View style={[styles.matchBadge, { backgroundColor: colors.accent }]}>
              <Ionicons name="flash" size={12} color="#000000" />
              <Text style={styles.matchText}>Complementary match</Text>
            </View>
          ) : (
            <View style={styles.scoreWrap}>
              <Text style={styles.score}>{item.match_score ?? 0}%</Text>
              <Text style={styles.scoreLabel}>match</Text>
            </View>
          )}
          <Pressable
            style={[
              styles.propose,
              {
                backgroundColor: withAlpha(colors.accent, 0.10),
                borderWidth: 1,
                borderColor: withAlpha(colors.accent, 0.35),
              },
            ]}
            onPress={(e) => {
              e.stopPropagation();
              setProposeFor(item);
            }}
          >
            <Text style={[styles.proposeText, { color: colors.accent }]}>Propose exchange</Text>
          </Pressable>
        </View>
      </Pressable>
    );
  };

  return (
    <Screen>
      <Header title="Discover" subtitle={`${filtered.length} people to swap with`} />

      <View style={styles.controls}>
        <View style={styles.sortRow}>
          {(["match", "recent", "rating"] as Sort[]).map((s) => (
            <Pressable
              key={s}
              onPress={() => setSort(s)}
              style={[
                styles.sortPill,
                sort === s && {
                  backgroundColor: colors.accent,
                  borderColor: colors.accent,
                },
              ]}
            >
              <Text
                style={[
                  styles.sortText,
                  sort === s && { color: colors.text },
                ]}
              >
                {s === "match" ? "Best match" : s === "recent" ? "Newest" : "Top rated"}
              </Text>
            </Pressable>
          ))}
        </View>
        <Pressable
          style={[
            styles.filterBtn,
            filterSkill !== null && {
              borderColor: colors.accent,
              backgroundColor: withAlpha(colors.accent, 0.06),
            },
          ]}
          onPress={() => {
            if (filterSkill === null) {
              setFilterOpen(true);
            } else {
              setDirection(direction === "offered" ? "wanted" : "offered");
            }
          }}
        >
          <Ionicons
            name={direction === "wanted" ? "log-in-outline" : "log-out-outline"}
            size={14}
            color={filterSkill !== null ? colors.accent : colors.textDim}
          />
          <Text style={[styles.filterBtnText, filterSkill !== null && { color: colors.accent }]}>
            {filterSkill
              ? `${filterSkillName} (${direction === "offered" ? "offers" : "wants"})`
              : "Filter by skill"}
          </Text>
          {filterSkill !== null && (
            <Pressable
              onPress={() => {
                setFilterSkill(null);
                setDirection(null);
              }}
            >
              <Ionicons name="close-circle" size={16} color={colors.accent} />
            </Pressable>
          )}
        </Pressable>
      </View>

      <PerplexityVerticalList
        data={filtered}
        keyExtractor={(u) => u.id}
        renderItem={renderCard}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.textDim} />
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator color={colors.accent} style={{ marginTop: 60 }} />
          ) : (
            <EmptyState icon="search" title="No matches yet" hint="Try a different filter, or add more skills to your profile." />
          )
        }
      />

      {proposeFor && (
        <ProposeSheet
          user={proposeFor}
          visible={!!proposeFor}
          onClose={() => setProposeFor(null)}
          onDone={() => setProposeFor(null)}
        />
      )}

      <SkillFilterSheet
        visible={filterOpen}
        skills={skills}
        onClose={() => setFilterOpen(false)}
        onSelect={(id) => {
          setFilterSkill(id);
          setDirection(direction ?? "offered");
          setFilterOpen(false);
        }}
      />
    </Screen>
  );
}

function SkillFilterSheet({
  visible,
  skills,
  onClose,
  onSelect,
}: {
  visible: boolean;
  skills: Skill[];
  onClose: () => void;
  onSelect: (skillId: number) => void;
}) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | null>(null);
  const filtered = skills.filter(
    (s) =>
      (!cat || s.category === cat) &&
      (!q.trim() || s.name.toLowerCase().includes(q.trim().toLowerCase()))
  );
  return (
    <Sheet visible={visible} onClose={onClose}>
      <Text style={styles.filterTitle}>Filter by skill</Text>
      <Field
        placeholder="Search skills..."
        value={q}
        onChangeText={setQ}
        autoCapitalize="none"
        style={{ marginBottom: spacing.sm }}
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, marginBottom: 8 }}>
        {["technical", "creative", "language", "sports"].map((c) => (
          <Pressable
            key={c}
            onPress={() => setCat(cat === c ? null : c)}
            style={[styles.cat, cat === c && styles.catActive]}
          >
            <Text style={[styles.catText, cat === c && styles.catTextActive]}>{c}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <ScrollView style={{ maxHeight: 300 }}>
        {filtered.map((s) => (
          <Pressable key={s.id} style={styles.filterRow} onPress={() => onSelect(s.id)}>
            <Text style={styles.filterRowText}>{s.name}</Text>
            <Text style={styles.filterRowCat}>{s.category}</Text>
          </Pressable>
        ))}
        {filtered.length === 0 && <Text style={styles.noResults}>No skills found</Text>}
      </ScrollView>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  filterTitle: {
    fontFamily: font.displayBold,
    fontSize: 22,
    color: colors.text,
    marginBottom: spacing.md,
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  filterRowText: {
    fontFamily: font.body,
    fontSize: 15,
    color: colors.text,
  },
  filterRowCat: {
    fontFamily: font.mono,
    fontSize: 10,
    textTransform: "uppercase",
    color: colors.textFaint,
  },
  noResults: {
    fontFamily: font.body,
    fontSize: 13,
    color: colors.textFaint,
    textAlign: "center",
    paddingVertical: 20,
  },
  cat: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginRight: 8,
  },
  catActive: {
    backgroundColor: colors.elevated,
    borderColor: colors.textFaint,
  },
  catText: {
    fontFamily: font.bodyMedium,
    fontSize: 13,
    color: colors.textDim,
    textTransform: "capitalize",
  },
  catTextActive: {
    color: colors.text,
  },
  controls: {
    gap: spacing.sm,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  sortRow: {
    flexDirection: "row",
    gap: 8,
  },
  sortPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  sortText: {
    fontFamily: font.bodyMedium,
    fontSize: 13,
    color: colors.textDim,
  },
  filterBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  filterBtnText: {
    fontFamily: font.bodyMedium,
    fontSize: 13,
    color: colors.textDim,
  },
  card: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: "hidden",
    gap: spacing.md,
    justifyContent: "space-between",
  },
  photoWrap: {
    flex: 1,
    minHeight: 200,
    overflow: "hidden",
  },
  photoShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
  cardIdentity: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontFamily: font.display,
    fontSize: 17,
    color: colors.text,
    letterSpacing: -0.3,
  },
  avail: {
    fontFamily: font.body,
    fontSize: 12.5,
    color: colors.textDim,
  },
  skills: {
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  skillGroup: {
    gap: 6,
  },
  groupLabel: {
    fontFamily: font.mono,
    fontSize: 10,
    letterSpacing: 1.5,
    color: colors.textFaint,
  },
  tagWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  matchBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  matchText: {
    fontFamily: font.bodySemi,
    fontSize: 12,
    color: "#000000",
  },
  scoreWrap: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  score: {
    fontFamily: font.displayBold,
    fontSize: 16,
    color: colors.text,
  },
  scoreLabel: {
    fontFamily: font.body,
    fontSize: 12,
    color: colors.textFaint,
  },
  propose: {
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  proposeText: {
    fontFamily: font.bodySemi,
    fontSize: 13,
  },
});