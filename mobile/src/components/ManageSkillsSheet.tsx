import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Sheet } from "./Sheet";
import { Field } from "./Field";
import { SkillTag } from "./SkillTag";
import { get, post, del } from "../api";
import { useAuth } from "../context/AuthContext";
import { colors, font, radius, spacing } from "../theme";
import type { Skill, UserSkill } from "../types";

const LEVELS = ["beginner", "intermediate", "advanced"] as const;
const CATEGORIES = ["technical", "creative", "language", "sports"] as const;

export function ManageSkillsSheet({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { user, refreshMe } = useAuth();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [section, setSection] = useState<"offered" | "wanted">("offered");
  const [level, setLevel] = useState<(typeof LEVELS)[number]>("intermediate");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!visible) return;
    get<Skill[]>("/skills").then(setSkills).catch(() => {});
  }, [visible]);

  const addedIds = useMemo(() => {
    const ids = new Set<number>();
    user?.offers.forEach((o) => ids.add(o.skill_id));
    user?.wants.forEach((w) => ids.add(w.skill_id));
    return ids;
  }, [user]);

  const available = useMemo(() => {
    const q = search.trim().toLowerCase();
    return skills.filter(
      (s) =>
        !addedIds.has(s.id) &&
        (!category || s.category === category) &&
        (!q || s.name.toLowerCase().includes(q))
    );
  }, [skills, addedIds, search, category]);

  const remove = async (id: string, name: string) => {
    setPending(name);
    setError("");
    try {
      await del(`/me/skills/${id}`);
      await refreshMe();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setPending(null);
    }
  };

  const add = async (skill: Skill) => {
    setPending(skill.name);
    setError("");
    try {
      await post<UserSkill>("/me/skills", {
        direction: section,
        skill_id: skill.id,
        proficiency_level: level,
      });
      await refreshMe();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setPending(null);
    }
  };

  const renderChips = (items: { id: string; name: string }[], accent: boolean) =>
    items.length === 0 ? (
      <Text style={styles.emptyHint}>Nothing yet — add one below.</Text>
    ) : (
      <View style={styles.chipRow}>
        {items.map((item) => (
          <View key={item.id} style={styles.chip}>
            <SkillTag name={item.name} category="technical" accent={accent} />
            <Pressable
              hitSlop={8}
              disabled={pending !== null}
              onPress={() => remove(item.id, item.name)}
            >
              {pending === item.name ? (
                <ActivityIndicator size="small" color={colors.textFaint} />
              ) : (
                <Ionicons name="close-circle" size={18} color={colors.textFaint} />
              )}
            </Pressable>
          </View>
        ))}
      </View>
    );

  return (
    <Sheet visible={visible} onClose={onClose}>
      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Manage skills</Text>

        <Text style={styles.sectionLabel}>You can teach ({user?.offers.length ?? 0})</Text>
        {renderChips(user?.offers ?? [], true)}

        <Text style={styles.sectionLabel}>You want to learn ({user?.wants.length ?? 0})</Text>
        {renderChips(user?.wants ?? [], false)}

        <View style={styles.divider} />

        <Text style={styles.sectionLabel}>Add a skill</Text>
        <View style={styles.switch}>
          {(["offered", "wanted"] as const).map((s) => (
            <Pressable
              key={s}
              onPress={() => setSection(s)}
              style={[styles.switchItem, section === s && styles.switchActive]}
            >
              <Text style={[styles.switchText, section === s && styles.switchTextActive]}>
                {s === "offered" ? "I can teach" : "I want to learn"}
              </Text>
            </Pressable>
          ))}
        </View>

        {section === "offered" && (
          <View style={styles.levelRow}>
            {LEVELS.map((l) => (
              <Pressable
                key={l}
                onPress={() => setLevel(l)}
                style={[styles.level, level === l && { borderColor: colors.accent }]}
              >
                <Text style={[styles.levelText, level === l && { color: colors.accent }]}>
                  {l[0].toUpperCase()} · {l}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        <Field
          placeholder="Search skills..."
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
          style={{ marginBottom: spacing.sm }}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ flexGrow: 0, marginBottom: spacing.sm }}
        >
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

        <View style={styles.skillList}>
          {available.map((s) => (
            <Pressable
              key={s.id}
              style={styles.skillRow}
              disabled={pending !== null}
              onPress={() => add(s)}
            >
              <Text style={styles.skillName}>{s.name}</Text>
              <Text style={styles.skillCat}>{s.category}</Text>
              {pending === s.name ? (
                <ActivityIndicator size="small" color={colors.accent} />
              ) : (
                <Ionicons name="add-circle" size={22} color={colors.accent} />
              )}
            </Pressable>
          ))}
          {available.length === 0 && (
            <Text style={styles.noResults}>No more skills to add here.</Text>
          )}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: font.displayBold,
    fontSize: 22,
    color: colors.text,
    marginBottom: spacing.md,
  },
  sectionLabel: {
    fontFamily: font.mono,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: colors.textFaint,
    marginTop: spacing.sm,
    marginBottom: 8,
  },
  emptyHint: {
    fontFamily: font.body,
    fontSize: 13,
    color: colors.textFaint,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: spacing.sm,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.elevated,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.pill,
    paddingLeft: 8,
    paddingRight: 6,
    paddingVertical: 4,
  },
  divider: {
    height: 1,
    backgroundColor: colors.cardBorder,
    marginVertical: spacing.md,
  },
  switch: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: spacing.sm,
  },
  switchItem: {
    flex: 1,
    paddingVertical: 9,
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
  levelRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: spacing.sm,
  },
  level: {
    flex: 1,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.md,
    paddingVertical: 8,
    backgroundColor: colors.card,
  },
  levelText: {
    fontFamily: font.bodyMedium,
    fontSize: 12,
    color: colors.textDim,
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
  skillList: {
    maxHeight: 240,
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
    gap: 8,
  },
  skillName: {
    flex: 1,
    fontFamily: font.body,
    fontSize: 15,
    color: colors.text,
  },
  skillCat: {
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
    paddingVertical: 16,
  },
  error: {
    fontFamily: font.body,
    fontSize: 13,
    color: colors.danger,
    marginTop: spacing.xs,
  },
});
