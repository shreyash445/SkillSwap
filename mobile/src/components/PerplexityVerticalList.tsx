import React, { useState } from "react";
import { Dimensions, RefreshControlProps, StyleSheet, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const SPACING = 16;

interface Props<T> {
  data: T[];
  renderItem: (info: { item: T; index: number }) => React.ReactElement;
  keyExtractor: (item: T, index: number) => string;
  refreshControl?: React.ReactElement<RefreshControlProps>;
  ListEmptyComponent?: React.ReactElement | null;
}

export function PerplexityVerticalList<T>({
  data,
  renderItem,
  keyExtractor,
  refreshControl,
  ListEmptyComponent,
}: Props<T>) {
  const [viewportH, setViewportH] = useState(SCREEN_HEIGHT);
  const scrollY = useSharedValue(0);

  const cardHeight = Math.max(viewportH - 120, 320);
  const itemFullSize = cardHeight + SPACING;
  const snapOffset = Math.max((viewportH - itemFullSize) / 2, 8);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  function Card({ item, index }: { item: T; index: number }) {
    const animatedStyle = useAnimatedStyle(() => {
      const position = (scrollY.value - index * itemFullSize) / itemFullSize;
      const scale = interpolate(position, [-1, 0, 1], [0.92, 1, 0.92], Extrapolation.CLAMP);
      const opacity = interpolate(
        position,
        [-1, -0.5, 0, 0.5, 1],
        [0.35, 0.85, 1, 0.85, 0.35],
        Extrapolation.CLAMP
      );
      const translateY = interpolate(position, [-1, 0, 1], [-20, 0, 20], Extrapolation.CLAMP);
      return {
        opacity,
        transform: [{ scale }, { translateY }],
      };
    });

    return (
      <Animated.View
        style={[{ height: cardHeight, marginBottom: SPACING, marginHorizontal: 20 }, animatedStyle]}
      >
        {renderItem({ item, index })}
      </Animated.View>
    );
  }

  return (
    <View style={styles.wrap} onLayout={(e) => setViewportH(e.nativeEvent.layout.height)}>
      <Animated.FlatList
        data={data}
        keyExtractor={keyExtractor}
        renderItem={({ item, index }) => <Card item={item} index={index} />}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        snapToInterval={itemFullSize}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: snapOffset, paddingBottom: snapOffset }}
        refreshControl={refreshControl}
        ListEmptyComponent={ListEmptyComponent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
  },
});