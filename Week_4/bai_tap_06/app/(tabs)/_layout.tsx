import { DiscordColors, Spacing } from '@/constants/discord-theme';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function TabLayout() {
  const router = useRouter();
  const { user } = useAuth();

  // Generate avatar color based on username
  const getAvatarColor = (name: string) => {
    const colors = [
      '#5865F2', '#57F287', '#FEE75C', '#EB459E', '#ED4245',
      '#3BA55C', '#FAA61A', '#9B84EE', '#F47FFF', '#00D4AA',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const avatarColor = getAvatarColor(user?.userName || 'User');
  const initials = (user?.userName || 'U').charAt(0).toUpperCase();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: DiscordColors.primary,
        tabBarInactiveTintColor: DiscordColors.textMuted,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Trang chủ',
          tabBarIcon: ({ color, focused }) => (
            <View>
              <Ionicons
                name={focused ? 'home' : 'home-outline'}
                size={24}
                color={color}
              />
              {/* Notification badge example */}
              <View style={styles.notificationBadge}>
                <Text style={styles.badgeText}>1</Text>
              </View>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Thông báo',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'notifications' : 'notifications-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Bạn',
          tabBarIcon: ({ focused }) => (
            <View
              style={[
                styles.profileAvatar,
                { backgroundColor: avatarColor },
                focused && styles.profileAvatarActive,
              ]}
            >
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: DiscordColors.backgroundDarker,
    borderTopColor: DiscordColors.backgroundDark,
    borderTopWidth: 1,
    height: 60,
    paddingBottom: Spacing.xs,
    paddingTop: Spacing.xs,
  },
  tabBarLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: DiscordColors.error,
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: DiscordColors.textPrimary,
    fontSize: 10,
    fontWeight: 'bold',
  },
  profileAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatarActive: {
    borderWidth: 2,
    borderColor: DiscordColors.primary,
  },
  avatarText: {
    color: DiscordColors.textPrimary,
    fontSize: 12,
    fontWeight: 'bold',
  },
});
