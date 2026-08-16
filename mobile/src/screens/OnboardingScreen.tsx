import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from "react-native-reanimated";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { Screen, Label } from "../components/Screen";
import { LavaLampBackground } from "../components/LavaLampBackground";
import { Button } from "../components/Button";
import { Field } from "../components/Field";
import { get, post, patch } from "../api";
import { useAuth } from "../context/AuthContext";
import { colors, font, radius, spacing } from "../theme";
import type { RootStackParamList } from "../navigation";
import type { Skill, UserSkill } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "Onboarding">;

const LEVELS = ["beginner", "intermediate", "advanced"];
const CATEGORIES = ["technical", "creative", "language", "sports"] as const;

interface Picked {
  skill: Skill;
  level: string;
}

export function OnboardingScreen({ navigation }: Props) {
  const { refreshMe, user } = useAuth();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [offered, setOffered] = useState<Picked[]>([]);
  const [wanted, setWanted] = useState<Picked[]>([]);
  const [availability, setAvailability] = useState(user?.availability ?? "");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [section, setSection] = useState<"offered" | "wanted">("offered");
  const [saving, setSaving] = useState(false);

  const headerOpacity = useSharedValue(0);
  const headerY = useSharedValue(30);
  const bodyOpacity = useSharedValue(0);
  const bodyY = useSharedValue(60);

  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 450 });
    headerY.value = withTiming(0, { duration: 450 });
    bodyOpacity.value = withDelay(250, withTiming(1, { duration: 500 }));
    bodyY.value = withDelay(250, withTiming(0, { duration: 500 }));
  }, []);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerY.value }],
  }));
  const bodyStyle = useAnimatedStyle(() => ({
    opacity: bodyOpacity.value,
    transform: [{ translateY: bodyY.value }],
  }));

  useEffect(() => {
    get<Skill[]>("/skills").then(setSkills).catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return skills.filter(
      (s) =>
        (!category || s.category === category) &&
        (!q || s.name.toLowerCase().includes(q)) &&
        !offered.some((o) => o.skill.id === s.id) &&
        !wanted.some((w) => w.skill.id === s.id)
    );
  }, [skills, search, category, offered, wanted]);

  const pickedList = section === "offered" ? offered : wanted;

  const addSkill = (skill: Skill) => {
    const entry = { skill, level: "beginner" };
    if (section === "offered") setOffered((p) => [...p, entry]);
    else setWanted((p) => [...p, entry]);
    setSearch("");
  };

  const removeSkill = (skillId: number) => {
    if (section === "offered") setOffered((p) => p.filter((o) => o.skill.id !== skillId));
    else setWanted((p) => p.filter((o) => o.skill.id !== skillId));
  };

  const setLevel = (skillId: number, level: string) => {
    const upd = (p: Picked[]) => p.map((x) => (x.skill.id === skillId ? { ...x, level } : x));
    if (section === "offered") setOffered(upd);
    else setWanted(upd);
  };

  const limit = section === "offered" ? offered.length : wanted.length;
  const canAdd = limit < 5;

  const save = async () => {
    setSaving(true);
    try {
      await patch("/auth/me", { availability });
      const existing = user?.offers ?? [];
      for (const o of offered) {
        await post("/me/skills", { direction: "offered", skill_id: o.skill.id, proficiency_level: o.level });
      }
      for (const w of wanted) {
        await post("/me/skills", { direction: "wanted", skill_id: w.skill.id, proficiency_level: w.level });
      }
      await refreshMe();
      navigation.replace("Main");
    } catch (e: any) {
      console.log(e.message);
    } finally {
      setSaving(false);
    }
  };

  const ready = offered.length >= 1 && wanted.length >= 1;

  return (
    <Screen>
      <LavaLampBackground>
      <Animated.View style={[styles.header, headerStyle]}>
        <Text style={styles.title}>Set up your swap</Text>
        <Text style={styles.subtitle}>What can you teach, and what do you want to learn?</Text>
      </Animated.View>

      <Animated.View style={[styles.body, bodyStyle]}>
      <View style={styles.sectionSwitch}>
        {(["offered", "wanted"] as const).map((s) => (
          <Pressable
            key={s}
            onPress={() => setSection(s)}
            style={[styles.switchItem, section === s && styles.switchActive]}
          >
            <Text style={[styles.switchText, section === s && styles.switchTextActive]}>
              {s === "offered" ? `I can teach (${offered.length}/5)` : `I want to learn (${wanted.length}/5)`}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.searchRow}>
        <Ionicons name="search" size={16} color={colors.textFaint} />
        <TextInput
          style={styles.searchInput}
          placeholder={section === "offered" ? "Search skills you can teach..." : "Search skills you want..."}
          placeholderTextColor={colors.textFaint}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cats}>
        <Pressable
          onPress={() => setCategory(null)}
          style={[styles.cat, category === null && styles.catActive]}
        >
          <Text style={[styles.catText, category === null && styles.catTextActive]}>All</Text>
        </Pressable>
        {CATEGORIES.map((c) => (
          <Pressable
            key={c}
            onPress={() => setCategory(category === c ? null : c)}
            style={[styles.cat, category === c && styles.catActive]}
          >
            <Text style={[styles.catText, category === c && styles.catTextActive]}>{c}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {pickedList.length > 0 && (
        <View style={styles.pickedWrap}>
          <Label>Added</Label>
          <View style={styles.pickedRow}>
            {pickedList.map((p) => (
              <View key={p.skill.id} style={styles.picked}>
                <Text style={styles.pickedName}>{p.skill.name}</Text>
                <View style={styles.levelRow}>
                  {LEVELS.map((l) => (
                    <Pressable key={l} onPress={() => setLevel(p.skill.id, l)}>
                      <Text
                        style={[
                          styles.level,
                          p.level === l && { color: colors.accent, borderColor: colors.accentDim },
                        ]}
                      >
                        {l[0].toUpperCase()}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                <Pressable onPress={() => removeSkill(p.skill.id)}>
                  <Ionicons name="close" size={16} color={colors.textFaint} />
                </Pressable>
              </View>
            ))}
          </View>
        </View>
      )}

      {canAdd && (
        <FlatList
          data={filtered}
          keyExtractor={(s) => String(s.id)}
          style={styles.list}
          contentContainerStyle={{ paddingBottom: 12 }}
          ListHeaderComponent={
            <Text style={styles.suggest}>Suggestions — tap to add</Text>
          }
          renderItem={({ item }) => (
            <Pressable style={styles.skillRow} onPress={() => addSkill(item)}>
              <View style={[styles.catDot, { backgroundColor: colors.textFaint }]} />
              <Text style={styles.skillName}>{item.name}</Text>
              <Ionicons name="add-circle" size={22} color={colors.accent} />
            </Pressable>
          )}
          ListEmptyComponent={
            <Text style={styles.noResults}>
              {offered.length + wanted.length >= skills.length ? "You've added all the skills!" : "No matches"}
            </Text>
          }
        />
      )}

      {!canAdd && (
        <Text style={styles.maxed}>You've reached the max of 5 — nice and focused.</Text>
      )}

      <View style={styles.availabilityWrap}>
        <Field
          label="Availability"
          placeholder="e.g. Mon/Wed/Fri evenings"
          value={availability}
          onChangeText={setAvailability}
        />
      </View>

      <View style={styles.buttonsWrap}>
        <Button label="Save & start swapping" onPress={save} disabled={!ready} loading={saving} />
        <Button label="Skip for now" variant="ghost" onPress={() => navigation.replace("Main")} />
      </View>
      </Animated.View>
      </LavaLampBackground>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    gap: 4,
  },
  body: {
    flex: 1,
  },
  title: {
    fontFamily: font.displayBold,
    fontSize: 28,
    letterSpacing: -0.8,
    color: colors.text,
  },
  subtitle: {
    fontFamily: font.body,
    fontSize: 14,
    color: colors.textDim,
    lineHeight: 20,
  },
  sectionSwitch: {
    flexDirection: "row",
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: spacing.md,
  },
  switchItem: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radius.sm,
    alignItems: "center",
  },
  switchActive: {
    backgroundColor: colors.elevated,
  },
  switchText: {
    fontFamily: font.bodyMedium,
    fontSize: 13,
    color: colors.textDim,
  },
  switchTextActive: {
    color: colors.text,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontFamily: font.body,
    fontSize: 15,
    color: colors.text,
  },
  cats: {
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
    flexGrow: 0,
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
  pickedWrap: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },
  pickedRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: spacing.sm,
  },
  picked: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(205,255,87,0.08)",
    borderWidth: 1,
    borderColor: "rgba(205,255,87,0.25)",
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  pickedName: {
    fontFamily: font.bodySemi,
    fontSize: 13,
    color: colors.text,
  },
  levelRow: {
    flexDirection: "row",
    gap: 4,
  },
  level: {
    fontFamily: font.bodyMedium,
    fontSize: 11,
    color: colors.textDim,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  list: {
    marginHorizontal: spacing.lg,
    flexGrow: 0,
    maxHeight: 220,
  },
  suggest: {
    fontFamily: font.mono,
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: colors.textFaint,
    marginBottom: 6,
  },
  skillRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 11,
    marginBottom: 6,
  },
  catDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 10,
  },
  skillName: {
    flex: 1,
    fontFamily: font.body,
    fontSize: 15,
    color: colors.text,
  },
  noResults: {
    fontFamily: font.body,
    fontSize: 14,
    color: colors.textFaint,
    textAlign: "center",
    paddingVertical: 20,
  },
  maxed: {
    fontFamily: font.body,
    fontSize: 13,
    color: colors.accent,
    textAlign: "center",
    marginVertical: spacing.sm,
  },
  availabilityWrap: {
    marginHorizontal: spacing.lg,
  },
  buttonsWrap: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
});