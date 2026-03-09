import { DiscordColors, FontSizes, Spacing } from '@/constants/discord-theme';
import { FriendshipInfo, friendService } from '@/services/friendService';
import { dmService } from '@/services/dmService';
import { RootState } from '@/store/redux/store';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AddFriendModal from '@/components/dm/AddFriendModal';

const getAvatarColor = (name: string) => {
    const colors = ['#5865F2', '#3BA55C', '#FAA61A', '#ED4245', '#9B84EE', '#EB459E'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
};

export default function DMScreen() {
    const currentUserId = useSelector((state: RootState) => state.auth.user?.userId);

    const [friends, setFriends] = useState<FriendshipInfo[]>([]);
    const [filtered, setFiltered] = useState<FriendshipInfo[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [pendingCount, setPendingCount] = useState(0);
    const [showAddFriend, setShowAddFriend] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [openingId, setOpeningId] = useState<number | null>(null);

    const loadData = useCallback(async () => {
        try {
            setIsLoading(true);
            const [friendList, pending] = await Promise.all([
                friendService.getFriends().catch(() => []),
                friendService.getPendingRequests().catch(() => []),
            ]);
            setFriends(friendList);
            setFiltered(friendList);
            setPendingCount(pending.length);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const getFriendInfo = (item: FriendshipInfo) => {
        const curId = Number(currentUserId);
        if (item.senderId === curId) {
            return { friendId: item.receiverId, friendName: item.receiverDisplayName || item.receiverUsername };
        } else {
            return { friendId: item.senderId, friendName: item.senderDisplayName || item.senderUsername };
        }
    };

    const handleFriendPress = async (item: FriendshipInfo) => {
        if (openingId) return;
        const { friendId, friendName } = getFriendInfo(item);
        setOpeningId(item.id);
        try {
            const conv = await dmService.initConversation(friendId);
            router.push({
                pathname: '/dm/[conversationId]' as any,
                params: { conversationId: conv.id, friendName, friendId: String(friendId) },
            });
        } catch (e) {
            console.error('initConversation:', e);
        } finally {
            setOpeningId(null);
        }
    };

    const handleSearch = (text: string) => {
        setSearchQuery(text);
        if (!text.trim()) {
            setFiltered(friends);
        } else {
            const q = text.toLowerCase();
            const curId = Number(currentUserId);
            setFiltered(friends.filter(f => {
                const name = (f.senderId === curId
                    ? (f.receiverDisplayName || f.receiverUsername)
                    : (f.senderDisplayName || f.senderUsername)
                ).toLowerCase();
                return name.includes(q);
            }));
        }
    };

    const renderFriend = ({ item }: { item: FriendshipInfo }) => {
        const { friendName, friendId } = getFriendInfo(item);
        const color = getAvatarColor(friendName);
        const isOpening = openingId === item.id;
        const curId = Number(currentUserId);
        const username = item.senderId === curId ? item.receiverUsername : item.senderUsername;
        return (
            <TouchableOpacity
                style={[styles.friendItem, isOpening && { opacity: 0.6 }]}
                onPress={() => handleFriendPress(item)}
                activeOpacity={0.7}
                disabled={!!openingId}
            >
                <View style={[styles.avatar, { backgroundColor: color }]}>
                    <Text style={styles.avatarText}>{friendName.charAt(0).toUpperCase()}</Text>
                    <View style={styles.onlineDot} />
                </View>
                <View style={styles.friendInfo}>
                    <Text style={styles.friendName}>{friendName}</Text>
                    <Text style={styles.friendUsername}>@{username}</Text>
                </View>
                {isOpening
                    ? <ActivityIndicator size="small" color={DiscordColors.blurple} />
                    : <Ionicons name="chatbubble-outline" size={18} color={DiscordColors.textMuted} />
                }
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color={DiscordColors.textPrimary} />
                </TouchableOpacity>

                {showSearch ? (
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Tìm kiếm bạn bè..."
                        placeholderTextColor={DiscordColors.textMuted}
                        value={searchQuery}
                        onChangeText={handleSearch}
                        autoFocus
                        autoCapitalize="none"
                    />
                ) : (
                    <Text style={styles.headerTitle}>Các tin nhắn</Text>
                )}

                <View style={styles.headerBtns}>
                    <TouchableOpacity
                        style={styles.headerBtn}
                        onPress={() => {
                            if (showSearch) {
                                setShowSearch(false);
                                setSearchQuery('');
                                setFiltered(friends);
                            } else {
                                setShowSearch(true);
                            }
                        }}
                    >
                        <Ionicons
                            name={showSearch ? 'close-outline' : 'search-outline'}
                            size={22}
                            color={DiscordColors.textPrimary}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.headerBtn} onPress={() => setShowAddFriend(true)}>
                        <Ionicons name="person-add-outline" size={22} color={DiscordColors.textPrimary} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Pending requests banner */}
            {pendingCount > 0 && (
                <TouchableOpacity style={styles.pendingBanner} onPress={() => router.push('/friends')}>
                    <View style={styles.pendingLeft}>
                        <View style={styles.pendingBadge}>
                            <Text style={styles.pendingBadgeText}>{pendingCount}</Text>
                        </View>
                        <Text style={styles.pendingText}>lời mời kết bạn đang chờ</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={DiscordColors.textMuted} />
                </TouchableOpacity>
            )}

            {/* Section header */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionLabel}>BẠN BÈ — {filtered.length}</Text>
                <TouchableOpacity onPress={() => router.push('/friends')}>
                    <Text style={styles.manageLink}>Quản lý</Text>
                </TouchableOpacity>
            </View>

            {/* Content */}
            {isLoading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={DiscordColors.blurple} />
                </View>
            ) : filtered.length === 0 ? (
                <View style={styles.center}>
                    <Ionicons name="people-outline" size={64} color={DiscordColors.textMuted} />
                    <Text style={styles.emptyTitle}>
                        {searchQuery ? 'Không tìm thấy bạn bè' : 'Chưa có bạn bè nào'}
                    </Text>
                    <Text style={styles.emptySubtitle}>
                        {searchQuery ? 'Thử từ khóa khác' : 'Nhấn nút + để thêm bạn bè!'}
                    </Text>
                    {!searchQuery && (
                        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddFriend(true)}>
                            <Ionicons name="person-add-outline" size={18} color="#fff" />
                            <Text style={styles.addBtnText}>Thêm bạn bè</Text>
                        </TouchableOpacity>
                    )}
                </View>
            ) : (
                <FlatList
                    data={filtered}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={renderFriend}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    onRefresh={loadData}
                    refreshing={isLoading}
                />
            )}

            {/* Add Friend Modal */}
            <AddFriendModal
                visible={showAddFriend}
                onClose={() => { setShowAddFriend(false); loadData(); }}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: DiscordColors.backgroundDark },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: DiscordColors.divider,
    },
    backBtn: { padding: Spacing.xs },
    headerTitle: {
        flex: 1,
        fontSize: FontSizes.lg,
        fontWeight: '700',
        color: DiscordColors.textPrimary,
        marginLeft: Spacing.sm,
    },
    searchInput: {
        flex: 1,
        fontSize: FontSizes.md,
        color: DiscordColors.textPrimary,
        marginLeft: Spacing.sm,
        backgroundColor: DiscordColors.backgroundLight,
        borderRadius: 8,
        paddingHorizontal: Spacing.sm,
        paddingVertical: 6,
    },
    headerBtns: { flexDirection: 'row', gap: 4 },
    headerBtn: { padding: Spacing.xs },
    pendingBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: DiscordColors.backgroundDarker,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: DiscordColors.divider,
    },
    pendingLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    pendingBadge: {
        backgroundColor: DiscordColors.error,
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 5,
    },
    pendingBadgeText: { color: '#fff', fontSize: FontSizes.xs, fontWeight: '700' },
    pendingText: { fontSize: FontSizes.sm, color: DiscordColors.textSecondary, fontWeight: '500' },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.md,
        paddingBottom: Spacing.xs,
    },
    sectionLabel: {
        fontSize: FontSizes.xs,
        fontWeight: '700',
        color: DiscordColors.textMuted,
        letterSpacing: 0.5,
    },
    manageLink: {
        fontSize: FontSizes.sm,
        color: DiscordColors.blurple,
        fontWeight: '600',
    },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: Spacing.xl },
    emptyTitle: { fontSize: FontSizes.lg, fontWeight: '700', color: DiscordColors.textPrimary },
    emptySubtitle: { fontSize: FontSizes.sm, color: DiscordColors.textMuted, textAlign: 'center' },
    addBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: DiscordColors.blurple,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm,
        borderRadius: 20,
        gap: 8,
        marginTop: Spacing.sm,
    },
    addBtnText: { color: '#fff', fontSize: FontSizes.md, fontWeight: '600' },
    list: { paddingVertical: Spacing.xs },
    friendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm + 2,
        borderRadius: 8,
        marginHorizontal: Spacing.sm,
        marginVertical: 1,
    },
    avatar: {
        width: 42,
        height: 42,
        borderRadius: 21,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    avatarText: { color: '#fff', fontWeight: '700', fontSize: FontSizes.md },
    onlineDot: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#3BA55C',
        borderWidth: 2,
        borderColor: DiscordColors.backgroundDark,
    },
    friendInfo: { flex: 1, marginLeft: Spacing.md },
    friendName: { fontSize: FontSizes.md, fontWeight: '600', color: DiscordColors.textPrimary },
    friendUsername: { fontSize: FontSizes.sm, color: DiscordColors.textMuted, marginTop: 1 },
});
