import { CategoryResponse, ChannelResponse } from '@/services/serverService';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import ChannelItem from './ChannelItem';

interface ChannelListProps {
  categories: CategoryResponse[];
  channels: ChannelResponse[]; // Channels without category
  onChannelPress?: (channel: ChannelResponse) => void;
  activeChannelId?: number | null;
  isLoading?: boolean;
}

export default function ChannelList({
  categories,
  channels,
  onChannelPress,
  activeChannelId,
  isLoading = false,
}: ChannelListProps) {
  // Track expanded state for each category
  const [expandedCategories, setExpandedCategories] = useState<Record<number, boolean>>({});

  const toggleCategory = (categoryId: number) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: prev[categoryId] === undefined ? false : !prev[categoryId]
    }));
  };

  const isCategoryExpanded = (categoryId: number) => {
    return expandedCategories[categoryId] !== false; // Default to expanded
  };

  // Group channels by type for uncategorized channels
  const uncategorizedTextChannels = channels.filter(c => c.type === 'TEXT' && !c.categoryId);
  const uncategorizedVoiceChannels = channels.filter(c => c.type === 'VOICE' && !c.categoryId);

  if (isLoading) {
    return (
      <View className="flex-1 bg-discord-dark items-center justify-center">
        <ActivityIndicator size="large" color="#5865F2" />
        <Text className="text-discord-muted mt-2">Đang tải...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-discord-dark" showsVerticalScrollIndicator={false}>
      {/* Render Categories with their channels */}
      {categories.map((category) => {
        const textChannels = category.channels?.filter(c => c.type === 'TEXT') || [];
        const voiceChannels = category.channels?.filter(c => c.type === 'VOICE') || [];
        const isExpanded = isCategoryExpanded(category.id);

        return (
          <View key={category.id} className="mt-3">
            <TouchableOpacity
              className="flex-row items-center px-3 py-1"
              onPress={() => toggleCategory(category.id)}
            >
              <Ionicons
                name={isExpanded ? 'chevron-down' : 'chevron-forward'}
                size={12}
                color="#72767d"
              />
              <Text className="flex-1 text-xs font-bold text-discord-muted ml-1 tracking-wide uppercase">
                {category.name}
              </Text>
              <TouchableOpacity className="p-0.5">
                <Ionicons name="add" size={16} color="#72767d" />
              </TouchableOpacity>
            </TouchableOpacity>

            {isExpanded && (
              <View className="mt-1">
                {/* Text Channels */}
                {textChannels.map((channel) => (
                  <ChannelItem
                    key={channel.id}
                    name={channel.name}
                    type="text"
                    active={activeChannelId === channel.id}
                    onPress={() => onChannelPress?.(channel)}
                  />
                ))}
                {/* Voice Channels */}
                {voiceChannels.map((channel) => (
                  <ChannelItem
                    key={channel.id}
                    name={channel.name}
                    type="voice"
                    active={activeChannelId === channel.id}
                    onPress={() => onChannelPress?.(channel)}
                  />
                ))}
              </View>
            )}
          </View>
        );
      })}

      {/* Uncategorized Text Channels */}
      {uncategorizedTextChannels.length > 0 && (
        <View className="mt-3">
          <View className="flex-row items-center px-3 py-1">
            <Ionicons name="chevron-down" size={12} color="#72767d" />
            <Text className="flex-1 text-xs font-bold text-discord-muted ml-1 tracking-wide">
              KÊNH CHAT
            </Text>
          </View>
          <View className="mt-1">
            {uncategorizedTextChannels.map((channel) => (
              <ChannelItem
                key={channel.id}
                name={channel.name}
                type="text"
                active={activeChannelId === channel.id}
                onPress={() => onChannelPress?.(channel)}
              />
            ))}
          </View>
        </View>
      )}

      {/* Uncategorized Voice Channels */}
      {uncategorizedVoiceChannels.length > 0 && (
        <View className="mt-3">
          <View className="flex-row items-center px-3 py-1">
            <Ionicons name="chevron-down" size={12} color="#72767d" />
            <Text className="flex-1 text-xs font-bold text-discord-muted ml-1 tracking-wide">
              KÊNH THOẠI
            </Text>
          </View>
          <View className="mt-1">
            {uncategorizedVoiceChannels.map((channel) => (
              <ChannelItem
                key={channel.id}
                name={channel.name}
                type="voice"
                active={activeChannelId === channel.id}
                onPress={() => onChannelPress?.(channel)}
              />
            ))}
          </View>
        </View>
      )}

      {/* Empty state */}
      {categories.length === 0 && channels.length === 0 && (
        <View className="flex-1 items-center justify-center py-8">
          <Text className="text-discord-muted">Chưa có kênh nào</Text>
        </View>
      )}
    </ScrollView>
  );
}

