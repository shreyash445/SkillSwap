import { Tabs } from 'expo-router'
import { StyleSheet, Text, View } from 'react-native'
import { colors } from '@/theme'
import HeaderAvatar from '@/components/HeaderAvatar'

function TabIcon({ icon, label, active }: { icon: string; label: string; active: boolean }) {
  return (
    <View style={styles.tabItem}>
      <Text style={[styles.tabIcon, active && styles.tabIconActive]}>{icon}</Text>
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
    </View>
  )
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: '800' },
        headerRight: () => <HeaderAvatar />,
        tabBarStyle: {
          backgroundColor: 'rgba(0,0,0,0.92)',
          borderTopColor: colors.white10,
          borderTopWidth: 1,
          height: 78,
          paddingTop: 6,
          paddingBottom: 12,
        },
        tabBarActiveTintColor: colors.orange,
        tabBarInactiveTintColor: colors.white40,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '700' },
      }}
    >
      <Tabs.Screen
        name="discover"
        options={{
          tabBarLabel: 'Discover',
          tabBarIcon: ({ focused }) => <TabIcon icon="✨" label="" active={focused} />,
          headerTitle: 'Discover',
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          tabBarLabel: 'Chat',
          tabBarIcon: ({ focused }) => <TabIcon icon="💬" label="" active={focused} />,
          headerTitle: 'Messages',
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          tabBarLabel: 'Ranks',
          tabBarIcon: ({ focused }) => <TabIcon icon="🏆" label="" active={focused} />,
          headerTitle: 'Leaderboard',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          href: null,
        }}
      />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  tabItem: { alignItems: 'center', justifyContent: 'center' },
  tabIcon: { fontSize: 22 },
  tabIconActive: { fontSize: 24 },
  tabLabel: { fontSize: 10, color: colors.white40, fontWeight: '700', marginTop: 2 },
  tabLabelActive: { color: colors.orange },
})
