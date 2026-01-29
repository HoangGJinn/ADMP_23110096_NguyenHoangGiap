import { DiscordColors } from '@/constants/discord-theme';
import { AuthProvider } from '@/contexts/AuthContext';
import { store } from '@/store/redux/store';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { Provider } from 'react-redux';
import "../global.css";

export default function RootLayout() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: DiscordColors.background },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="auth" />
          <Stack.Screen name="(app)" />
          <Stack.Screen name="home" />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="light" />
      </AuthProvider>
    </Provider>
  );
}
