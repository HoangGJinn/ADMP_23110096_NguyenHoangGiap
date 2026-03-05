import { CategoryResponse, ChannelResponse } from '@/services/serverService';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
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
  const router = useRouter();
  const [expandedCategories, setExpandedCategories] = useState<Record<number, boolean>>({});

  const toggleCategory = (categoryId: number) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: prev[categoryId] === undefined ? false : !prev[categoryId]
    }));
  };

  const isCategoryExpanded = (categoryId: number) => {
    return expandedCategories[categoryId] !== false;
  };

  // Handle channel press — chỉ gọi callback, để parent tự navigate
  const handlePress = (channel: ChannelResponse) => {
    console.log('ChannelList.handlePress - id:', channel.id, 'name:', channel.name, 'type:', channel.type);
    if (channel.type?.toUpperCase() === 'TEXT') {
      onChannelPress?.(channel);
    }
  };


  const uncategorizedTextChannels = channels.filter(c => c.type?.toUpperCase() === 'TEXT' && !c.categoryId);
  const uncategorizedVoiceChannels = channels.filter(c => c.type?.toUpperCase() === 'VOICE' && !c.categoryId);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#2f3136', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#5865F2" />
        <Text style={{ color: '#72767d', marginTop: 8 }}>Đang tải...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#2f3136' }} showsVerticalScrollIndicator={false}>
      {/* Render Categories with their channels */}
      {categories.map((category) => {
        const textChannels = category.channels?.filter(c => c.type?.toUpperCase() === 'TEXT') || [];
        const voiceChannels = category.channels?.filter(c => c.type?.toUpperCase() === 'VOICE') || [];
        const isExpanded = isCategoryExpanded(category.id);

        return (
          <View key={category.id} style={{ marginTop: 12 }}>
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 4 }}
              onPress={() => toggleCategory(category.id)}
            >
              <Ionicons
                name={isExpanded ? 'chevron-down' : 'chevron-forward'}
                size={12}
                color="#72767d"
              />
              <Text style={{ flex: 1, fontSize: 12, fontWeight: 'bold', color: '#72767d', marginLeft: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {category.name}
              </Text>
              <TouchableOpacity style={{ padding: 2 }}>
                <Ionicons name="add" size={16} color="#72767d" />
              </TouchableOpacity>
            </TouchableOpacity>

            {isExpanded && (
              <View style={{ marginTop: 4 }}>
                {textChannels.map((channel) => (
                  <ChannelItem
                    key={channel.id}
                    name={channel.name}
                    type="text"
                    active={activeChannelId === channel.id}
                    onPress={() => handlePress(channel)}
                  />
                ))}
                {voiceChannels.map((channel) => (
                  <ChannelItem
                    key={channel.id}
                    name={channel.name}
                    type="voice"
                    active={activeChannelId === channel.id}
                    onPress={() => handlePress(channel)}
                  />
                ))}
              </View>
            )}
          </View>
        );
      })}

      {/* Uncategorized Text Channels */}
      {uncategorizedTextChannels.length > 0 && (
        <View style={{ marginTop: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 4 }}>
            <Ionicons name="chevron-down" size={12} color="#72767d" />
            <Text style={{ flex: 1, fontSize: 12, fontWeight: 'bold', color: '#72767d', marginLeft: 4, textTransform: 'uppercase' }}>
              KÊNH CHAT
            </Text>
          </View>
          <View style={{ marginTop: 4 }}>
            {uncategorizedTextChannels.map((channel) => (
              <ChannelItem
                key={channel.id}
                name={channel.name}
                type="text"
                active={activeChannelId === channel.id}
                onPress={() => handlePress(channel)}
              />
            ))}
          </View>
        </View>
      )}

      {/* Uncategorized Voice Channels */}
      {uncategorizedVoiceChannels.length > 0 && (
        <View style={{ marginTop: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 4 }}>
            <Ionicons name="chevron-down" size={12} color="#72767d" />
            <Text style={{ flex: 1, fontSize: 12, fontWeight: 'bold', color: '#72767d', marginLeft: 4, textTransform: 'uppercase' }}>
              KÊNH THOẠI
            </Text>
          </View>
          <View style={{ marginTop: 4 }}>
            {uncategorizedVoiceChannels.map((channel) => (
              <ChannelItem
                key={channel.id}
                name={channel.name}
                type="voice"
                active={activeChannelId === channel.id}
                onPress={() => handlePress(channel)}
              />
            ))}
          </View>
        </View>
      )}

      {/* Empty state */}
      {categories.length === 0 && channels.length === 0 && (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 32 }}>
          <Text style={{ color: '#72767d' }}>Chưa có kênh nào</Text>
        </View>
      )}
    </ScrollView>
  );
}
