import { ServerResponse } from '@/services/serverService';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';

// Color palette for servers without icons
const SERVER_COLORS = [
  '#5865F2', '#3BA55C', '#FAA61A', '#ED4245', 
  '#9B84EE', '#EB459E', '#57F287', '#FEE75C'
];

interface ServerSidebarProps {
  servers: ServerResponse[];
  activeServerId: number | null;
  onServerPress: (server: ServerResponse) => void;
  onServerLongPress?: (server: ServerResponse) => void;
  onHomePress?: () => void;
  onAddServerPress?: () => void;
  isLoading?: boolean;
}

export default function ServerSidebar({
  servers,
  activeServerId,
  onServerPress,
  onServerLongPress,
  onHomePress,
  onAddServerPress,
  isLoading = false,
}: ServerSidebarProps) {
  const getInitials = (name: string) => {
    const words = name.split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getServerColor = (serverId: number) => {
    return SERVER_COLORS[serverId % SERVER_COLORS.length];
  };

  return (
    <View className="w-[72px] bg-discord-darker py-3 items-center">
      {/* Discord Home Button */}
      <TouchableOpacity
        className="w-12 h-12 rounded-xl bg-discord-primary items-center justify-center mb-2"
        onPress={onHomePress}
      >
        <Ionicons name="logo-discord" size={28} color="#ffffff" />
      </TouchableOpacity>

      {/* Divider */}
      <View className="w-8 h-0.5 bg-discord-divider my-2 rounded-full" />

      {/* Server List */}
      <ScrollView className="flex-1 w-full px-3" showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View className="items-center py-4">
            <ActivityIndicator size="small" color="#5865F2" />
          </View>
        ) : servers.length === 0 ? (
          <View className="items-center py-4">
            <Text className="text-discord-muted text-xs text-center">
              Chưa có server
            </Text>
          </View>
        ) : (
          servers.map((server) => (
            <TouchableOpacity
              key={server.id}
              className={`w-12 h-12 items-center justify-center mb-2 self-center relative ${
                activeServerId === server.id ? 'rounded-lg' : 'rounded-xl'
              }`}
              style={{ backgroundColor: server.iconUrl ? undefined : getServerColor(server.id) }}
              onPress={() => onServerPress(server)}
              onLongPress={() => onServerLongPress?.(server)}
              delayLongPress={500}
            >
              {server.iconUrl ? (
                <View className="w-12 h-12 rounded-xl overflow-hidden">
                  {/* TODO: Add Image component when iconUrl is available */}
                  <Text className="text-discord-text text-sm font-semibold">
                    {getInitials(server.name)}
                  </Text>
                </View>
              ) : (
                <Text className="text-discord-text text-sm font-semibold">
                  {getInitials(server.name)}
                </Text>
              )}
              
              {/* Active Indicator */}
              {activeServerId === server.id && (
                <View className="absolute -left-3 w-1 h-10 bg-white rounded-r" />
              )}
            </TouchableOpacity>
          ))
        )}

        {/* Add Server Button */}
        <TouchableOpacity 
          className="w-12 h-12 rounded-xl bg-discord-light items-center justify-center mb-2 self-center mt-2"
          onPress={onAddServerPress}
        >
          <Ionicons name="add" size={24} color="#3ba55c" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

