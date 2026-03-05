import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ChannelItemProps {
  name: string;
  type: 'text' | 'voice';
  active?: boolean;
  onPress?: () => void;
}

export default function ChannelItem({ name, type, active, onPress }: ChannelItemProps) {
  return (
    <TouchableOpacity
      style={[styles.row, active && styles.rowActive]}
      onPress={() => {
        console.log('📌 ChannelItem onPress:', name);
        onPress?.();
      }}
      activeOpacity={0.7}
    >
      <Ionicons
        name={type === 'text' ? 'chatbubble-outline' : 'volume-high-outline'}
        size={18}
        color={active ? '#ffffff' : '#72767d'}
      />
      <Text style={[styles.name, active && styles.nameActive]} numberOfLines={1}>
        {name}
      </Text>

      {active && (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="person-add-outline" size={14} color="#b9bbbe" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="settings-outline" size={14} color="#b9bbbe" />
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 8,
    borderRadius: 6,
  },
  rowActive: {
    backgroundColor: '#35373C',
  },
  name: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#72767d',
  },
  nameActive: {
    color: '#ffffff',
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    marginLeft: 8,
  },
  iconBtn: {
    padding: 4,
    marginLeft: 2,
  },
});
