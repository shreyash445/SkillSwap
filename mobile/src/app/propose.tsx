import { LinearGradient } from 'expo-linear-gradient'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useState } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Avatar, Card, Chip, SkillPill, GradientButton, GhostButton } from '@/components/ui'
import SplitText from '@/components/SplitText'
import FadeIn from '@/components/FadeIn'
import CountUp from '@/components/CountUp'
import { colors } from '@/theme'
import { MATCHES, TIME_SLOTS, MY_PROFILE } from '@/data/mock'

export default function Propose() {
  const { matchId } = useLocalSearchParams<{ matchId: string }>()
  const router = useRouter()
  const match = MATCHES.find((m) => m.user.id === Number(matchId)) ?? MATCHES[0]
  const u = match.user

  const [slot, setSlot] = useState<string | null>(null)
  const [duration, setDuration] = useState(60)
  const [sent, setSent] = useState(false)

  const theirSlots = new Set(u.availability)
  const myOffers = MY_PROFILE.offers
  const theirOffers = u.offers.filter((o) => MY_PROFILE.wants.includes(o))

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.back} onPress={() => router.back()}>← Back to matches</Text>
        <SplitText text="Propose an exchange" style={styles.title} />

        <Card style={styles.card}>
          <View style={styles.userRow}>
            <Avatar initials={u.initials} gradient={u.gradient} size={48} />
            <View style={{ flex: 1 }}>
              <Text style={styles.userName}>{u.name}</Text>
              <Text style={styles.userCollege}>{u.college}</Text>
            </View>
            <View style={styles.trustPill}>
              <Text style={styles.trustPillText}>🛡️ <CountUp to={u.trustScore} decimals={1} fontSize={12} /></Text>
            </View>
          </View>

          <View style={styles.swapBox}>
            <Text style={styles.swapLabel}>THE SWAP</Text>
            <View style={styles.swapRow}>
              <Text style={[styles.sideLabel, { color: colors.emerald }]}>YOU TEACH</Text>
              <View style={styles.skillPills}>
                {myOffers.map((s) => <SkillPill key={s} name={s} color={colors.emerald} />)}
              </View>
            </View>
            <View style={styles.swapDivider}>
              <View style={styles.dividerLine} />
              <Text style={styles.swapArrow}>⇄</Text>
              <View style={styles.dividerLine} />
            </View>
            <View style={styles.swapRow}>
              <Text style={[styles.sideLabel, { color: colors.sky }]}>YOU LEARN</Text>
              <View style={styles.skillPills}>
                {theirOffers.map((s) => <SkillPill key={s} name={s} color={colors.sky} />)}
              </View>
            </View>
          </View>
        </Card>

        {!sent ? (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>📅 Pick a time slot</Text>
              <Text style={styles.sectionMeta}>✓ overlaps {theirSlots.size} slots</Text>
            </View>
            <View style={styles.slotGrid}>
              {TIME_SLOTS.map((t) => {
                const overlap = theirSlots.has(t)
                return (
                  <Chip key={t} active={slot === t} onPress={() => setSlot(t)} style={overlap && !slot ? styles.overlapChip : undefined}>
                    {t}{overlap ? ' ●' : ''}
                  </Chip>
                )
              })}
            </View>

            <Text style={styles.sectionTitle}>⏱ Duration</Text>
            <View style={styles.durationRow}>
              {[45, 60, 90, 120].map((d) => (
                <Chip key={d} active={duration === d} onPress={() => setDuration(d)} style={styles.durationChip}>
                  {d} min
                </Chip>
              ))}
            </View>

            <View style={styles.footer}>
              <GradientButton onPress={() => setSent(true)} disabled={!slot}>
                Send proposal to {u.name.split(' ')[0]} 🚀
              </GradientButton>
              <Text style={styles.footerHint}>Proposals auto-expire after 7 days without a reply. No double-booking, ever.</Text>
            </View>
          </>
        ) : (
          <FadeIn distance={24}>
            <View style={styles.success}>
              <LinearGradient colors={['#34d399', '#14b8a6']} style={styles.successIcon}>
                <Text style={styles.successIconText}>✓</Text>
              </LinearGradient>
              <Text style={styles.successTitle}>Proposal sent!</Text>
              <Text style={styles.successText}>
                {u.name} will get a notification for {slot} · {duration} min.
              </Text>
              <View style={styles.successActions}>
                <GradientButton small style={{ flex: 1 }} onPress={() => router.push('/chat')}>Say hi first 💬</GradientButton>
                <GhostButton small style={{ paddingHorizontal: 20 }} onPress={() => router.back()}>Done</GhostButton>
              </View>
            </View>
          </FadeIn>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  body: { padding: 20, paddingBottom: 32 },
  back: { color: colors.white50, fontSize: 12, fontWeight: '700', marginBottom: 12 },
  title: { fontSize: 30, fontWeight: '900', color: '#fff', marginBottom: 16 },
  card: { padding: 16, gap: 14 },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  userName: { color: '#fff', fontWeight: '800', fontSize: 16 },
  userCollege: { color: colors.white50, fontSize: 11 },
  trustPill: { borderRadius: 999, backgroundColor: colors.white10, paddingHorizontal: 10, paddingVertical: 4 },
  trustPillText: { color: colors.white70, fontWeight: '800', fontSize: 11 },
  swapBox: { borderRadius: 16, borderWidth: 1, borderColor: colors.white10, backgroundColor: 'rgba(52,211,153,0.06)', padding: 12, gap: 8 },
  swapLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 1.5, color: colors.white40 },
  swapRow: { gap: 6 },
  sideLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  skillPills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  swapDivider: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 2 },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.white10 },
  swapArrow: { color: colors.orange, fontWeight: '900', fontSize: 14 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 20, marginBottom: 12 },
  sectionTitle: { color: '#fff', fontWeight: '800', fontSize: 15, marginTop: 20, marginBottom: 12 },
  sectionMeta: { color: colors.emerald, fontSize: 10, fontWeight: '700' },
  slotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  overlapChip: { borderColor: 'rgba(52,211,153,0.4)' },
  durationRow: { flexDirection: 'row', gap: 8 },
  durationChip: { flex: 1 },
  footer: { marginTop: 20, gap: 8 },
  footerHint: { color: colors.white40, fontSize: 10, textAlign: 'center' },
  success: { marginTop: 8, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(52,211,153,0.3)', backgroundColor: 'rgba(52,211,153,0.08)', padding: 24, alignItems: 'center', gap: 10 },
  successIcon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  successIconText: { color: '#fff', fontSize: 28, fontWeight: '900' },
  successTitle: { color: '#fff', fontSize: 20, fontWeight: '900' },
  successText: { color: colors.white70, fontSize: 13, textAlign: 'center' },
  successActions: { flexDirection: 'row', gap: 10, marginTop: 10, width: '100%' },
})