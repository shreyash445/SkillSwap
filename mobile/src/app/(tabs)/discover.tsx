import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { useRef, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import SwipeDeck, { SwipeDeckHandle } from '@/components/SwipeDeck'
import { Avatar, SkillPill } from '@/components/ui'
import SplitText from '@/components/SplitText'
import CountUp from '@/components/CountUp'
import { colors } from '@/theme'
import { MATCHES, Match } from '@/data/mock'

const BUTTONS = [
  { dir: -1 as -1, icon: '⛔', label: 'Pass', style: 'ghost' },
  { dir: 1 as 1, icon: '🤝', label: 'Propose', style: 'primary' },
]

export default function Discover() {
  const router = useRouter()
  const deckRef = useRef<SwipeDeckHandle>(null)
  const [feedback, setFeedback] = useState('')

  const onRight = (m: Match) => {
    if (!m?.matchScore) return
    setFeedback(`🎉 Match ${m.matchScore}% — ${m.user.name.split(' ')[0]} was notified!`)
    setTimeout(() => setFeedback(''), 2600)
  }
  const onLeft = (m: Match) => {
    if (!m?.user) return
    setFeedback(`⛔ Passed on ${m.user.name.split(' ')[0]}`)
    setTimeout(() => setFeedback(''), 1800)
  }
  const onFinished = () => setFeedback('✨ That\'s everyone! Restart to re-swipe.')

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>AI MATCH ENGINE · TF-IDF + COSINE</Text>
        <SplitText text="Swipe your matches" style={styles.title} />
        <Text style={styles.subtitle}>🔄 Right to like · left to pass · trust-weighted</Text>
      </View>

      <View style={styles.deckWrap}>
        <SwipeDeck
          ref={deckRef}
          data={MATCHES}
          onSwipeLeft={onLeft}
          onSwipeRight={onRight}
          onFinished={onFinished}
          style={styles.deck}
          emptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyIcon}>🏁</Text>
              <Text style={styles.emptyTitle}>You've seen all matches</Text>
              <Text style={styles.emptySub}>Restart the deck or check your proposals.</Text>
              <Pressable style={styles.emptyBtn} onPress={() => deckRef.current?.reset()}>
                <Text style={styles.emptyBtnText}>↻ Restart deck</Text>
              </Pressable>
            </View>
          }
          renderCard={(m) => {
            const u = m.user
            return (
              <View style={styles.card}>
                <LinearGradient
                  colors={[u.gradient[0] + '33', 'transparent']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.banner}
                >
                  <Avatar initials={u.initials} gradient={u.gradient} size={78} ring />
                  <View style={styles.idRow}>
                    <Text style={styles.userName}>{u.name}</Text>
                    <Text style={styles.college}>{u.college}</Text>
                  </View>
                  <View style={styles.matchPill}>
                    <Text style={styles.matchPillText}>MATCH</Text>
                    <Text style={styles.matchPillScore}>{m.matchScore}%</Text>
                  </View>
                </LinearGradient>

                <View style={styles.body}>
                  <View style={styles.badgeRow}>
                    <LinearGradient colors={[colors.orange, colors.coral]} style={styles.trustBadge}>
                      <Text style={styles.trustBadgeText}>🛡️ Trust <CountUp to={u.trustScore} decimals={1} fontSize={11} /></Text>
                    </LinearGradient>
                    <View style={styles.countBadge}>
                      <Text style={styles.countBadgeText}>✓ {u.completedExchanges} exchanges</Text>
                    </View>
                  </View>

                  <View style={styles.skillBlock}>
                    <Text style={[styles.skillHeader, { color: colors.emerald }]}>📤 OFFERS</Text>
                    <View style={styles.pills}>
                      {u.offers.map((s) => <SkillPill key={s} name={s} color={colors.emerald} />)}
                    </View>
                  </View>

                  <View style={styles.skillBlock}>
                    <Text style={[styles.skillHeader, { color: colors.sky }]}>📥 WANTS</Text>
                    <View style={styles.pills}>
                      {u.wants.map((s) => <SkillPill key={s} name={s} color={colors.sky} />)}
                    </View>
                  </View>

                  <View style={styles.reasonBox}>
                    <Text style={styles.reasonText}>
                      <Text style={styles.reasonBold}>Why: </Text>
                      {m.reason}
                    </Text>
                  </View>

                  <View style={styles.quickActions}>
                    <Pressable
                      style={styles.quickBtn}
                      onPress={() => router.push({ pathname: '/chat', params: { userId: String(u.id) } })}
                    >
                      <Text style={styles.quickBtnText}>💬 Chat</Text>
                    </Pressable>
                    <Pressable
                      style={styles.quickBtn}
                      onPress={() => router.push({ pathname: '/propose', params: { matchId: String(u.id) } })}
                    >
                      <Text style={styles.quickBtnText}>📅 Propose</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            )
          }}
        />
      </View>

      {feedback !== '' && (
        <View style={styles.feedbackBar}>
          <Text style={styles.feedbackText}>{feedback}</Text>
        </View>
      )}

      <View style={styles.actionRow}>
        {BUTTONS.map((b) => (
          <Pressable
            key={b.label}
            style={[styles.actionBtn, b.style === 'primary' ? styles.actionPrimary : undefined]}
            onPress={() => deckRef.current?.swipe(b.dir)}
          >
            <Text style={[styles.actionIcon, b.style === 'primary' && styles.actionIconPrimary]}>
              {b.icon}
            </Text>
            <Text style={[styles.actionLabel, b.style === 'primary' && styles.actionLabelPrimary]}>{b.label}</Text>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: 20, paddingTop: 12 },
  eyebrow: { fontSize: 11, fontWeight: '800', letterSpacing: 2, color: colors.gold, textTransform: 'uppercase' },
  title: { fontSize: 30, fontWeight: '900', color: '#fff', lineHeight: 36 },
  subtitle: { fontSize: 12, color: colors.white50, marginTop: 2 },

  deckWrap: { flex: 1, paddingHorizontal: 20, paddingTop: 16 },
  deck: {},

  card: { flex: 1 },
  banner: {
    paddingTop: 28,
    paddingBottom: 18,
    alignItems: 'center',
    gap: 10,
  },
  idRow: { alignItems: 'center', gap: 2 },
  userName: { color: '#fff', fontWeight: '900', fontSize: 24 },
  college: { color: colors.white50, fontSize: 12 },
  matchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,201,60,0.4)',
    backgroundColor: 'rgba(255,201,60,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  matchPillText: { color: colors.gold, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  matchPillScore: { color: '#fff', fontSize: 14, fontWeight: '900' },

  body: { padding: 16, gap: 10 },
  badgeRow: { flexDirection: 'row', gap: 6 },
  trustBadge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 },
  trustBadgeText: { color: '#fff', fontWeight: '800', fontSize: 10 },
  countBadge: { borderRadius: 999, backgroundColor: colors.white10, paddingHorizontal: 10, paddingVertical: 3 },
  countBadgeText: { color: colors.white70, fontWeight: '700', fontSize: 10 },

  skillBlock: { gap: 5 },
  skillHeader: { fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },

  reasonBox: { borderRadius: 12, backgroundColor: colors.white05, borderWidth: 1, borderColor: colors.white10, padding: 10 },
  reasonText: { fontSize: 12, color: colors.white70, lineHeight: 17 },
  reasonBold: { color: colors.gold, fontWeight: '800' },

  quickActions: { flexDirection: 'row', gap: 8 },
  quickBtn: {
    flex: 1,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.white15,
    backgroundColor: colors.white05,
    paddingVertical: 10,
    alignItems: 'center',
  },
  quickBtnText: { color: '#fff', fontWeight: '700', fontSize: 12 },

  feedbackBar: {
    marginHorizontal: 20,
    marginBottom: 8,
    borderRadius: 14,
    backgroundColor: 'rgba(255,122,26,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,122,26,0.4)',
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  feedbackText: { color: '#fff', fontWeight: '700', fontSize: 12 },

  actionRow: {
    flexDirection: 'row',
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 14,
    paddingBottom: 18,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.white15,
    backgroundColor: colors.white05,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 2,
  },
  actionPrimary: {
    borderColor: 'transparent',
    backgroundColor: colors.orange,
  },
  actionIcon: { fontSize: 22 },
  actionIconPrimary: { fontSize: 24 },
  actionLabel: { color: colors.white70, fontWeight: '700', fontSize: 11 },
  actionLabelPrimary: { color: '#fff', fontWeight: '800', fontSize: 12 },

  emptyBox: { alignItems: 'center', gap: 8, padding: 30 },
  emptyIcon: { fontSize: 40 },
  emptyTitle: { color: '#fff', fontWeight: '900', fontSize: 18 },
  emptySub: { color: colors.white50, fontSize: 12, textAlign: 'center' },
  emptyBtn: {
    marginTop: 8,
    borderRadius: 999,
    backgroundColor: colors.orange,
    paddingHorizontal: 22,
    paddingVertical: 10,
  },
  emptyBtnText: { color: '#fff', fontWeight: '800', fontSize: 13 },
})