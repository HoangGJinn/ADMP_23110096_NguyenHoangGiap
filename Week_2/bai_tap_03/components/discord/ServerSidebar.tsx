import { Server, servers } from '@/constants/mock-data';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

interface ServerSidebarProps {
  activeServerId: string;
  onServerPress: (server: Server) => void;
  onHomePress?: () => void;
}

export default function ServerSidebar({
  activeServerId,
  onServerPress,
  onHomePress,
}: ServerSidebarProps) {
  const getInitials = (name: string) => {
    const words = name.split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
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
        {servers.map((server) => (
          <TouchableOpacity
            key={server.id}
            className={`w-12 h-12 items-center justify-center mb-2 self-center relative ${
              activeServerId === server.id ? 'rounded-lg' : 'rounded-xl'
            }`}
            style={{ backgroundColor: server.color || '#5865F2' }}
            onPress={() => onServerPress(server)}
          >
            <Text className="text-discord-text text-sm font-semibold">
              {getInitials(server.name)}
            </Text>
            
            {/* Active Indicator */}
            {activeServerId === server.id && (
              <View className="absolute -left-3 w-1 h-10 bg-white rounded-r" />
            )}
            
            {/* Unread Badge */}
            {server.unread > 0 && (
              <View className="absolute -bottom-0.5 -right-0.5 bg-discord-error rounded-full min-w-[18px] h-[18px] items-center justify-center px-1 border-2 border-discord-darker">
                <Text className="text-discord-text text-[10px] font-bold">
                  {server.unread}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}

        {/* Add Server Button */}
        <TouchableOpacity className="w-12 h-12 rounded-xl bg-discord-light items-center justify-center mb-2 self-center mt-2">
          <Ionicons name="add" size={24} color="#3ba55c" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
