import { DiscordColors, FontSizes, Spacing } from '@/constants/discord-theme';
import { FriendshipInfo, friendService } from '@/services/friendService';
import { dmService } from '@/services/dmService';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Tab = 'friends' | 'received' | 'sent';

const getAvatarColor = (name: string) => {
    const colors = ['#5865F2', '#3BA55C', '#FAA61A', '#ED4245', '#9B84EE', '#EB459E'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
};

export default function FriendsScreen() {
    const [activeTab, setActiveTab] = useState<Tab>('friends');
    const [friends, setFriends] = useState<FriendshipInfo[]>([]);
    const [received, setReceived] = useState<FriendshipInfo[]>([]);
    const [sent, setSent] = useState<FriendshipInfo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processingIds, setProcessingIds] = useState<Set<number>>(new Set());

    const loadAll = useCallback(async () => {
        setIsLoading(true);
        try {
            const [f, r, s] = await Promise.all([
                friendService.getFriends().catch(() => []),
                friendService.getPendingRequests().catch(() => []),
                friendService.getSentRequests().catch(() => []),
            ]);
            setFriends(f);
            setReceived(r);
            setSent(s);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { loadAll(); }, [loadAll]);

    const setProcessing = (id: number, val: boolean) => {
        setProcessingIds(prev => { const n = new Set(prev); val ? n.add(id) : n.delete(id); return n; });
    };

    const handleAccept = async (f: FriendshipInfo) => {
        setProcessing(f.id, true);
        try {
            await friendService.acceptRequest(f.id);
            await loadAll();
        } catch (e: any) { Alert.alert('Lỗi', e?.message || 'Không thể chấp nhận'); }
        finally { setProcessing(f.id, false); }
    };

    const handleReject = async (f: FriendshipInfo) => {
        setProcessing(f.id, true);
        try {
            await friendService.rejectRequest(f.id);
            setReceived(prev => prev.filter(x => x.id !== f.id));
        } catch (e: any) { Alert.alert('Lỗi', e?.message || 'Không thể từ chối'); }
        finally { setProcessing(f.id, false); }
    };

    const handleCancel = async (f: FriendshipInfo) => {
        setProcessing(f.id, true);
        try {
            await friendService.cancelRequest(f.id);
            setSent(prev => prev.filter(x => x.id !== f.id));
        } catch (e: any) { Alert.alert('Lỗi', e?.message || 'Không thể hủy'); }
        finally { setProcessing(f.id, false); }
    };

    const handleUnfriend = (f: FriendshipInfo) => {
        Alert.alert('Xóa bạn bè', `Bạn có chắc muốn xóa ${f.receiverDisplayName}?`, [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'Xóa', style: 'destructive',
                onPress: async () => {
                    setProcessing(f.id, true);
                    try { await friendService.unfriend(f.id); setFriends(prev => prev.filter(x => x.id !== f.id)); }
                    catch (e: any) { Alert.alert('Lỗi', e?.message || 'Không thể xóa bạn'); }
                    finally { setProcessing(f.id, false); }
                }
            }
        ]);
    };

    const handleOpenDM = async (userId: number) => {
        try {
            const conv = await dmService.initConversation(userId);
            router.push(`/dm/${conv.id}`);
        } catch (e: any) { Alert.alert('Lỗi', e?.message || 'Không thể mở chat'); }
    };

    // === RENDER FUNCTIONS ===
    const renderFriend = ({ item }: { item: FriendshipInfo }) => {
        const name = item.receiverDisplayName || item.receiverUsername;
        const color = getAvatarColor(name);
        const isProcessing = processingIds.has(item.id);

        return (
            <View style={styles.userItem}>
                <View style={[styles.avatar, { backgroundColor: color }]}>
                    <Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.userInfo}>
                    <Text style={styles.displayName}>{name}</Text>
                    <Text style={styles.username}>@{item.receiverUsername}</Text>
                </View>
                {isProcessing ? <ActivityIndicator size="small" color={DiscordColors.blurple} /> : (
                    <View style={styles.actionRow}>
                        <TouchableOpacity style={[styles.iconBtn, { backgroundColor: '#5865F2' }]} onPress={() => handleOpenDM(item.receiverId)}>
                            <Ionicons name="chatbubble-outline" size={16} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.iconBtn, { backgroundColor: DiscordColors.error }]} onPress={() => handleUnfriend(item)}>
                            <Ionicons name="person-remove-outline" size={16} color="#fff" />
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        );
    };

    const renderReceived = ({ item }: { item: FriendshipInfo }) => {
        const name = item.senderDisplayName || item.senderUsername;
        const color = getAvatarColor(name);
        const isProcessing = processingIds.has(item.id);

        return (
            <View style={styles.userItem}>
                <View style={[styles.avatar, { backgroundColor: color }]}>
                    <Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.userInfo}>
                    <Text style={styles.displayName}>{name}</Text>
                    <Text style={styles.username}>@{item.senderUsername}</Text>
                    <Text style={styles.pendingLabel}>Muốn kết bạn với bạn</Text>
                </View>
                {isProcessing ? <ActivityIndicator size="small" color={DiscordColors.blurple} /> : (
                    <View style={styles.actionRow}>
                        <TouchableOpacity style={[styles.iconBtn, { backgroundColor: '#3BA55C' }]} onPress={() => handleAccept(item)}>
                            <Ionicons name="checkmark" size={16} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.iconBtn, { backgroundColor: DiscordColors.error }]} onPress={() => handleReject(item)}>
                            <Ionicons name="close" size={16} color="#fff" />
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        );
    };

    const renderSent = ({ item }: { item: FriendshipInfo }) => {
        const name = item.receiverDisplayName || item.receiverUsername;
        const color = getAvatarColor(name);
        const isProcessing = processingIds.has(item.id);

        return (
            <View style={styles.userItem}>
                <View style={[styles.avatar, { backgroundColor: color }]}>
                    <Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.userInfo}>
                    <Text style={styles.displayName}>{name}</Text>
                    <Text style={styles.username}>@{item.receiverUsername}</Text>
                    <Text style={styles.pendingLabel}>Đang chờ xác nhận</Text>
                </View>
                {isProcessing ? <ActivityIndicator size="small" color={DiscordColors.blurple} /> : (
                    <TouchableOpacity style={[styles.iconBtn, { backgroundColor: DiscordColors.textMuted }]} onPress={() => handleCancel(item)}>
                        <Ionicons name="close" size={16} color="#fff" />
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    const currentData = activeTab === 'friends' ? friends : activeTab === 'received' ? received : sent;
    const renderItem = activeTab === 'friends' ? renderFriend : activeTab === 'received' ? renderReceived : renderSent;

    const tabs: { key: Tab; label: string; count: number }[] = [
        { key: 'friends', label: 'Bạn bè', count: friends.length },
        { key: 'received', label: 'Chờ xác nhận', count: received.length },
        { key: 'sent', label: 'Đã gửi', count: sent.length },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color={DiscordColors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Bạn bè</Text>
            </View>

            {/* Tabs */}
            <View style={styles.tabs}>
                {tabs.map(tab => (
                    <TouchableOpacity
                        key={tab.key}
                        style={[styles.tab, activeTab === tab.key && styles.tabActive]}
                        onPress={() => setActiveTab(tab.key)}
                    >
                        <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                            {tab.label}
                            {tab.count > 0 && ` (${tab.count})`}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {isLoading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={DiscordColors.blurple} />
                </View>
            ) : currentData.length === 0 ? (
                <View style={styles.center}>
                    <Ionicons name="people-outline" size={64} color={DiscordColors.textMuted} />
                    <Text style={styles.emptyText}>
                        {activeTab === 'friends' ? 'Chưa có bạn bè nào' :
                         activeTab === 'received' ? 'Không có lời mời nào' : 'Chưa gửi lời mời nào'}
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={currentData}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={renderItem as any}
                    contentContainerStyle={styles.list}
                    onRefresh={loadAll}
                    refreshing={isLoading}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: DiscordColors.backgroundDark },
    header: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
        borderBottomWidth: 1, borderBottomColor: DiscordColors.divider,
    },
    backBtn: { padding: Spacing.xs },
    headerTitle: {
        flex: 1, fontSize: FontSizes.lg, fontWeight: '700',
        color: DiscordColors.textPrimary, marginLeft: Spacing.sm,
    },
    tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: DiscordColors.divider },
    tab: { flex: 1, paddingVertical: Spacing.md, alignItems: 'center' },
    tabActive: { borderBottomWidth: 2, borderBottomColor: DiscordColors.blurple },
    tabText: { fontSize: FontSizes.sm, color: DiscordColors.textMuted, fontWeight: '500' },
    tabTextActive: { color: DiscordColors.blurple, fontWeight: '700' },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: Spacing.xl },
    emptyText: { fontSize: FontSizes.md, color: DiscordColors.textMuted, textAlign: 'center' },
    list: { padding: Spacing.md },
    userItem: {
        flexDirection: 'row', alignItems: 'center',
        paddingVertical: Spacing.sm,
        borderBottomWidth: 1, borderBottomColor: DiscordColors.divider,
    },
    avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    avatarText: { color: '#fff', fontWeight: '700', fontSize: FontSizes.md },
    userInfo: { flex: 1, marginLeft: Spacing.md },
    displayName: { fontSize: FontSizes.md, fontWeight: '600', color: DiscordColors.textPrimary },
    username: { fontSize: FontSizes.sm, color: DiscordColors.textMuted },
    pendingLabel: { fontSize: FontSizes.xs, color: DiscordColors.textMuted, fontStyle: 'italic', marginTop: 2 },
    actionRow: { flexDirection: 'row', gap: 8 },
    iconBtn: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
});
