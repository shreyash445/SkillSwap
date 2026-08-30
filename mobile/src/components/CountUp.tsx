import { useEffect } from 'react'
import { StyleSheet, TextInput } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withDelay,
} from 'react-native-reanimated'
import { colors } from '@/theme'

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput)

interface CountUpProps {
  to: number
  from?: number
  duration?: number
  delay?: number
  decimals?: number
  suffix?: string
  fontSize?: number
  color?: string
  weight?: 'regular' | 'bold' | '800' | '900'
}

export default function CountUp({
  to,
  from = 0,
  duration = 1.2,
  delay = 0,
  decimals = 0,
  suffix = '',
  fontSize = 18,
  color = '#fff',
  weight = '800',
}: CountUpProps) {
  const value = useSharedValue(from)

  const animatedProps = useAnimatedProps(() => ({
    text: `${value.value.toFixed(decimals)}${suffix}`,
  }))

  useEffect(() => {
    value.value = withDelay(delay * 1000, withTiming(to, { duration: duration * 1000 }))
  }, [to, duration, delay, value])

  return (
    <AnimatedTextInput
      editable={false}
      value={`${from.toFixed(decimals)}${suffix}`}
      animatedProps={animatedProps as any}
      style={[styles.text, { fontSize, color, fontWeight: weight }]}
    />
  )
}

const styles = StyleSheet.create({
  text: { padding: 0, margin: 0, backgroundColor: 'transparent' },
})