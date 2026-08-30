import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { View } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { ThemeProvider } from '@/context/ThemeContext'
import { colors } from '@/theme'

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <SafeAreaProvider>
          <View style={{ flex: 1, backgroundColor: colors.bg }}>
            <StatusBar style="light" />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.bg },
              }}
            >
              <Stack.Screen name="index" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="propose" options={{ presentation: 'card' }} />
              <Stack.Screen name="rating" options={{ presentation: 'card' }} />
              <Stack.Screen name="chat" options={{ presentation: 'card' }} />
              <Stack.Screen name="admin" options={{ presentation: 'card' }} />
              <Stack.Screen name="settings" options={{ presentation: 'modal' }} />
            </Stack>
          </View>
        </SafeAreaProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  )
}
