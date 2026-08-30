import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Avatar, Card, GradientButton } from '@/components/ui'
import SplitText from '@/components/SplitText'
import FadeIn from '@/components/FadeIn'
import CountUp from '@/components/CountUp'
import { colors } from '@/theme'

export default function Rating() {
  const router = useRouter()
  const [stars, setStars] = useState(0)
  const [hover, setHover] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [punctual, setPunctual] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const current = stars || hover

  const prevTrust = 4.2
  const delta = current >= 4 ? 0.2 : current >= 3 ? 0 : -0.3
  const newTrust = Math.min(5, Math.max(1, +(prevTrust + delta).toFixed(1)))
  const labels = ['', 'Terrible', 'Meh', 'Good', 'Great!', 'Outstanding!']

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <SplitText text="Exchange complete!" style={styles.title} />
        <Text style={styles.subtitle}>Rate your Python ↔ Guitar swap with Sanya</Text>

        <Card style={styles.card}>
          <Avatar initials="SK" gradient={['#f43f5e', '#ef4444']} size={80} />
          <Text style={styles.name}>Sanya Kapoor</Text>
          <Text style={styles.meta}>Taught you Guitar fundamentals · 60 min</Text>

          <View style={styles.starRow}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Text
                key={i}
                style={[styles.star, { color: i <= current ? colors.gold : colors.white15 }]}
                onPress={() => setStars(i)}
                onPressIn={() => setHover(i)}
                onPressOut={() => setHover(0)}
              >
                ★
              </Text>
            ))}
          </View>
          <Text style={styles.starLabel}>{current === 0 ? 'Tap to rate' : labels[current]}</Text>

          {current > 0 && (
            <FadeIn>
              <TextInput
                value={feedback}
                onChangeText={setFeedback}
                placeholder="What went well? What could improve? (optional)"
                placeholderTextColor={colors.white30}
                multiline
                numberOfLines={3}
                style={styles.input}
              />
              <View style={styles.punctualRow}>
                {[{ v: true, l: '✅ On time' }, { v: false, l: '🕐 Late' }].map((o) => (
                  <Text
                    key={String(o.v)}
                    style={[styles.punctualChip, punctual === o.v && styles.punctualChipActive]}
                    onPress={() => setPunctual(o.v)}
                  >
                    {o.l}
                  </Text>
                ))}
              </View>
              <GradientButton onPress={() => setSubmitted(true)}>Submit rating & feedback</GradientButton>
            </FadeIn>
          )}
        </Card>

        {submitted && (
          <FadeIn distance={24}>
            <View style={styles.success}>
              <Text style={styles.successTitle}>Trust score updated</Text>
              <View style={styles.trustRow}>
                <View style={styles.trustBox}>
                  <Text style={styles.trustLabel}>BEFORE</Text>
                  <Text style={styles.trustValueOld}>{prevTrust.toFixed(1)}</Text>
                </View>
                <Text style={styles.arrow}>→</Text>
                <LinearGradient colors={[colors.orange, colors.coral]} style={styles.trustBoxActive}>
                  <Text style={styles.trustLabel}>AFTER</Text>
                  <CountUp to={newTrust} from={prevTrust} decimals={1} fontSize={24} />
                </LinearGradient>
              </View>
              <Text style={styles.trustNote}>
                +{current}★ rating · {punctual ? 'on-time bonus +5' : 'late penalty −5'} · sentiment positive +3
              </Text>
              <GradientButton style={{ marginTop: 14, alignSelf: 'stretch' }} onPress={() => router.replace('/(tabs)/discover')}>
                Back to Discover
              </GradientButton>
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
  title: { fontSize: 30, fontWeight: '900', color: '#fff' },
  subtitle: { fontSize: 14, color: colors.white70, marginTop: 4, marginBottom: 16 },
  card: { padding: 20, alignItems: 'center', gap: 8 },
  name: { color: '#fff', fontWeight: '800', fontSize: 18, marginTop: 6 },
  meta: { color: colors.white50, fontSize: 12 },
  starRow: { flexDirection: 'row', gap: 8, marginTop: 14 },
  star: { fontSize: 40 },
  starLabel: { color: colors.white50, fontSize: 12, fontWeight: '700' },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: colors.white10,
    backgroundColor: colors.white05,
    borderRadius: 16,
    padding: 14,
    color: '#fff',
    fontSize: 13,
    minHeight: 70,
    textAlignVertical: 'top',
    marginTop: 12,
  },
  punctualRow: { flexDirection: 'row', gap: 8, marginVertical: 12 },
  punctualChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.white15,
    backgroundColor: colors.white05,
    paddingHorizontal: 14,
    paddingVertical: 7,
    color: colors.white50,
    fontSize: 12,
    fontWeight: '700',
    overflow: 'hidden',
  },
  punctualChipActive: { backgroundColor: colors.white10, color: '#fff' },
  success: { marginTop: 16, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(52,211,153,0.3)', backgroundColor: 'rgba(52,211,153,0.08)', padding: 24, alignItems: 'center', gap: 10 },
  successTitle: { color: '#fff', fontSize: 20, fontWeight: '900' },
  trustRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  trustBox: { borderRadius: 16, backgroundColor: colors.white05, paddingHorizontal: 18, paddingVertical: 10, alignItems: 'center' },
  trustBoxActive: { borderRadius: 16, paddingHorizontal: 20, paddingVertical: 10, alignItems: 'center' },
  trustLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 1, color: 'rgba(255,255,255,0.6)' },
  trustValueOld: { color: colors.white50, fontSize: 22, fontWeight: '900' },
  arrow: { color: colors.orange, fontSize: 20, fontWeight: '900' },
  trustNote: { color: colors.white50, fontSize: 11, textAlign: 'center' },
})