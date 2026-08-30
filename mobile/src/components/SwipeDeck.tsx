import React, { useImperativeHandle, useEffect, useRef, useState } from 'react'
import { StyleSheet, Text, View, ViewStyle, Dimensions } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  SharedValue,
} from 'react-native-reanimated'
import { colors } from '@/theme'

const { width: SCREEN_W } = Dimensions.get('window')

const SWIPE_THRESHOLD = 110
const VELOCITY_THRESHOLD = 900
const MAX_STACK = 3
const CARD_GAP = 14
const CARD_SCALE_STEP = 0.035

export interface SwipeDeckHandle {
  swipe: (dir: 1 | -1) => void
  reset: () => void
}

interface SwipeDeckProps<T> {
  data: T[]
  renderCard: (item: T, index: number) => React.ReactNode
  onSwipeLeft?: (item: T) => void
  onSwipeRight?: (item: T) => void
  onFinished?: () => void
  emptyComponent?: React.ReactNode
  style?: ViewStyle
}

interface SwipeCardHandle {
  flyOut: (dir: 1 | -1) => void
}

const SwipeCard = React.forwardRef<
  SwipeCardHandle,
  {
    position: number
    progress: SharedValue<number>
    onSwipe: (dir: 1 | -1) => void
    children: React.ReactNode
  }
>(function SwipeCard({ position, progress, onSwipe, children }, ref) {
  const translateX = useSharedValue(0)
  const translateY = useSharedValue(0)
  const scale = useSharedValue(1)

  const isTop = position === 0

  const flyOut = (dir: 1 | -1) => {
    translateX.value = withTiming(dir * SCREEN_W * 1.4, { duration: 320 })
    translateY.value = withTiming(60, { duration: 320 })
  }

  useImperativeHandle(ref, () => ({ flyOut }))

  const gesture = Gesture.Pan()
    .enabled(isTop)
    .onUpdate((e) => {
      translateX.value = e.translationX
      translateY.value = e.translationY
      const drag = Math.min(1, Math.abs(e.translationX) / SWIPE_THRESHOLD)
      scale.value = 1 + drag * 0.02
      progress.value = drag
    })
    .onEnd((e) => {
      progress.value = withSpring(0, { damping: 20, stiffness: 260 })
      scale.value = withSpring(1, { damping: 20, stiffness: 260 })
      const dist = Math.abs(e.translationX)
      const vel = Math.abs(e.velocityX)
      if (dist > SWIPE_THRESHOLD || vel > VELOCITY_THRESHOLD) {
        const dir: 1 | -1 = e.translationX > 0 || (dist < 20 && e.velocityX > 0) ? 1 : -1
        flyOut(dir)
        runOnJS(onSwipe)(dir)
      } else {
        translateX.value = withSpring(0, { damping: 20, stiffness: 260 })
        translateY.value = withSpring(0, { damping: 20, stiffness: 260 })
      }
    })

  const cardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(translateX.value, [-SCREEN_W, 0, SCREEN_W], [-20, 0, 20])
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate}deg` },
        { scale: scale.value },
      ],
    }
  })

  const backStyle = useAnimatedStyle(() => {
    const t = progress.value
    const baseScale = 1 - position * CARD_SCALE_STEP
    const baseY = position * CARD_GAP
    return {
      transform: [
        { scale: baseScale + (1 - baseScale) * t },
        { translateY: baseY - baseY * t },
      ],
    }
  })

  const likeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [30, SWIPE_THRESHOLD], [0, 1], Extrapolation.CLAMP),
    transform: [
      { rotate: '14deg' },
      { scale: interpolate(translateX.value, [0, SWIPE_THRESHOLD], [0.8, 1], Extrapolation.CLAMP) },
    ],
  }))
  const nopeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-SWIPE_THRESHOLD, -30], [1, 0], Extrapolation.CLAMP),
    transform: [
      { rotate: '-14deg' },
      { scale: interpolate(translateX.value, [0, -SWIPE_THRESHOLD], [0.8, 1], Extrapolation.CLAMP) },
    ],
  }))

  const wrapper = isTop ? cardStyle : backStyle

  return (
    <Animated.View style={[styles.absolute, wrapper]}>
      <GestureDetector gesture={gesture}>
        <View style={styles.card}>{children}</View>
      </GestureDetector>
      {isTop && (
        <View style={[styles.badges, { pointerEvents: 'none' }]}>
          <Animated.View style={[styles.badge, styles.nopeBadge, nopeStyle]}>
            <Text style={[styles.badgeText, { color: colors.coral }]}>NOPE</Text>
          </Animated.View>
          <Animated.View style={[styles.badge, styles.likeBadge, likeStyle]}>
            <Text style={[styles.badgeText, { color: colors.emerald }]}>LIKE</Text>
          </Animated.View>
        </View>
      )}
    </Animated.View>
  )
})

function SwipeDeckInner<T>(
  {
    data,
    renderCard,
    onSwipeLeft,
    onSwipeRight,
    onFinished,
    emptyComponent,
    style,
  }: SwipeDeckProps<T>,
  ref: React.Ref<SwipeDeckHandle>
) {
  const [topIndex, setTopIndex] = useState(0)
  const [swiped, setSwiped] = useState<{ dir: 1 | -1; item: T }[]>([])
  const [spent, setSpent] = useState(0)
  const [deckId, setDeckId] = useState(0)
  const progress = useSharedValue(0)
  const lockRef = useRef(false)
  const cardRefs = useRef<(SwipeCardHandle | null)[]>([])

  const remaining = data.slice(topIndex)

  const advance = (dir: 1 | -1) => {
    if (lockRef.current) return
    const item = data[topIndex]
    if (item === undefined) return
    lockRef.current = true
    if (dir === 1) onSwipeRight?.(item)
    else onSwipeLeft?.(item)
    setSpent((s) => s + 1)
    setSwiped((s) => [...s, { dir, item }])
    setTopIndex((i) => i + 1)
    if (topIndex + 1 >= data.length) onFinished?.()
    setTimeout(() => {
      lockRef.current = false
    }, 360)
  }

  const handleSwipe = (dir: 1 | -1) => advance(dir)

  useImperativeHandle(ref, () => ({
    swipe: (dir: 1 | -1) => {
      cardRefs.current[0]?.flyOut(dir)
      advance(dir)
    },
    reset: () => {
      setTopIndex(0)
      setSpent(0)
      setSwiped([])
      setDeckId((d) => d + 1)
    },
  }))

  const cards = remaining.slice(0, MAX_STACK + 1).map((item, i) => (
    <SwipeCard
      key={`${deckId}-${i}`}
      ref={(el) => {
        cardRefs.current[i] = el
      }}
      position={i}
      progress={progress}
      onSwipe={handleSwipe}
    >
      {renderCard(item, topIndex + i)}
    </SwipeCard>
  ))

  return (
    <View style={[styles.deck, style]}>
      {remaining.length === 0 && (emptyComponent ?? null)}
      {cards}
      {remaining.length > 0 && spent > 0 && (
        <View style={styles.swipeCount}>
          <Text style={styles.swipeCountText}>
            ✅ {swiped.filter((s) => s.dir === 1).length} liked · ⛔ {swiped.filter((s) => s.dir === -1).length} passed
          </Text>
        </View>
      )}
    </View>
  )
}

const SwipeDeck = React.forwardRef(SwipeDeckInner) as <T>(
  props: SwipeDeckProps<T> & { ref?: React.Ref<SwipeDeckHandle> }
) => React.ReactElement

export default SwipeDeck

const styles = StyleSheet.create({
  deck: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  absolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  card: {
    flex: 1,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.white10,
    backgroundColor: colors.card,
    overflow: 'hidden',
    boxShadow: '0px 10px 24px rgba(0,0,0,0.55)',
    elevation: 12,
  },
  badges: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  badge: {
    borderWidth: 2.5,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  nopeBadge: { borderColor: colors.coral },
  likeBadge: { borderColor: colors.emerald },
  badgeText: { fontWeight: '900', fontSize: 22, letterSpacing: 2 },
  swipeCount: { position: 'absolute', top: -26, alignSelf: 'center' },
  swipeCountText: { color: colors.white40, fontSize: 11, fontWeight: '700' },
})