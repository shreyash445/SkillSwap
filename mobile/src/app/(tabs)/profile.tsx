import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Avatar, Card, SkillPill } from '@/components/ui'
import SplitText from '@/components/SplitText'
import FadeIn from '@/components/FadeIn'
import CountUp from '@/components/CountUp'
import { colors } from '@/theme'
import { MY_PROFILE, BADGES, REVIEWS } from '@/data/mock'

export default function Profile() {
  const router = useRouter()
  const me = MY_PROFILE

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={['rgba(255,122,26,0.14)', 'transparent']} style={styles.banner}>
          <Avatar initials={me.initials} gradient={me.gradient} size={72} />
          <Text style={styles.name}>{me.name}</Text>
          <Text style={styles.college}>{me.college} · CS Sophomore</Text>
          <View style={styles.statRow}>
            <Stat value={me.trustScore} decimals={1} suffix="★" label="Trust" />
            <Stat value={me.completedExchanges} label="Swaps" />
            <Stat value={me.hoursTaught} label="Hours" />
            <Stat value={me.streak} suffix="🔥" label="Streak" />
          </View>
        </LinearGradient>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>📖 Bio</Text>
          <Text style={styles.bio}>{me.bio}</Text>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>📤 I teach</Text>
          <View style={styles.pillRow}>
            {me.offers.map((s) => <SkillPill key={s} name={s} color={colors.emerald} />)}
          </View>
          <Text style={[styles.cardTitle, { marginTop: 14 }]}>📥 I want to learn</Text>
          <View style={styles.pillRow}>
            {me.wants.map((s) => <SkillPill key={s} name={s} color={colors.sky} />)}
          </View>
        </Card>

        <Text style={styles.sectionTitle}>🏅 Badges</Text>
        <View style={styles.badgeGrid}>
          {BADGES.map((b) => (
            <FadeIn key={b.label} distance={12}>
              <View style={[styles.badgeCard, !b.earned && styles.badgeLocked]}>
                <Text style={styles.badgeIcon}>{b.icon}</Text>
                <Text style={[styles.badgeLabel, !b.earned && styles.badgeLabelLocked]}>{b.label}</Text>
                <Text style={styles.badgeState}>{b.earned ? 'Unlocked' : '🔒 Locked'}</Text>
              </View>
            </FadeIn>
          ))}
        </View>

        <Text style={styles.sectionTitle}>💬 Reviews</Text>
        {REVIEWS.map((r, i) => (
          <FadeIn key={r.from} delay={0.05 * i} distance={16}>
            <Card style={styles.reviewCard}>
              <View style={styles.reviewTop}>
                <Text style={styles.reviewFrom}>{r.from}</Text>
                <Text style={styles.reviewStars}>{'★'.repeat(r.stars)}<Text style={styles.reviewStarsDim}>{'★'.repeat(5 - r.stars)}</Text></Text>
              </View>
              <Text style={styles.reviewText}>"{r.text}"</Text>
              <Text style={styles.reviewWhen}>{r.when}</Text>
            </Card>
          </FadeIn>
        ))}

        <Pressable onPress={() => router.push('/settings')}>
          {({ pressed }) => (
            <Card style={[styles.adminCard, pressed ? { opacity: 0.8 } : undefined]}>
              <Text style={styles.adminIcon}>⚙️</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.adminTitle}>Settings</Text>
                <Text style={styles.adminSub}>Accent color, preferences</Text>
              </View>
              <Text style={styles.adminArrow}>→</Text>
            </Card>
          )}
        </Pressable>

        <Pressable onPress={() => router.push('/admin')}>
          {({ pressed }) => (
            <Card style={[styles.adminCard, pressed ? { opacity: 0.8 } : undefined]}>
              <Text style={styles.adminIcon}>🛠️</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.adminTitle}>Admin console</Text>
                <Text style={styles.adminSub}>Flagged matches, banned users, trust audits</Text>
              </View>
              <Text style={styles.adminArrow}>→</Text>
            </Card>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  )
}

function Stat({ value, label, suffix = '', decimals = 0 }: { value: number; label: string; suffix?: string; decimals?: number }) {
  return (
    <View style={styles.stat}>
      <CountUp to={value} decimals={decimals} fontSize={18} />
      <Text style={styles.statSuffix}>{suffix}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  body: { paddingBottom: 32 },
  banner: { alignItems: 'center', paddingTop: 24, paddingBottom: 20, gap: 8 },
  name: { color: '#fff', fontWeight: '900', fontSize: 22 },
  college: { color: colors.white50, fontSize: 12 },
  statRow: { flexDirection: 'row', gap: 22, marginTop: 12 },
  stat: { alignItems: 'center' },
  statSuffix: { position: 'absolute', right: -12, color: colors.gold, fontWeight: '800', fontSize: 10, top: 2 },
  statLabel: { color: colors.white40, fontSize: 10, fontWeight: '700', marginTop: 2 },
  card: { marginHorizontal: 20, marginTop: 12, padding: 16, gap: 8 },
  cardTitle: { color: colors.white70, fontSize: 11, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
  bio: { color: colors.white50, fontSize: 13, lineHeight: 19 },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  sectionTitle: { color: '#fff', fontWeight: '800', fontSize: 15, marginTop: 22, marginHorizontal: 20, marginBottom: 10 },
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: 20 },
  badgeCard: {
    width: '47%',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,201,60,0.35)',
    backgroundColor: 'rgba(255,201,60,0.08)',
    padding: 14,
    gap: 4,
  },
  badgeLocked: { borderColor: colors.white10, backgroundColor: colors.white05 },
  badgeIcon: { fontSize: 22 },
  badgeLabel: { color: '#fff', fontWeight: '800', fontSize: 13 },
  badgeLabelLocked: { color: colors.white40 },
  badgeState: { fontSize: 10, fontWeight: '700', color: colors.gold },
  reviewCard: { marginHorizontal: 20, marginTop: 0, padding: 14, gap: 6 },
  reviewTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reviewFrom: { color: '#fff', fontWeight: '800', fontSize: 13 },
  reviewStars: { color: colors.gold, fontSize: 12 },
  reviewStarsDim: { color: colors.white15 },
  reviewText: { color: colors.white70, fontSize: 12, lineHeight: 17 },
  reviewWhen: { color: colors.white30, fontSize: 10 },
  adminCard: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 22 },
  adminIcon: { fontSize: 24 },
  adminTitle: { color: '#fff', fontWeight: '800', fontSize: 14 },
  adminSub: { color: colors.white50, fontSize: 11 },
  adminArrow: { color: colors.orange, fontSize: 20, fontWeight: '900' },
})