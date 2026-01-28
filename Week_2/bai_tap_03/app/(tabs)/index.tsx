import ChannelList from '@/components/discord/ChannelList';
import RoomHeader from '@/components/discord/RoomHeader';
import ServerSidebar from '@/components/discord/ServerSidebar';
import { currentServer, Server } from '@/constants/mock-data';
import React, { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeTab() {
  const [activeServer, setActiveServer] = useState<Server>(currentServer);
  const [activeChannelId, setActiveChannelId] = useState<string>('1');

  const handleServerPress = (server: Server) => {
    setActiveServer(server);
    setActiveChannelId('1');
  };

  const handleChannelPress = (channelId: string, type: 'text' | 'voice') => {
    if (type === 'text') {
      setActiveChannelId(channelId);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-discord-darker" edges={['top']}>
      <View className="flex-1 flex-row">
        {/* Server Sidebar */}
        <ServerSidebar
          activeServerId={activeServer.id}
          onServerPress={handleServerPress}
        />

        {/* Main Content */}
        <View className="flex-1 bg-discord-dark">
          <RoomHeader serverName={activeServer.name} />
          <ChannelList
            activeChannelId={activeChannelId}
            onChannelPress={handleChannelPress}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}