import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

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
  return (
    <View className="flex-row items-center px-3 py-3 bg-discord-dark border-b border-discord-darker">
      {/* Server Name with Dropdown */}
      <TouchableOpacity className="flex-row items-center flex-1 mr-3" onPress={onMenuPress}>
        <Text className="text-base font-bold text-discord-text mr-1" numberOfLines={1}>
          {serverName}
        </Text>
        <Ionicons name="chevron-down" size={16} color="#b9bbbe" />
      </TouchableOpacity>

      {/* Search Bar */}
      <TouchableOpacity 
        className="flex-2 flex-row items-center bg-discord-darker rounded-md px-2 py-1"
        onPress={onSearchPress}
      >
        <TextInput
          className="flex-1 text-discord-text text-sm py-1"
          placeholder="Tìm kiếm"
          placeholderTextColor="#72767d"
          editable={false}
          pointerEvents="none"
        />
        <Ionicons name="search" size={18} color="#72767d" />
      </TouchableOpacity>

      {/* Action Icons */}
      <View className="flex-row ml-3">
        <TouchableOpacity className="p-1 ml-1">
          <Ionicons name="person-add-outline" size={22} color="#b9bbbe" />
        </TouchableOpacity>
        <TouchableOpacity className="p-1 ml-1">
          <Ionicons name="calendar-outline" size={22} color="#b9bbbe" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
