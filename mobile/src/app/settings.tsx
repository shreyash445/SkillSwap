import { useRouter } from 'expo-router'
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTheme, ACCENT_OPTIONS } from '@/context/ThemeContext'
import { colors } from '@/theme'

export default function Settings() {
  const router = useRouter()
  const { settings, setAccent, toggle } = useTheme()

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.back}>← Back</Text>
          </Pressable>
          <Text style={styles.title}>Settings</Text>
        </View>

        <Text style={styles.sectionTitle}>Accent Color</Text>
        <View style={styles.colorGrid}>
          {ACCENT_OPTIONS.map((opt) => {
            const active = settings.accent === opt.color
            return (
              <Pressable
                key={opt.color}
                style={[styles.colorItem, active && { borderColor: opt.color }]}
                onPress={() => setAccent(opt.color)}
              >
                <View style={[styles.colorDot, { backgroundColor: opt.color }]} />
                <Text style={[styles.colorLabel, active && { color: opt.color }]}>{opt.label}</Text>
              </Pressable>
            )
          })}
        </View>

        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.card}>
          <ToggleRow
            label="Reduce Motion"
            value={settings.reduceMotion}
            onToggle={() => toggle('reduceMotion')}
          />
          <ToggleRow
            label="Haptics"
            value={settings.haptics}
            onToggle={() => toggle('haptics')}
          />
          <ToggleRow
            label="Notifications"
            value={settings.notifications}
            onToggle={() => toggle('notifications')}
            last
          />
        </View>

        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.card}>
          <Text style={styles.aboutText}>SkillSwap v1.0.0</Text>
          <Text style={styles.aboutSub}>Built with Expo + React Native</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

function ToggleRow({
  label,
  value,
  onToggle,
  last,
}: {
  label: string
  value: boolean
  onToggle: () => void
  last?: boolean
}) {
  return (
    <View style={[styles.toggleRow, !last && styles.toggleBorder]}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: colors.white10, true: colors.accent }}
        thumbColor={value ? '#fff' : colors.white50}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  body: { paddingBottom: 32 },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  back: { color: colors.orange, fontSize: 14, fontWeight: '700', marginBottom: 12 },
  title: { color: '#fff', fontSize: 28, fontWeight: '900' },
  sectionTitle: {
    color: colors.white70,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 10,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: 20,
  },
  colorItem: {
    width: '30%',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.white10,
    backgroundColor: colors.white05,
    gap: 6,
  },
  colorDot: { width: 28, height: 28, borderRadius: 14 },
  colorLabel: { color: colors.white50, fontSize: 12, fontWeight: '700' },
  card: {
    marginHorizontal: 20,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: 'hidden',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  toggleBorder: { borderBottomWidth: 1, borderBottomColor: colors.white10 },
  toggleLabel: { color: '#fff', fontSize: 14, fontWeight: '600' },
  aboutText: { color: '#fff', fontSize: 14, fontWeight: '700', padding: 16 },
  aboutSub: { color: colors.white40, fontSize: 12, paddingHorizontal: 16, paddingBottom: 16 },
})
