import { useState } from 'react'
import { ScrollView, StyleSheet, Text, View, Switch } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Avatar, Card, Chip, GradientButton } from '@/components/ui'
import SplitText from '@/components/SplitText'
import FadeIn from '@/components/FadeIn'
import { colors } from '@/theme'
import { USERS } from '@/data/mock'

export default function Admin() {
  const [flagged, setFlagged] = useState([
    { id: 1, user: USERS[4], reason: '3 no-shows this month', severity: '⚠️', banned: false },
    { id: 2, user: USERS[2], reason: 'Reported: misleading skill listing', severity: '🚩', banned: false },
  ])
  const [aiOps, setAiOps] = useState(true)
  const [anon, setAnon] = useState(true)

  const toggleBan = (id: number) =>
    setFlagged((f) => f.map((x) => (x.id === id ? { ...x, banned: !x.banned } : x)))

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <SplitText text="Admin console" style={styles.title} />
        <Text style={styles.subtitle}>🛠️ Trust & safety ops — real-time audit</Text>

        <Card style={styles.opsCard}>
          <Text style={styles.cardTitle}>⚙️ AI Ops</Text>
          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.switchLabel}>AI match engine</Text>
              <Text style={styles.switchSub}>TF-IDF + cosine scoring live</Text>
            </View>
            <Switch value={aiOps} onValueChange={setAiOps} trackColor={{ true: colors.orange, false: colors.white10 }} thumbColor="#fff" />
          </View>
          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.switchLabel}>Anonymous chat reports</Text>
              <Text style={styles.switchSub}>Users can flag without exposure</Text>
            </View>
            <Switch value={anon} onValueChange={setAnon} trackColor={{ true: colors.orange, false: colors.white10 }} thumbColor="#fff" />
          </View>
        </Card>

        <Card style={styles.statsCard}>
          <Text style={styles.cardTitle}>📊 Live stats</Text>
          <View style={styles.statsRow}>
            <MiniStat value="214" label="Students" />
            <MiniStat value="182" label="Exchanges" />
            <MiniStat value="4.7" label="Avg trust" />
            <MiniStat value="0" label="Open flags" />
          </View>
        </Card>

        <Text style={styles.sectionTitle}>🚨 Flagged users</Text>
        {flagged.map((f, i) => (
          <FadeIn key={f.id} delay={0.06 * i} distance={14}>
            <Card style={[styles.flagCard, f.banned ? styles.flagBanned : undefined]}>
              <View style={styles.flagTop}>
                <Avatar initials={f.user.initials} gradient={f.user.gradient} size={40} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.flagName}>{f.user.name}</Text>
                  <Text style={styles.flagReason}>{f.severity} {f.reason}</Text>
                </View>
                <Text style={styles.flagTrust}>{f.user.trustScore}★</Text>
              </View>
              <View style={styles.flagActions}>
                <Chip active={f.banned} onPress={() => toggleBan(f.id)}>
                  {f.banned ? '✓ Banned' : 'Ban user'}
                </Chip>
                <Chip>View thread</Chip>
                <Chip>Escalate</Chip>
              </View>
            </Card>
          </FadeIn>
        ))}

        <View style={styles.audit}>
          <GradientButton style={{ alignSelf: 'stretch' }} onPress={() => {}}>
            Run full trust audit 🧾
          </GradientButton>
          <Text style={styles.auditNote}>Audits recalculate every trust score against the complete report log.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

function MiniStat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.miniStat}>
      <Text style={styles.miniValue}>{value}</Text>
      <Text style={styles.miniLabel}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  body: { padding: 20, paddingBottom: 32 },
  title: { fontSize: 30, fontWeight: '900', color: '#fff' },
  subtitle: { fontSize: 13, color: colors.white70, marginTop: 4, marginBottom: 16 },
  cardTitle: { color: colors.white70, fontSize: 11, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 },
  opsCard: { padding: 16, gap: 4 },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  switchLabel: { color: '#fff', fontWeight: '700', fontSize: 14 },
  switchSub: { color: colors.white40, fontSize: 11, marginTop: 1 },
  statsCard: { marginTop: 12, padding: 16 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  miniStat: { alignItems: 'center', gap: 2 },
  miniValue: { color: colors.orange, fontWeight: '900', fontSize: 20 },
  miniLabel: { color: colors.white40, fontSize: 10, fontWeight: '700' },
  sectionTitle: { color: '#fff', fontWeight: '800', fontSize: 16, marginTop: 22, marginBottom: 10 },
  flagCard: { padding: 14, gap: 10 },
  flagBanned: { opacity: 0.5, borderColor: colors.coral },
  flagTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  flagName: { color: '#fff', fontWeight: '800', fontSize: 14 },
  flagReason: { color: colors.white50, fontSize: 11, marginTop: 1 },
  flagTrust: { color: colors.gold, fontWeight: '900', fontSize: 14 },
  flagActions: { flexDirection: 'row', gap: 8 },
  audit: { marginTop: 20, gap: 8 },
  auditNote: { color: colors.white40, fontSize: 10, textAlign: 'center' },
})