import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { useRef, useState } from 'react'
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import SplitText from '@/components/SplitText'
import { GradientButton, GhostButton, Chip } from '@/components/ui'
import { colors } from '@/theme'
import { CATEGORIES, SKILLS, TIME_SLOTS } from '@/data/mock'

const SCREEN_W = Dimensions.get('window').width

export default function Onboarding() {
  const router = useRouter()
  const pagerRef = useRef<ScrollView>(null)
  const [index, setIndex] = useState(0)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [teach, setTeach] = useState<string[]>([])
  const [want, setWant] = useState<string[]>([])
  const [slots, setSlots] = useState<string[]>([])
  const [activeCat, setActiveCat] = useState('Technical')

  const canNext =
    index === 0 ? name.trim().length > 1 && /.+@.+\.(edu|ac\.in|in|com)$/i.test(email)
    : index === 1 ? teach.length >= 2 && teach.length <= 5
    : index === 2 ? want.length >= 2 && want.length <= 5
    : slots.length >= 1

  const toggle = (arr: string[], set: (v: string[]) => void, v: string) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : arr.length < 5 ? [...arr, v] : arr)

  const goTo = (i: number) => {
    const next = Math.max(0, Math.min(3, i))
    pagerRef.current?.scrollTo({ x: next * SCREEN_W, animated: true })
    setIndex(next)
  }

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIndex(Math.round(e.nativeEvent.contentOffset.x / SCREEN_W))
  }

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient colors={['#000', '#000']} style={StyleSheet.absoluteFill} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <View style={styles.brand}>
            <LinearGradient colors={[colors.orange, colors.coral]} style={styles.logo}>
              <Text style={styles.logoText}>S</Text>
            </LinearGradient>
            <Text style={styles.brandText}>SkillSwap</Text>
          </View>
          <View style={styles.steps}>
            {[0, 1, 2, 3].map((i) => (
              <View key={i} style={[styles.stepDot, i <= index && styles.stepDotActive]} />
            ))}
          </View>
        </View>

        <ScrollView
          ref={pagerRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onMomentumEnd}
          scrollEventThrottle={16}
          style={styles.pager}
        >
          <Page index={0} active={index === 0}>
            <SplitText text="Trade skills." style={styles.title} play={index === 0} />
            <Text style={styles.subtitle}>Swap what you teach for what you want to learn — no money, just talent.</Text>
            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Full name</Text>
              <TextInput value={name} onChangeText={setName} placeholder="Arjun Desai" placeholderTextColor={colors.white30} style={styles.input} />
            </View>
            <View style={styles.fieldWrap}>
              <Text style={styles.label}>College email</Text>
              <TextInput value={email} onChangeText={setEmail} placeholder="arjun@college.edu" placeholderTextColor={colors.white30} autoCapitalize="none" keyboardType="email-address" style={styles.input} />
            </View>
            <Text style={styles.hint}>Only verified campus emails can join. Domain-checked, just like POP UPI secures payments.</Text>
          </Page>

          <Page index={1} active={index === 1}>
            <SplitText text="What can you teach?" style={styles.title} play={index === 1} />
            <Text style={styles.subtitle}>
              Pick <Text style={styles.hl}>2–5 skills</Text> you're great at. ({teach.length}/5 selected)
            </Text>
            <CatTabs active={activeCat} onChange={setActiveCat} />
            <View style={styles.grid}>
              {SKILLS.filter((s) => s.category === activeCat).map((s) => (
                <SkillTile key={s.id} icon={s.icon} name={s.name} active={teach.includes(s.name)} onPress={() => toggle(teach, setTeach, s.name)} />
              ))}
            </View>
          </Page>

          <Page index={2} active={index === 2}>
            <SplitText text="What do you want to learn?" style={styles.title} play={index === 2} />
            <Text style={styles.subtitle}>
              The AI matches you with people who <Text style={styles.hl}>offer</Text> exactly this. ({want.length}/5 selected)
            </Text>
            <CatTabs active={activeCat} onChange={setActiveCat} />
            <View style={styles.grid}>
              {SKILLS.filter((s) => s.category === activeCat).map((s) => (
                <SkillTile key={s.id} icon={s.icon} name={s.name} active={want.includes(s.name)} onPress={() => toggle(want, setWant, s.name)} />
              ))}
            </View>
          </Page>

          <Page index={3} active={index === 3}>
            <SplitText text="When are you free?" style={styles.title} play={index === 3} />
            <Text style={styles.subtitle}>
              Tap slots you can teach. <Text style={styles.hl}>{slots.length} selected</Text> — checked for overlap & no double-booking.
            </Text>
            <View style={styles.slotGrid}>
              {TIME_SLOTS.map((t) => (
                <Chip key={t} active={slots.includes(t)} onPress={() => toggle(slots, setSlots, t)} style={styles.slotChip}>
                  {t}
                </Chip>
              ))}
            </View>
          </Page>
        </ScrollView>

        <View style={styles.footer}>
          <GradientButton onPress={() => (index === 3 ? router.replace('/(tabs)/discover') : goTo(index + 1))} disabled={!canNext}>
            {index === 3 ? 'Show me my matches ✨' : 'Continue'}
          </GradientButton>
          {index > 0 && (
            <GhostButton onPress={() => goTo(index - 1)} style={styles.backBtn}>← Back</GhostButton>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

function Page({ index, active, children }: { index: number; active: boolean; children: React.ReactNode }) {
  return (
    <View style={[styles.page, { width: SCREEN_W }]}>
      <ScrollView contentContainerStyle={styles.pageBody} showsVerticalScrollIndicator={false} scrollEnabled={active}>
        {children}
      </ScrollView>
    </View>
  )
}

function CatTabs({ active, onChange }: { active: string; onChange: (c: string) => void }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catTabs} contentContainerStyle={styles.catTabsContent}>
      {CATEGORIES.map((c) => (
        <Chip key={c.key} active={active === c.key} onPress={() => onChange(c.key)}>
          {c.icon} {c.key}
        </Chip>
      ))}
    </ScrollView>
  )
}

function SkillTile({ icon, name, active, onPress }: { icon: string; name: string; active: boolean; onPress: () => void }) {
  return (
    <View style={styles.tileWrap}>
      <Pressable onPress={onPress}>
        {({ pressed }) => (
          <LinearGradient
            colors={active ? ['#ff7a1a', '#ff4d5a'] : ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.05)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.tile, active && styles.tileActive, pressed && styles.pressed]}
          >
            <Text style={styles.tileIcon}>{icon}</Text>
            <Text style={[styles.tileText, active && styles.tileTextActive]} numberOfLines={2}>{name}</Text>
            {active && <Text style={styles.tileCheck}>✓</Text>}
          </LinearGradient>
        )}
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logo: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  logoText: { color: '#fff', fontWeight: '900', fontSize: 16 },
  brandText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  steps: { flexDirection: 'row', gap: 4 },
  stepDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.white15 },
  stepDotActive: { width: 24, backgroundColor: colors.orange },
  pager: { flex: 1 },
  page: { flex: 1 },
  pageBody: { paddingHorizontal: 20, paddingBottom: 24 },
  title: { fontSize: 34, fontWeight: '900', color: '#fff', lineHeight: 40 },
  subtitle: { marginTop: 6, fontSize: 15, color: colors.white70, lineHeight: 21 },
  hl: { color: colors.gold, fontWeight: '800' },
  fieldWrap: { marginTop: 18 },
  label: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, color: colors.white50, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: colors.white10,
    backgroundColor: colors.white05,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#fff',
    fontSize: 15,
  },
  hint: { marginTop: 14, fontSize: 12, color: colors.white50, lineHeight: 17 },
  catTabs: { marginTop: 16, flexGrow: 0 },
  catTabsContent: { gap: 8, paddingRight: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 16 },
  tileWrap: { width: '48%' },
  tile: { borderRadius: 16, borderWidth: 1, borderColor: colors.white10, alignItems: 'center', padding: 14 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  tileActive: { borderColor: 'transparent' },
  tileIcon: { fontSize: 22 },
  tileText: { color: '#fff', fontWeight: '700', fontSize: 12, marginTop: 6, textAlign: 'center' },
  tileTextActive: { color: '#fff' },
  tileCheck: { color: colors.gold, fontWeight: '900', position: 'absolute', top: 10, right: 12 },
  slotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 18 },
  slotChip: { paddingHorizontal: 10 },
  footer: { padding: 20, gap: 10 },
  backBtn: { marginTop: 0 },
})