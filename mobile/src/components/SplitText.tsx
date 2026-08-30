import { useEffect } from 'react'
import { StyleSheet, Text, TextProps, View } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated'

interface SplitTextProps extends TextProps {
  text: string
  stagger?: number
  duration?: number
  delay?: number
  splitBy?: 'chars' | 'words'
  play?: boolean
}

export default function SplitText({
  text,
  stagger = 0.045,
  duration = 0.6,
  delay = 0,
  splitBy = 'words',
  play = true,
  style,
  ...rest
}: SplitTextProps) {
  const parts = splitBy === 'words' ? text.split(' ') : text.split('')
  const values = parts.map(() => useSharedValue(play ? 1 : 0))
  const opacities = parts.map(() => useSharedValue(play ? 1 : 0))

  useEffect(() => {
    if (!play) return
    values.forEach((v, i) => {
      v.value = withDelay(
        (delay + i * stagger) * 1000,
        withTiming(1, { duration: duration * 1000, easing: Easing.out(Easing.cubic) })
      )
      opacities[i].value = withDelay(
        (delay + i * stagger) * 1000,
        withTiming(1, { duration: duration * 1000 })
      )
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, play])

  return (
    <View style={styles.row}>
      {parts.map((part, i) => {
        const animatedStyle = useAnimatedStyle(() => ({
          opacity: opacities[i].value,
          transform: [
            { translateY: (1 - values[i].value) * 24 },
            { scale: 0.92 + values[i].value * 0.08 },
          ],
        }))
        return (
          <Animated.Text key={`${part}-${i}`} style={[style, animatedStyle]} {...rest}>
            {part}
            {splitBy === 'words' && i < parts.length - 1 ? ' ' : ''}
          </Animated.Text>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap' },
})