import { SearchBar, SearchFilters, SearchResults } from '@/components/search';
import { searchAll } from '@/services/searchService';
import {
    CategorySearchResult,
    ChannelSearchResult,
    MemberSearchResult,
    SearchFilterType,
    SearchResponse,
    ServerSearchResult,
} from '@/services/searchTypes';
import { useAppDispatch } from '@/store/hooks';
import { setPendingChannel, setPendingServer } from '@/store/redux/slices/navigationSlice';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface SearchScreenProps {
  serverId?: number;
}

export default function SearchScreen({ serverId }: SearchScreenProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  const [keyword, setKeyword] = useState('');
  const [filter, setFilter] = useState<SearchFilterType>('all');
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(
    async (searchKeyword: string) => {
      setKeyword(searchKeyword);
      
      if (!searchKeyword.trim()) {
        setResults(null);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const searchResults = await searchAll({
          keyword: searchKeyword,
          serverId: serverId,
        });
        setResults(searchResults);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi tìm kiếm');
        setResults(null);
      } finally {
        setIsLoading(false);
      }
    },
    [serverId]
  );

  const handleFilterChange = useCallback((newFilter: SearchFilterType) => {
    setFilter(newFilter);
  }, []);

  const handleServerPress = useCallback((server: ServerSearchResult) => {
    console.log('Server pressed:', server);
    // Set pending server in Redux and navigate to home
    dispatch(setPendingServer(server.id));
    router.replace('/(tabs)');
  }, [router, dispatch]);

  const handleChannelPress = useCallback((channel: ChannelSearchResult) => {
    console.log('Channel pressed:', channel);
    // Set pending server and channel in Redux, then navigate
    dispatch(setPendingServer(channel.serverId));
    dispatch(setPendingChannel(channel.id));
    router.replace('/(tabs)');
  }, [router, dispatch]);

  const handleCategoryPress = useCallback((category: CategorySearchResult) => {
    console.log('Category pressed:', category);
    // Set pending server and navigate
    dispatch(setPendingServer(category.serverId));
    router.replace('/(tabs)');
  }, [router, dispatch]);

  const handleMemberPress = useCallback((member: MemberSearchResult) => {
    console.log('Member pressed:', member);
    // Navigate to member profile
    router.push({
      pathname: '/member/[memberId]',
      params: {
        memberId: String(member.id),
        userId: String(member.userId),
        userName: member.userName,
        displayName: member.displayName || '',
        nickname: member.nickname || '',
        role: member.role,
        serverId: String(member.serverId),
        serverName: member.serverName,
      },
    });
  }, [router]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <SafeAreaView className="flex-1 bg-discord-dark" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center px-2 py-2 bg-discord-dark border-b border-discord-divider">
        <TouchableOpacity onPress={handleBack} className="p-2">
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text className="flex-1 text-discord-text text-lg font-semibold ml-2">
          Tìm kiếm
        </Text>
      </View>

      {/* Search Bar */}
      <SearchBar
        onSearch={handleSearch}
        autoFocus
        placeholder="Tìm kiếm servers, channels, members..."
      />

      {/* Filters */}
      <SearchFilters
        activeFilter={filter}
        onFilterChange={handleFilterChange}
        showMemberFilter={!!serverId}
      />

      {/* Results */}
      <SearchResults
        results={results}
        filter={filter}
        isLoading={isLoading}
        error={error}
        keyword={keyword}
        onServerPress={handleServerPress}
        onChannelPress={handleChannelPress}
        onCategoryPress={handleCategoryPress}
        onMemberPress={handleMemberPress}
      />
    </SafeAreaView>
  );
}
