import ChannelList from '@/components/discord/ChannelList';
import RoomHeader from '@/components/discord/RoomHeader';
import ServerSidebar from '@/components/discord/ServerSidebar';
import AddServerModal from '@/components/server/AddServerModal';
import CreateServerModal from '@/components/server/CreateServerModal';
import JoinServerModal from '@/components/server/JoinServerModal';
import { useAuth } from '@/contexts/AuthContext';
import {
  CategoryResponse,
  ChannelResponse,
  deleteServer,
  getMyServers,
  getServerDetails,
  leaveServer,
  ServerResponse,
} from '@/services/serverService';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearPendingNavigation } from '@/store/redux/slices/navigationSlice';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import { Alert, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeTab() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  
  // Get pending navigation from Redux
  const { pendingServerId, pendingChannelId } = useAppSelector((state) => state.navigation);
  
  // Refs to prevent multiple fetches
  const isFetching = useRef(false);
  
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

  // Modal states
  const [showAddServerModal, setShowAddServerModal] = useState(false);
  const [showCreateServerModal, setShowCreateServerModal] = useState(false);
  const [showJoinServerModal, setShowJoinServerModal] = useState(false);

  // Fetch servers function
  const fetchServers = useCallback(async () => {
    try {
      setIsLoadingServers(true);
      const myServers = await getMyServers();
      setServers(myServers);
      return myServers;
    } catch (error) {
      console.error('Error fetching servers:', error);
      return [];
    } finally {
      setIsLoadingServers(false);
    }
  }, []);

  // Fetch server details function
  const fetchServerDetails = useCallback(async (server: ServerResponse, channelIdToSelect?: number | null) => {
    if (isFetching.current) return;
    
    try {
      isFetching.current = true;
      setIsLoadingServerDetails(true);
      setActiveServer(server);
      
      // Fetch full server details with categories and channels
      const details = await getServerDetails(server.id);
      setCategories(details.categories || []);
      setChannels(details.channels || []);
      
      // If a specific channel was requested, select it
      if (channelIdToSelect) {
        const allChannels = [
          ...(details.channels || []),
          ...(details.categories?.flatMap(c => c.channels || []) || []),
        ];
        const targetChannel = allChannels.find(ch => ch.id === channelIdToSelect);
        if (targetChannel) {
          setActiveChannelId(targetChannel.id);
          return;
        }
      }
      
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
      isFetching.current = false;
    }
  }, []);

  // Handle server creation/join success
  const handleServerChange = useCallback(async () => {
    const myServers = await fetchServers();
    // Select the first server (usually the new one for create, or the joined one)
    if (myServers.length > 0) {
      fetchServerDetails(myServers[0]);
    }
  }, [fetchServers, fetchServerDetails]);

  // Handle delete/leave server
  const handleServerLongPress = useCallback((server: ServerResponse) => {
    const isOwner = server.ownerId === Number(user?.userId);
    
    Alert.alert(
      server.name,
      isOwner ? 'Bạn là chủ sở hữu server này' : 'Tùy chọn server',
      [
        { text: 'Hủy', style: 'cancel' },
        ...(isOwner ? [
          {
            text: 'Xóa Server',
            style: 'destructive' as const,
            onPress: () => confirmDeleteServer(server),
          },
        ] : [
          {
            text: 'Rời Server',
            style: 'destructive' as const,
            onPress: () => confirmLeaveServer(server),
          },
        ]),
      ]
    );
  }, [user]);

  const confirmDeleteServer = (server: ServerResponse) => {
    Alert.alert(
      'Xóa Server',
      `Bạn có chắc chắn muốn xóa "${server.name}"? Hành động này không thể hoàn tác.`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteServer(server.id);
              Alert.alert('Thành công', 'Đã xóa server');
              handleServerChange();
            } catch (error) {
              Alert.alert('Lỗi', error instanceof Error ? error.message : 'Không thể xóa server');
            }
          },
        },
      ]
    );
  };

  const confirmLeaveServer = (server: ServerResponse) => {
    Alert.alert(
      'Rời Server',
      `Bạn có chắc chắn muốn rời khỏi "${server.name}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Rời',
          style: 'destructive',
          onPress: async () => {
            try {
              await leaveServer(server.id);
              Alert.alert('Thành công', 'Đã rời khỏi server');
              handleServerChange();
            } catch (error) {
              Alert.alert('Lỗi', error instanceof Error ? error.message : 'Không thể rời server');
            }
          },
        },
      ]
    );
  };

  // Use useFocusEffect to handle both initial load and returning from search
  useFocusEffect(
    useCallback(() => {
      const handleFocus = async () => {
        // Check if there's a pending server from search navigation
        if (pendingServerId) {
          console.log('Processing pending server:', pendingServerId);
          
          // If we already have servers loaded, find and select the pending one
          if (servers.length > 0) {
            const targetServer = servers.find(s => s.id === pendingServerId);
            if (targetServer) {
              console.log('Selecting server:', targetServer.name);
              await fetchServerDetails(targetServer, pendingChannelId);
              dispatch(clearPendingNavigation());
              return;
            }
          }
          
          // If servers not loaded yet, fetch them and then select
          try {
            setIsLoadingServers(true);
            const myServers = await getMyServers();
            setServers(myServers);
            
            const targetServer = myServers.find(s => s.id === pendingServerId);
            if (targetServer) {
              console.log('Selecting server after fetch:', targetServer.name);
              await fetchServerDetails(targetServer, pendingChannelId);
            } else if (myServers.length > 0) {
              await fetchServerDetails(myServers[0]);
            }
            dispatch(clearPendingNavigation());
          } catch (error) {
            console.error('Error fetching servers:', error);
          } finally {
            setIsLoadingServers(false);
          }
          return;
        }
        
        // Normal case: no pending server, just load if not loaded
        if (servers.length === 0) {
          try {
            setIsLoadingServers(true);
            const myServers = await getMyServers();
            setServers(myServers);
            
            if (myServers.length > 0 && !activeServer) {
              await fetchServerDetails(myServers[0]);
            }
          } catch (error) {
            console.error('Error fetching servers:', error);
          } finally {
            setIsLoadingServers(false);
          }
        }
      };

      handleFocus();
    }, [pendingServerId, pendingChannelId, servers, activeServer, dispatch, fetchServerDetails])
  );

  const handleServerPress = useCallback(async (server: ServerResponse) => {
    if (server.id === activeServer?.id) return; // Don't refetch same server
    fetchServerDetails(server);
  }, [fetchServerDetails, activeServer]);

  const handleChannelPress = useCallback((channel: ChannelResponse) => {
    if (channel.type === 'TEXT') {
      setActiveChannelId(channel.id);
    }
  }, []);

  const handleSearchPress = useCallback(() => {
    console.log('HomeTab: Navigating to search...');
    router.push('/search');
  }, [router]);

  const handleAddServerPress = useCallback(() => {
    setShowAddServerModal(true);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-discord-darker" edges={['top']}>
      <View className="flex-1 flex-row">
        {/* Server Sidebar */}
        <ServerSidebar
          servers={servers}
          activeServerId={activeServer?.id || null}
          onServerPress={handleServerPress}
          onServerLongPress={handleServerLongPress}
          onAddServerPress={handleAddServerPress}
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

      {/* Modals */}
      <AddServerModal
        visible={showAddServerModal}
        onClose={() => setShowAddServerModal(false)}
        onCreateServer={() => setShowCreateServerModal(true)}
        onJoinServer={() => setShowJoinServerModal(true)}
      />

      <CreateServerModal
        visible={showCreateServerModal}
        onClose={() => setShowCreateServerModal(false)}
        onSuccess={handleServerChange}
      />

      <JoinServerModal
        visible={showJoinServerModal}
        onClose={() => setShowJoinServerModal(false)}
        onSuccess={handleServerChange}
      />
    </SafeAreaView>
  );
}