import { LinearGradient } from 'expo-linear-gradient'
import { Pressable, StyleSheet, Text, View, ViewStyle, TextStyle, StyleProp } from 'react-native'
import { colors } from '@/theme'

export function GradientButton({
  children,
  onPress,
  style,
  disabled,
  small,
}: {
  children: React.ReactNode
  onPress?: () => void
  style?: StyleProp<ViewStyle>
  disabled?: boolean
  small?: boolean
}) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={[style, disabled && styles.disabled]}>
      {({ pressed }) => (
        <LinearGradient
          colors={[colors.orange, colors.coral]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.btn, small && styles.btnSmall, pressed && styles.pressed]}
        >
          <Text style={[styles.btnText, small && styles.btnTextSmall]}>{children}</Text>
        </LinearGradient>
      )}
    </Pressable>
  )
}

export function GhostButton({
  children,
  onPress,
  style,
  small,
}: {
  children: React.ReactNode
  onPress?: () => void
  style?: StyleProp<ViewStyle>
  small?: boolean
}) {
  return (
    <Pressable onPress={onPress} style={style}>
      {({ pressed }) => (
        <View style={[styles.ghost, small && styles.btnSmall, pressed && styles.pressed]}>
          <Text style={[styles.ghostText, small && styles.btnTextSmall]}>{children}</Text>
        </View>
      )}
    </Pressable>
  )
}

export function Card({
  children,
  style,
}: {
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
}) {
  return <View style={[styles.card, style]}>{children}</View>
}

export function Chip({
  children,
  active,
  onPress,
  style,
}: {
  children: React.ReactNode
  active?: boolean
  onPress?: () => void
  style?: StyleProp<ViewStyle>
}) {
  return (
    <Pressable onPress={onPress} style={style}>
      {({ pressed }) => (
        <LinearGradient
          colors={active ? [colors.orange, colors.coral] : ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.05)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.chip, active && styles.chipActive, pressed && styles.pressed]}
        >
          <Text style={[styles.chipText, active && styles.chipTextActive]}>{children}</Text>
        </LinearGradient>
      )}
    </Pressable>
  )
}

export function Avatar({
  initials,
  gradient,
  size = 44,
  ring,
}: {
  initials: string
  gradient: [string, string]
  size?: number
  ring?: boolean
}) {
  return (
    <LinearGradient
      colors={gradient}
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2 },
        ring && styles.avatarRing,
      ]}
    >
      <Text style={[styles.avatarText, { fontSize: size * 0.34 }]}>{initials}</Text>
    </LinearGradient>
  )
}

export function Stars({ value, size = 13 }: { value: number; size?: number }) {
  return (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Text key={i} style={{ fontSize: size, color: i <= Math.round(value) ? colors.gold : colors.white15 }}>
          ★
        </Text>
      ))}
    </View>
  )
}

export function SkillPill({ name, color = colors.white70 }: { name: string; color?: string }) {
  return (
    <View style={styles.pill}>
      <View style={[styles.pillDot, { backgroundColor: color }]} />
      <Text style={[styles.pillText, { color }]}>{name}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSmall: { paddingVertical: 10 },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  btnTextSmall: { fontSize: 13 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  disabled: { opacity: 0.4 },
  ghost: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.white15,
    backgroundColor: colors.white05,
    paddingVertical: 16,
    alignItems: 'center',
  },
  ghostText: { color: 'rgba(255,255,255,0.9)', fontWeight: '600', fontSize: 15 },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.white10,
    backgroundColor: colors.card,
    overflow: 'hidden',
  },
  chip: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.white15,
  },
  chipActive: { borderColor: 'transparent' },
  chipText: { color: colors.white70, fontWeight: '600', fontSize: 12 },
  chipTextActive: { color: '#fff', fontWeight: '800' },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarRing: { borderWidth: 2, borderColor: colors.white15 },
  avatarText: { color: '#fff', fontWeight: '800' },
  starRow: { flexDirection: 'row', gap: 1 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.white10,
    backgroundColor: colors.white05,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  pillDot: { width: 6, height: 6, borderRadius: 3 },
  pillText: { fontSize: 11, fontWeight: '600' },
})