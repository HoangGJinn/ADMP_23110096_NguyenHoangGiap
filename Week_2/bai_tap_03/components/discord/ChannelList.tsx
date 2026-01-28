import { ChannelCategory, channels } from '@/constants/mock-data';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import ChannelItem from './ChannelItem';

interface ChannelListProps {
  channelData?: ChannelCategory;
  onChannelPress?: (channelId: string, type: 'text' | 'voice') => void;
  activeChannelId?: string;
}

export default function ChannelList({
  channelData = channels,
  onChannelPress,
  activeChannelId,
}: ChannelListProps) {
  const [textChannelsExpanded, setTextChannelsExpanded] = useState(true);
  const [voiceChannelsExpanded, setVoiceChannelsExpanded] = useState(true);

  return (
    <ScrollView className="flex-1 bg-discord-dark" showsVerticalScrollIndicator={false}>
      {/* Text Channels Category */}
      <View className="mt-3">
        <TouchableOpacity
          className="flex-row items-center px-3 py-1"
          onPress={() => setTextChannelsExpanded(!textChannelsExpanded)}
        >
          <Ionicons
            name={textChannelsExpanded ? 'chevron-down' : 'chevron-forward'}
            size={12}
            color="#72767d"
          />
          <Text className="flex-1 text-xs font-bold text-discord-muted ml-1 tracking-wide">
            KÊNH CHAT
          </Text>
          <TouchableOpacity className="p-0.5">
            <Ionicons name="add" size={16} color="#72767d" />
          </TouchableOpacity>
        </TouchableOpacity>

        {textChannelsExpanded && (
          <View className="mt-1">
            {channelData.textChannels.map((channel) => (
              <ChannelItem
                key={channel.id}
                name={channel.name}
                type="text"
                active={activeChannelId ? activeChannelId === channel.id : channel.active}
                onPress={() => onChannelPress?.(channel.id, 'text')}
              />
            ))}
          </View>
        )}
      </View>

      {/* Voice Channels Category */}
      <View className="mt-3">
        <TouchableOpacity
          className="flex-row items-center px-3 py-1"
          onPress={() => setVoiceChannelsExpanded(!voiceChannelsExpanded)}
        >
          <Ionicons
            name={voiceChannelsExpanded ? 'chevron-down' : 'chevron-forward'}
            size={12}
            color="#72767d"
          />
          <Text className="flex-1 text-xs font-bold text-discord-muted ml-1 tracking-wide">
            KÊNH THOẠI
          </Text>
          <TouchableOpacity className="p-0.5">
            <Ionicons name="add" size={16} color="#72767d" />
          </TouchableOpacity>
        </TouchableOpacity>

        {voiceChannelsExpanded && (
          <View className="mt-1">
            {channelData.voiceChannels.map((channel) => (
              <ChannelItem
                key={channel.id}
                name={channel.name}
                type="voice"
                active={false}
                onPress={() => onChannelPress?.(channel.id, 'voice')}
              />
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
