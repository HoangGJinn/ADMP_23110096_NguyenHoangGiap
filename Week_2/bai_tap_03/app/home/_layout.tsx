import { DiscordColors } from '@/constants/discord-theme';
import { Stack } from 'expo-router';

export default function HomeLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: DiscordColors.backgroundDark },
      }}
    >
      <Stack.Screen name="index" />
    </Stack>
  );
}
