import { DiscordColors } from '@/constants/discord-theme';
import { Stack } from 'expo-router';

export default function FriendsLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: DiscordColors.background },
                animation: 'slide_from_right',
            }}
        >
            <Stack.Screen name="index" />
        </Stack>
    );
}
