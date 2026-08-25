import React, { useRef } from "react";
import { Dimensions, Image, Pressable, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import type { SharedValue } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { LavaLampBackground } from "../components/LavaLampBackground";
import { font } from "../theme";
import type { RootStackParamList } from "../navigation";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const SLIDES = [
  {
    id: "1",
    title: "Teach what you know",
    description:
      "Pick the skills you can offer — code, design, languages, cooking, anything you're good at.",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80",
    color: "#090D16",
    accent: "#38BDF8",
  },
  {
    id: "2",
    title: "Learn what you don't",
    description:
      "Search the skills you want to pick up and get matched with people who can teach them.",
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80",
    color: "#130C24",
    accent: "#A855F7",
  },
  {
    id: "3",
    title: "Swap, don't pay",
    description:
      "Trade skills one-for-one. No money, no courses — just people helping people level up.",
    image: "https://images.unsplash.com/photo-1543269664-56d93c1b41a6?w=800&auto=format&fit=crop&q=80",
    color: "#071A16",
    accent: "#34D399",
  },
];

type Props = NativeStackScreenProps<RootStackParamList, "Welcome">;

function SlideItem({
  item,
  index,
  scrollX,
}: {
  item: (typeof SLIDES)[number];
  index: number;
  scrollX: SharedValue<number>;
}) {
  const animatedImageStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * SCREEN_WIDTH,
      index * SCREEN_WIDTH,
      (index + 1) * SCREEN_WIDTH,
    ];

    const scale = interpolate(scrollX.value, inputRange, [0.6, 1, 0.6], Extrapolation.CLAMP);
    const translateY = interpolate(scrollX.value, inputRange, [40, 0, 40], Extrapolation.CLAMP);
    const opacity = interpolate(scrollX.value, inputRange, [0.3, 1, 0.3], Extrapolation.CLAMP);

    return { opacity, transform: [{ scale }, { translateY }] };
  });

  const animatedContentStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * SCREEN_WIDTH,
      index * SCREEN_WIDTH,
      (index + 1) * SCREEN_WIDTH,
    ];

    const translateX = interpolate(scrollX.value, inputRange, [80, 0, -80], Extrapolation.CLAMP);
    const opacity = interpolate(scrollX.value, inputRange, [0, 1, 0], Extrapolation.CLAMP);

    return { opacity, transform: [{ translateX }] };
  });

  return (
    <View style={styles.slide}>
      <Animated.View style={[styles.imageContainer, animatedImageStyle]}>
        <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
      </Animated.View>

      <Animated.View style={[styles.textContainer, animatedContentStyle]}>
        <Text style={[styles.accentTag, { color: item.accent }]}>
          0{index + 1} / 0{SLIDES.length}
        </Text>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </Animated.View>
    </View>
  );
}

function PaginationDot({
  index,
  scrollX,
  accent,
}: {
  index: number;
  scrollX: SharedValue<number>;
  accent: string;
}) {
  const animatedDotStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * SCREEN_WIDTH,
      index * SCREEN_WIDTH,
      (index + 1) * SCREEN_WIDTH,
    ];

    const width = interpolate(scrollX.value, inputRange, [8, 28, 8], Extrapolation.CLAMP);
    const opacity = interpolate(scrollX.value, inputRange, [0.3, 1, 0.3], Extrapolation.CLAMP);

    return {
      width,
      opacity,
      backgroundColor: opacity > 0.6 ? accent : "rgba(255, 255, 255, 0.3)",
    };
  });

  return <Animated.View style={[styles.dot, animatedDotStyle]} />;
}

export function WelcomeScreen({ navigation }: Props) {
  const scrollX = useSharedValue(0);
  const flatListRef = useRef<Animated.FlatList<(typeof SLIDES)[number]>>(null);

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollX.value = event.contentOffset.x;
  });

  const handleNext = () => {
    const currentIndex = Math.round(scrollX.value / SCREEN_WIDTH);
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      navigation.replace("Onboarding");
    }
  };

  return (
    <LavaLampBackground>
      <Animated.FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        renderItem={({ item, index }) => <SlideItem item={item} index={index} scrollX={scrollX} />}
      />

      <View style={styles.footer}>
        <View style={styles.paginationRow}>
          {SLIDES.map((item, index) => (
            <PaginationDot key={item.id} index={index} scrollX={scrollX} accent={item.accent} />
          ))}
        </View>

        <Pressable onPress={handleNext} style={styles.actionButton}>
          <Ionicons name="arrow-forward" size={22} color="#FFFFFF" />
        </Pressable>
      </View>
    </LavaLampBackground>
  );
}

const styles = StyleSheet.create({
  slide: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    alignItems: "center",
    paddingTop: SCREEN_HEIGHT * 0.12,
    paddingHorizontal: 28,
  },
  imageContainer: {
    width: SCREEN_WIDTH - 64,
    height: SCREEN_HEIGHT * 0.44,
    borderRadius: 36,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 12,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  textContainer: {
    width: "100%",
    marginTop: 36,
  },
  accentTag: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 2,
    marginBottom: 10,
    textTransform: "uppercase",
    fontFamily: font.mono,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.5,
    lineHeight: 38,
    fontFamily: font.displayBold,
  },
  description: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.65)",
    marginTop: 12,
    lineHeight: 22,
    fontFamily: font.body,
  },
  footer: {
    position: "absolute",
    bottom: 48,
    left: 28,
    right: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  paginationRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  actionButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
});