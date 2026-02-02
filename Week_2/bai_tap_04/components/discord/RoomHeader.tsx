import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

interface RoomHeaderProps {
  serverName: string;
  onMenuPress?: () => void;
  onSearchPress?: () => void;
}

export default function RoomHeader({
  serverName,
  onMenuPress,
  onSearchPress,
}: RoomHeaderProps) {
  const handleSearchPress = () => {
    console.log('Search button pressed!');
    if (onSearchPress) {
      onSearchPress();
    }
  };

  return (
    <View className="flex-row items-center px-3 py-3 bg-discord-dark border-b border-discord-darker">
      {/* Server Name with Dropdown */}
      <Pressable className="flex-row items-center flex-1 mr-3" onPress={onMenuPress}>
        <Text className="text-base font-bold text-discord-text mr-1" numberOfLines={1}>
          {serverName}
        </Text>
        <Ionicons name="chevron-down" size={16} color="#b9bbbe" />
      </Pressable>

      {/* Search Bar */}
      <Pressable 
        className="flex-1 flex-row items-center bg-discord-darker rounded-md px-3 py-2"
        onPress={handleSearchPress}
        style={({ pressed }) => ({
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <Text className="flex-1 text-discord-muted text-sm">
          Tìm kiếm
        </Text>
        <Ionicons name="search" size={18} color="#72767d" />
      </Pressable>

      {/* Action Icons */}
      <View className="flex-row ml-3">
        <Pressable className="p-1 ml-1">
          <Ionicons name="person-add-outline" size={22} color="#b9bbbe" />
        </Pressable>
        <Pressable className="p-1 ml-1">
          <Ionicons name="calendar-outline" size={22} color="#b9bbbe" />
        </Pressable>
      </View>
    </View>
  );
}

