import {
    CategorySearchResult,
    ChannelSearchResult,
    MemberSearchResult,
    ServerSearchResult,
} from '@/services/searchTypes';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

type SearchResultItemType = 'server' | 'channel' | 'category' | 'member';

interface SearchResultItemProps {
  type: SearchResultItemType;
  data: ServerSearchResult | ChannelSearchResult | CategorySearchResult | MemberSearchResult;
  onPress?: () => void;
}

export default function SearchResultItem({ type, data, onPress }: SearchResultItemProps) {
  const getIcon = (): { name: keyof typeof Ionicons.glyphMap; color: string } => {
    switch (type) {
      case 'server':
        return { name: 'server-outline', color: '#5865F2' };
      case 'channel':
        const channelData = data as ChannelSearchResult;
        return channelData.type === 'VOICE'
          ? { name: 'volume-high-outline', color: '#3BA55C' }
          : { name: 'chatbubble-outline', color: '#72767d' };
      case 'category':
        return { name: 'folder-outline', color: '#FAA61A' };
      case 'member':
        return { name: 'person-outline', color: '#EB459E' };
      default:
        return { name: 'help-circle-outline', color: '#72767d' };
    }
  };

  const getTitle = (): string => {
    switch (type) {
      case 'server':
        return (data as ServerSearchResult).name;
      case 'channel':
        return `#${(data as ChannelSearchResult).name}`;
      case 'category':
        return (data as CategorySearchResult).name;
      case 'member':
        const member = data as MemberSearchResult;
        return member.displayName || member.userName;
      default:
        return '';
    }
  };

  const getSubtitle = (): string => {
    switch (type) {
      case 'server':
        const server = data as ServerSearchResult;
        return server.description || `${server.memberCount} thành viên`;
      case 'channel':
        const channel = data as ChannelSearchResult;
        return channel.serverName + (channel.categoryName ? ` • ${channel.categoryName}` : '');
      case 'category':
        const category = data as CategorySearchResult;
        return `${category.serverName} • ${category.channelCount} kênh`;
      case 'member':
        const memberData = data as MemberSearchResult;
        return `@${memberData.userName} • ${memberData.role}`;
      default:
        return '';
    }
  };

  const icon = getIcon();

  return (
    <TouchableOpacity
      className="flex-row items-center px-4 py-3 bg-discord-dark active:bg-discord-darker"
      onPress={onPress}
    >
      {/* Icon */}
      <View className="w-10 h-10 rounded-full bg-discord-darker items-center justify-center">
        <Ionicons name={icon.name} size={20} color={icon.color} />
      </View>

      {/* Content */}
      <View className="flex-1 ml-3">
        <Text className="text-discord-text text-base font-medium" numberOfLines={1}>
          {getTitle()}
        </Text>
        <Text className="text-discord-muted text-sm mt-0.5" numberOfLines={1}>
          {getSubtitle()}
        </Text>
      </View>

      {/* Arrow */}
      <Ionicons name="chevron-forward" size={20} color="#72767d" />
    </TouchableOpacity>
  );
}
