import { DiscordColors } from '@/constants/discord-theme';
import { Stack } from 'expo-router';

export default function DMLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: DiscordColors.background },
                animation: 'slide_from_right',
            }}
        >
            <Stack.Screen name="index" />
            <Stack.Screen name="[conversationId]" />
        </Stack>
    );
}
