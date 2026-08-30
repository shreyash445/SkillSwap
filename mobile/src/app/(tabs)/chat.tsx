import { useRouter } from 'expo-router'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Avatar, Card } from '@/components/ui'
import SplitText from '@/components/SplitText'
import { colors } from '@/theme'
import { MATCHES } from '@/data/mock'

export default function ChatTab() {
  const router = useRouter()

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <SplitText text="Messages" style={styles.title} />
        <Text style={styles.subtitle}>💬 {MATCHES.length} active exchanges</Text>

        {MATCHES.map((m, i) => {
          const u = m.user
          return (
            <Card key={u.id} style={styles.card}>
              <Avatar initials={u.initials} gradient={u.gradient} size={46} />
              <View style={styles.mid}>
                <View style={styles.nameRow}>
                  <Text style={styles.name}>{u.name}</Text>
                  <Text style={styles.time}>10:{String(i).padStart(2, '0')} AM</Text>
                </View>
                <Text style={styles.preview} numberOfLines={1}>
                  {i === 1 ? 'Just accepted ✅ See you Thursday!' : `Exchange: ${u.offers[0]} ↔ Python`}
                </Text>
              </View>
              <View style={styles.rightCol}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{m.matchScore}%</Text>
                </View>
                <Text style={styles.unread}>{i === 1 ? '2' : ''}</Text>
              </View>
            </Card>
          )
        })}

        <View style={styles.threadBtnWrap}>
          <Card style={styles.threadCard}>
            <Text style={styles.threadTitle}>Active thread · Python ↔ Guitar</Text>
            <Text style={styles.threadBtn} onPress={() => router.push('/chat')}>
              Open chat with Sanya →
            </Text>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  body: { padding: 20, gap: 12 },
  title: { fontSize: 30, fontWeight: '900', color: '#fff' },
  subtitle: { fontSize: 12, color: colors.white50, marginBottom: 4 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  mid: { flex: 1, gap: 3 },
  nameRow: { flexDirection: 'row', justifyContent: 'space-between' },
  name: { color: '#fff', fontWeight: '800', fontSize: 15 },
  time: { color: colors.white40, fontSize: 10 },
  preview: { color: colors.white50, fontSize: 12 },
  rightCol: { alignItems: 'center', gap: 6 },
  badge: { borderRadius: 999, backgroundColor: colors.white10, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { color: colors.orange, fontWeight: '800', fontSize: 10 },
  unread: { width: 16, height: 16, borderRadius: 8, backgroundColor: colors.coral, textAlign: 'center', color: '#fff', fontSize: 10, fontWeight: '800', overflow: 'hidden' },
  threadBtnWrap: { marginTop: 8 },
  threadCard: { padding: 16, gap: 6 },
  threadTitle: { color: colors.white70, fontSize: 13, fontWeight: '700' },
  threadBtn: { color: colors.orange, fontSize: 14, fontWeight: '800' },
})