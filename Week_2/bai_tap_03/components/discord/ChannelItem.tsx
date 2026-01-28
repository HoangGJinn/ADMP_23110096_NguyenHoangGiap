import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface ChannelItemProps {
  name: string;
  type: 'text' | 'voice';
  active?: boolean;
  onPress?: () => void;
}

export default function ChannelItem({ name, type, active, onPress }: ChannelItemProps) {
  return (
    <TouchableOpacity
      className={`flex-row items-center py-2 px-3 mx-2 rounded-md ${active ? 'bg-discord-light' : ''}`}
      onPress={onPress}
    >
      <Ionicons
        name={type === 'text' ? 'chatbubble-outline' : 'volume-high-outline'}
        size={18}
        color={active ? '#ffffff' : '#72767d'}
      />
      <Text
        className={`flex-1 ml-2 text-sm ${active ? 'text-discord-text font-medium' : 'text-discord-muted'}`}
        numberOfLines={1}
      >
        {name}
      </Text>
      
      {/* Hover Actions - shown on active */}
      {active && (
        <View className="flex-row ml-2">
          <TouchableOpacity className="p-1 ml-0.5">
            <Ionicons name="person-add-outline" size={14} color="#b9bbbe" />
          </TouchableOpacity>
          <TouchableOpacity className="p-1 ml-0.5">
            <Ionicons name="settings-outline" size={14} color="#b9bbbe" />
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}
