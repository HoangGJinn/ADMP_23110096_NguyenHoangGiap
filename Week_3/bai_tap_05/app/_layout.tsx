import { DiscordColors } from '@/constants/discord-theme';
import { AuthProvider } from '@/contexts/AuthContext';
import { setStoreRef } from '@/services/storeRef';
import { store } from '@/store/redux/store';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { Provider } from 'react-redux';
import "../global.css";

// Inject store vào storeRef để apiClient dùng token — không gây circular dependency
setStoreRef(store);

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
          <Stack.Screen name="dm" options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="friends" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="chat" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="search" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="member" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="light" />
      </AuthProvider>
    </Provider>
  );
}
