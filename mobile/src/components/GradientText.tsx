import MaskedView from '@react-native-masked-view/masked-view'
import { LinearGradient } from 'expo-linear-gradient'
import { StyleSheet, Text, TextProps } from 'react-native'

interface GradientTextProps extends TextProps {
  colors?: [string, string, ...string[]]
  start?: { x: number; y: number }
  end?: { x: number; y: number }
}

export default function GradientText({
  colors = ['#ff7a1a', '#ff4d5a', '#ffc93c'],
  start = { x: 0, y: 0 },
  end = { x: 1, y: 1 },
  children,
  style,
  ...rest
}: GradientTextProps) {
  return (
    <MaskedView maskElement={<Text style={[styles.text, style]} {...rest}>{children}</Text>}>
      <LinearGradient colors={colors} start={start} end={end}>
        <Text style={[styles.text, style, styles.invisible]} {...rest}>{children}</Text>
      </LinearGradient>
    </MaskedView>
  )
}

const styles = StyleSheet.create({
  text: { backgroundColor: 'transparent' },
  invisible: { opacity: 0 },
})