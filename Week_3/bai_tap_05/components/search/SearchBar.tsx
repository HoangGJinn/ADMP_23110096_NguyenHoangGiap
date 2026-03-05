import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useState } from 'react';
import { TextInput, TouchableOpacity, View } from 'react-native';

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onSearch: (keyword: string) => void;
  debounceMs?: number;
  autoFocus?: boolean;
}

export default function SearchBar({
  placeholder = 'Tìm kiếm...',
  value = '',
  onSearch,
  debounceMs = 300,
  autoFocus = false,
}: SearchBarProps) {
  const [searchText, setSearchText] = useState(value);
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleChangeText = useCallback(
    (text: string) => {
      setSearchText(text);

      // Clear previous timeout
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }

      // Set new debounce timeout
      const timeout = setTimeout(() => {
        onSearch(text.trim());
      }, debounceMs);

      setDebounceTimeout(timeout);
    },
    [debounceTimeout, debounceMs, onSearch]
  );

  const handleClear = useCallback(() => {
    setSearchText('');
    onSearch('');
  }, [onSearch]);

  return (
    <View className="flex-row items-center bg-discord-darker rounded-lg px-3 py-2 mx-3 my-2">
      {/* Search Icon */}
      <Ionicons name="search" size={20} color="#72767d" />

      {/* Text Input */}
      <TextInput
        className="flex-1 text-discord-text text-base ml-2 py-1"
        placeholder={placeholder}
        placeholderTextColor="#72767d"
        value={searchText}
        onChangeText={handleChangeText}
        autoFocus={autoFocus}
        returnKeyType="search"
        onSubmitEditing={() => onSearch(searchText.trim())}
      />

      {/* Clear Button */}
      {searchText.length > 0 && (
        <TouchableOpacity onPress={handleClear} className="p-1">
          <Ionicons name="close-circle" size={20} color="#72767d" />
        </TouchableOpacity>
      )}
    </View>
  );
}
