import ChannelList from '@/components/discord/ChannelList';
import RoomHeader from '@/components/discord/RoomHeader';
import ServerSidebar from '@/components/discord/ServerSidebar';
import {
    CategoryResponse,
    ChannelResponse,
    getMyServers,
    getServerDetails,
    ServerResponse,
} from '@/services/serverService';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const router = useRouter();
  
  // Server list state
  const [servers, setServers] = useState<ServerResponse[]>([]);
  const [isLoadingServers, setIsLoadingServers] = useState(true);
  
  // Active server state
  const [activeServer, setActiveServer] = useState<ServerResponse | null>(null);
  const [isLoadingServerDetails, setIsLoadingServerDetails] = useState(false);
  
  // Channels state
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [channels, setChannels] = useState<ChannelResponse[]>([]);
  const [activeChannelId, setActiveChannelId] = useState<number | null>(null);

  // Fetch servers on mount
  useEffect(() => {
    const fetchServers = async () => {
      try {
        setIsLoadingServers(true);
        const myServers = await getMyServers();
        setServers(myServers);
        
        // Auto-select first server if available
        if (myServers.length > 0) {
          handleServerPress(myServers[0]);
        }
      } catch (error) {
        console.error('Error fetching servers:', error);
      } finally {
        setIsLoadingServers(false);
      }
    };

    fetchServers();
  }, []);

  // Fetch server details when active server changes
  const handleServerPress = useCallback(async (server: ServerResponse) => {
    try {
      setIsLoadingServerDetails(true);
      setActiveServer(server);
      
      // Fetch full server details with categories and channels
      const details = await getServerDetails(server.id);
      setCategories(details.categories || []);
      setChannels(details.channels || []);
      
      // Auto-select first text channel
      const firstTextChannel = details.categories
        ?.flatMap(c => c.channels || [])
        .find(ch => ch.type === 'TEXT') || 
        details.channels?.find(ch => ch.type === 'TEXT');
      
      if (firstTextChannel) {
        setActiveChannelId(firstTextChannel.id);
      }
    } catch (error) {
      console.error('Error fetching server details:', error);
    } finally {
      setIsLoadingServerDetails(false);
    }
  }, []);

  const handleChannelPress = useCallback((channel: ChannelResponse) => {
    if (channel.type === 'TEXT') {
      setActiveChannelId(channel.id);
    }
  }, []);

  const handleSearchPress = useCallback(() => {
    console.log('HomeScreen: Navigating to search...');
    router.push('/search');
  }, [router]);

  return (
    <SafeAreaView className="flex-1 bg-discord-darker" edges={['top']}>
      <View className="flex-1 flex-row">
        {/* Server Sidebar */}
        <ServerSidebar
          servers={servers}
          activeServerId={activeServer?.id || null}
          onServerPress={handleServerPress}
          isLoading={isLoadingServers}
        />

        {/* Main Content */}
        <View className="flex-1 bg-discord-dark">
          <RoomHeader 
            serverName={activeServer?.name || 'Discord'} 
            onSearchPress={handleSearchPress}
          />
          <ChannelList
            categories={categories}
            channels={channels}
            activeChannelId={activeChannelId}
            onChannelPress={handleChannelPress}
            isLoading={isLoadingServerDetails}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}


