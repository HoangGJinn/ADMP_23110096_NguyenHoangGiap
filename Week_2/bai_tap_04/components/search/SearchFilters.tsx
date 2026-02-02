import { SearchFilterType } from '@/services/searchTypes';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

interface FilterOption {
  key: SearchFilterType;
  label: string;
}

const FILTER_OPTIONS: FilterOption[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'servers', label: 'Servers' },
  { key: 'channels', label: 'Channels' },
  { key: 'categories', label: 'Categories' },
  { key: 'members', label: 'Members' },
];

interface SearchFiltersProps {
  activeFilter: SearchFilterType;
  onFilterChange: (filter: SearchFilterType) => void;
  showMemberFilter?: boolean; // Only show when a server is selected
}

export default function SearchFilters({
  activeFilter,
  onFilterChange,
  showMemberFilter = false,
}: SearchFiltersProps) {
  const filters = showMemberFilter
    ? FILTER_OPTIONS
    : FILTER_OPTIONS.filter((f) => f.key !== 'members');

  return (
    <View className="border-b border-discord-divider">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 12 }}
        className="py-2"
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            onPress={() => onFilterChange(filter.key)}
            className={`px-4 py-2 rounded-full mr-2 ${
              activeFilter === filter.key
                ? 'bg-discord-primary'
                : 'bg-discord-darker'
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                activeFilter === filter.key
                  ? 'text-white'
                  : 'text-discord-muted'
              }`}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
