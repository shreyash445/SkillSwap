import { useState } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Avatar, Card, Chip } from '@/components/ui'
import SplitText from '@/components/SplitText'
import FadeIn from '@/components/FadeIn'
import CountUp from '@/components/CountUp'
import { colors } from '@/theme'
import { LEADERBOARD, MY_PROFILE } from '@/data/mock'

const FILTERS = ['Trust score', 'Exchanges', 'Hours taught']
const PERIODS = ['This week', 'This month', 'All time']
const BADGE = { Expert: '👑', Trusted: '🎯', Rising: '⭐', Streak: '🔥' }

export default function Leaderboard() {
  const [filter, setFilter] = useState('Trust score')
  const [period, setPeriod] = useState('All time')

  const rows = [...LEADERBOARD].sort((a, b) =>
    filter === 'Exchanges' ? b.user.completedExchanges - a.user.completedExchanges
    : filter === 'Hours taught' ? b.user.hoursTaught - a.user.hoursTaught
    : b.user.trustScore - a.user.trustScore
  )

  const stat = (e: (typeof rows)[number]) =>
    filter === 'Exchanges' ? e.user.completedExchanges : filter === 'Hours taught' ? e.user.hoursTaught : e.user.trustScore

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.titleRow}>
          <SplitText text="Campus leaderboard" style={styles.title} />
          <View style={styles.livePill}><Text style={styles.livePillText}>🏆 LIVE</Text></View>
        </View>
        <Text style={styles.subtitle}>Where teaching gets you famous.</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 14 }}>
          <View style={styles.filterRow}>
            {FILTERS.map((f) => <Chip key={f} active={filter === f} onPress={() => setFilter(f)}>{f}</Chip>)}
          </View>
        </ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterRow}>
            {PERIODS.map((p) => <Chip key={p} active={period === p} onPress={() => setPeriod(p)}>{p}</Chip>)}
          </View>
        </ScrollView>

        <View style={styles.list}>
          {rows.map((e, i) => {
            const isMe = e.user.id === MY_PROFILE.id
            const s = stat(e)
            return (
              <FadeIn key={e.user.id} delay={0.05 * i} distance={20}>
                <View style={[styles.row, isMe && styles.rowMe]}>
                  <Text style={[styles.rank, i === 0 && styles.rankGold, i === 1 && styles.rankSilver, i === 2 && styles.rankBronze]}>
                    #{i + 1}
                  </Text>
                  <Avatar initials={e.user.initials} gradient={e.user.gradient} size={42} />
                  <View style={styles.rowMid}>
                    <Text style={styles.rowName}>
                      {e.user.name} {isMe && <Text style={styles.youTag}>YOU</Text>}
                    </Text>
                    <Text style={styles.rowMeta}>
                      {BADGE[e.user.badge]} {e.user.badge} · {e.user.completedExchanges} swaps · {e.user.hoursTaught}h
                    </Text>
                  </View>
                  <View style={styles.rowRight}>
                    <Text style={styles.rowLabel}>{e.statLabel}</Text>
                    <Text style={[styles.rowStat, filter === 'Trust score' && styles.rowStatGold]}>
                      {filter === 'Trust score'
                        ? <><CountUp to={s} decimals={1} fontSize={17} color={colors.gold} />★</>
                        : <CountUp to={s} fontSize={17} />}
                    </Text>
                  </View>
                </View>
              </FadeIn>
            )
          })}
        </View>

        <Text style={styles.footerNote}>Rankings refresh hourly · Badges: 👑 Expert · ⭐ Rising · 🎯 Trusted · 🔥 Streak</Text>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  body: { padding: 20, paddingBottom: 32 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  title: { fontSize: 30, fontWeight: '900', color: '#fff' },
  livePill: { borderRadius: 999, backgroundColor: 'rgba(255,201,60,0.15)', paddingHorizontal: 10, paddingVertical: 4 },
  livePillText: { color: colors.gold, fontSize: 10, fontWeight: '800' },
  subtitle: { fontSize: 12, color: colors.white50, marginTop: 4 },
  filterRow: { flexDirection: 'row', gap: 8, paddingRight: 8 },
  list: { marginTop: 16, gap: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.white10,
    backgroundColor: colors.card,
    padding: 12,
  },
  rowMe: { borderColor: 'rgba(255,122,26,0.5)', backgroundColor: 'rgba(255,122,26,0.08)' },
  rank: { width: 30, textAlign: 'center', fontWeight: '900', fontSize: 14, color: colors.white30 },
  rankGold: { color: colors.gold },
  rankSilver: { color: '#d4d4d8' },
  rankBronze: { color: '#b45309' },
  rowMid: { flex: 1, gap: 2 },
  rowName: { color: '#fff', fontWeight: '800', fontSize: 14 },
  youTag: { color: colors.orange, fontSize: 9, backgroundColor: 'rgba(255,122,26,0.2)', paddingHorizontal: 4, paddingVertical: 1, borderRadius: 4, fontWeight: '900' },
  rowMeta: { color: colors.white40, fontSize: 11 },
  rowRight: { alignItems: 'flex-end' },
  rowLabel: { fontSize: 8, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase', color: colors.white30 },
  rowStat: { fontWeight: '900', fontSize: 17, color: '#fff' },
  rowStatGold: { color: colors.gold },
  footerNote: { marginTop: 20, textAlign: 'center', color: colors.white40, fontSize: 10 },
})