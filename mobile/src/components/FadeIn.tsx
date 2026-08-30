import { ReactNode, useEffect } from 'react'
import { StyleProp, ViewStyle } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from 'react-native-reanimated'

interface FadeInProps {
  children: ReactNode
  delay?: number
  distance?: number
  style?: StyleProp<ViewStyle>
}

export default function FadeIn({ children, delay = 0, distance = 24, style }: FadeInProps) {
  const progress = useSharedValue(0)

  useEffect(() => {
    progress.value = withDelay(delay * 1000, withTiming(1, { duration: 500 }))
  }, [progress, delay])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * distance }],
  }))

  return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>
}