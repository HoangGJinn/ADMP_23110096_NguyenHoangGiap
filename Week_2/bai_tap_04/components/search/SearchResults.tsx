import {
    CategorySearchResult,
    ChannelSearchResult,
    MemberSearchResult,
    SearchFilterType,
    SearchResponse,
    ServerSearchResult,
} from '@/services/searchTypes';
import React from 'react';
import { ActivityIndicator, FlatList, SectionList, Text, View } from 'react-native';
import SearchResultItem from './SearchResultItem';

interface SearchResultsProps {
  results: SearchResponse | null;
  filter: SearchFilterType;
  isLoading: boolean;
  error: string | null;
  keyword: string;
  onServerPress?: (server: ServerSearchResult) => void;
  onChannelPress?: (channel: ChannelSearchResult) => void;
  onCategoryPress?: (category: CategorySearchResult) => void;
  onMemberPress?: (member: MemberSearchResult) => void;
}

interface SectionData {
  title: string;
  type: 'server' | 'channel' | 'category' | 'member';
  data: (ServerSearchResult | ChannelSearchResult | CategorySearchResult | MemberSearchResult)[];
}

export default function SearchResults({
  results,
  filter,
  isLoading,
  error,
  keyword,
  onServerPress,
  onChannelPress,
  onCategoryPress,
  onMemberPress,
}: SearchResultsProps) {
  // Loading state
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-discord-dark">
        <ActivityIndicator size="large" color="#5865F2" />
        <Text className="text-discord-muted mt-3">Đang tìm kiếm...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-discord-dark px-6">
        <Text className="text-discord-error text-center">{error}</Text>
      </View>
    );
  }

  // Empty keyword
  if (!keyword) {
    return (
      <View className="flex-1 items-center justify-center bg-discord-dark px-6">
        <Text className="text-discord-muted text-center text-base">
          Nhập từ khóa để bắt đầu tìm kiếm
        </Text>
      </View>
    );
  }

  // No results
  if (!results || (
    results.servers.length === 0 &&
    results.channels.length === 0 &&
    results.categories.length === 0 &&
    results.members.length === 0
  )) {
    return (
      <View className="flex-1 items-center justify-center bg-discord-dark px-6">
        <Text className="text-discord-muted text-center text-base">
          Không tìm thấy kết quả cho "{keyword}"
        </Text>
      </View>
    );
  }

  const handleItemPress = (
    type: 'server' | 'channel' | 'category' | 'member',
    item: ServerSearchResult | ChannelSearchResult | CategorySearchResult | MemberSearchResult
  ) => {
    switch (type) {
      case 'server':
        onServerPress?.(item as ServerSearchResult);
        break;
      case 'channel':
        onChannelPress?.(item as ChannelSearchResult);
        break;
      case 'category':
        onCategoryPress?.(item as CategorySearchResult);
        break;
      case 'member':
        onMemberPress?.(item as MemberSearchResult);
        break;
    }
  };

  // Filter-specific single list
  if (filter !== 'all') {
    let data: (ServerSearchResult | ChannelSearchResult | CategorySearchResult | MemberSearchResult)[] = [];
    let type: 'server' | 'channel' | 'category' | 'member' = 'server';

    switch (filter) {
      case 'servers':
        data = results.servers;
        type = 'server';
        break;
      case 'channels':
        data = results.channels;
        type = 'channel';
        break;
      case 'categories':
        data = results.categories;
        type = 'category';
        break;
      case 'members':
        data = results.members;
        type = 'member';
        break;
    }

    return (
      <FlatList
        className="flex-1 bg-discord-dark"
        data={data}
        keyExtractor={(item) => `${type}-${item.id}`}
        renderItem={({ item }) => (
          <SearchResultItem
            type={type}
            data={item}
            onPress={() => handleItemPress(type, item)}
          />
        )}
        ItemSeparatorComponent={() => <View className="h-px bg-discord-divider mx-4" />}
        ListEmptyComponent={
          <View className="py-8 items-center">
            <Text className="text-discord-muted">Không có kết quả</Text>
          </View>
        }
      />
    );
  }

  // All filter - use SectionList
  const sections: SectionData[] = [];

  if (results.servers.length > 0) {
    sections.push({ title: 'Servers', type: 'server', data: results.servers });
  }
  if (results.channels.length > 0) {
    sections.push({ title: 'Channels', type: 'channel', data: results.channels });
  }
  if (results.categories.length > 0) {
    sections.push({ title: 'Categories', type: 'category', data: results.categories });
  }
  if (results.members.length > 0) {
    sections.push({ title: 'Members', type: 'member', data: results.members });
  }

  return (
    <SectionList
      className="flex-1 bg-discord-dark"
      sections={sections}
      keyExtractor={(item, index) => `${item.id}-${index}`}
      renderItem={({ item, section }) => (
        <SearchResultItem
          type={section.type}
          data={item}
          onPress={() => handleItemPress(section.type, item)}
        />
      )}
      renderSectionHeader={({ section }) => (
        <View className="px-4 py-2 bg-discord-darker">
          <Text className="text-discord-muted text-xs font-bold uppercase tracking-wide">
            {section.title}
          </Text>
        </View>
      )}
      ItemSeparatorComponent={() => <View className="h-px bg-discord-divider mx-4" />}
      stickySectionHeadersEnabled
    />
  );
}
