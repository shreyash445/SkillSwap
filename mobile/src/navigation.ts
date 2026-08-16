import type { CompositeScreenProps } from "@react-navigation/native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { User, Exchange } from "./types";

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Welcome: undefined;
  Onboarding: undefined;
  Main: undefined;
  UserProfile: { user: User };
  Conversation: { exchange: Exchange };
};

export type TabParamList = {
  Discover: undefined;
  Exchanges: undefined;
  Messages: undefined;
  Leaderboard: undefined;
  Profile: undefined;
};

export type TabScreenProps<T extends keyof TabParamList> = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, T>,
  NativeStackScreenProps<RootStackParamList>
>;