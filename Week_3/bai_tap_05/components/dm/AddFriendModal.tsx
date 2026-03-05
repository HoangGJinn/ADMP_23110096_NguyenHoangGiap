import { DiscordColors, FontSizes, Spacing } from '@/constants/discord-theme';
import { friendService, UserSearchResult } from '@/services/friendService';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface Props {
    visible: boolean;
    onClose: () => void;
}

const getAvatarColor = (name: string) => {
    const colors = ['#5865F2', '#3BA55C', '#FAA61A', '#ED4245', '#9B84EE', '#EB459E'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
};

export default function AddFriendModal({ visible, onClose }: Props) {
    const [keyword, setKeyword] = useState('');
    const [results, setResults] = useState<UserSearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [loadingIds, setLoadingIds] = useState<Set<number>>(new Set());
    const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (!visible) {
            setKeyword('');
            setResults([]);
        }
    }, [visible]);

    const handleSearch = (text: string) => {
        setKeyword(text);
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        if (text.trim().length < 2) { setResults([]); return; }
        searchTimeout.current = setTimeout(async () => {
            setIsSearching(true);
            try {
                const data = await friendService.searchUsers(text.trim());
                setResults(data);
            } catch { setResults([]); }
            finally { setIsSearching(false); }
        }, 400);
    };

    const setLoading = (id: number, loading: boolean) => {
        setLoadingIds(prev => {
            const next = new Set(prev);
            loading ? next.add(id) : next.delete(id);
            return next;
        });
    };

    const handleSendRequest = async (user: UserSearchResult) => {
        setLoading(user.id, true);
        try {
            await friendService.sendRequest(user.id);
            setResults(prev => prev.map(u => u.id === user.id
                ? { ...u, friendshipStatus: 'PENDING', isSender: true }
                : u));
        } catch (e: any) {
            Alert.alert('Lỗi', e?.message || 'Không thể gửi lời mời');
        } finally { setLoading(user.id, false); }
    };

    const handleCancelRequest = async (user: UserSearchResult) => {
        if (!user.friendshipId) return;
        setLoading(user.id, true);
        try {
            await friendService.cancelRequest(user.friendshipId);
            setResults(prev => prev.map(u => u.id === user.id
                ? { ...u, friendshipStatus: undefined, friendshipId: undefined, isSender: undefined }
                : u));
        } catch (e: any) {
            Alert.alert('Lỗi', e?.message || 'Không thể hủy lời mời');
        } finally { setLoading(user.id, false); }
    };

    const handleAcceptRequest = async (user: UserSearchResult) => {
        if (!user.friendshipId) return;
        setLoading(user.id, true);
        try {
            await friendService.acceptRequest(user.friendshipId);
            setResults(prev => prev.map(u => u.id === user.id
                ? { ...u, friendshipStatus: 'ACCEPTED' }
                : u));
        } catch (e: any) {
            Alert.alert('Lỗi', e?.message || 'Không thể chấp nhận lời mời');
        } finally { setLoading(user.id, false); }
    };

    const renderUser = ({ item }: { item: UserSearchResult }) => {
        const name = item.displayName || item.username || 'Unknown';
        const color = getAvatarColor(name);
        const isLoading = loadingIds.has(item.id);
        const status = item.friendshipStatus;

        let actionBtn = null;
        if (isLoading) {
            actionBtn = <ActivityIndicator size="small" color={DiscordColors.blurple} />;
        } else if (status === 'ACCEPTED') {
            actionBtn = (
                <View style={[styles.actionBtn, styles.friendedBtn]}>
                    <Ionicons name="checkmark" size={14} color="#3BA55C" />
                    <Text style={[styles.actionBtnText, { color: '#3BA55C' }]}>Bạn bè</Text>
                </View>
            );
        } else if (status === 'PENDING' && item.isSender) {
            actionBtn = (
                <TouchableOpacity style={[styles.actionBtn, styles.pendingBtn]} onPress={() => handleCancelRequest(item)}>
                    <Ionicons name="time-outline" size={14} color={DiscordColors.textMuted} />
                    <Text style={[styles.actionBtnText, { color: DiscordColors.textMuted }]}>Đã gửi</Text>
                </TouchableOpacity>
            );
        } else if (status === 'PENDING' && !item.isSender) {
            actionBtn = (
                <TouchableOpacity style={[styles.actionBtn, styles.acceptBtn]} onPress={() => handleAcceptRequest(item)}>
                    <Ionicons name="person-add-outline" size={14} color="#fff" />
                    <Text style={styles.actionBtnText}>Chấp nhận</Text>
                </TouchableOpacity>
            );
        } else {
            actionBtn = (
                <TouchableOpacity style={[styles.actionBtn, styles.addBtn]} onPress={() => handleSendRequest(item)}>
                    <Ionicons name="person-add-outline" size={14} color="#fff" />
                    <Text style={styles.actionBtnText}>Kết bạn</Text>
                </TouchableOpacity>
            );
        }

        return (
            <View style={styles.userItem}>
                <View style={[styles.avatar, { backgroundColor: color }]}>
                    <Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.userInfo}>
                    <Text style={styles.displayName} numberOfLines={1}>{name}</Text>
                    <Text style={styles.username}>@{item.username}</Text>
                </View>
                {actionBtn}
            </View>
        );
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
            <View style={styles.modal}>
                {/* Header */}
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Thêm bạn bè</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                        <Ionicons name="close" size={24} color={DiscordColors.textSecondary} />
                    </TouchableOpacity>
                </View>

                {/* Search */}
                <View style={styles.searchContainer}>
                    <Ionicons name="search-outline" size={18} color={DiscordColors.textMuted} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Tìm kiếm theo tên hoặc username..."
                        placeholderTextColor={DiscordColors.textMuted}
                        value={keyword}
                        onChangeText={handleSearch}
                        autoFocus
                        autoCapitalize="none"
                    />
                    {keyword.length > 0 && (
                        <TouchableOpacity onPress={() => { setKeyword(''); setResults([]); }}>
                            <Ionicons name="close-circle" size={18} color={DiscordColors.textMuted} />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Results */}
                {isSearching ? (
                    <View style={styles.center}>
                        <ActivityIndicator color={DiscordColors.blurple} />
                    </View>
                ) : keyword.length < 2 ? (
                    <View style={styles.center}>
                        <Ionicons name="people-outline" size={48} color={DiscordColors.textMuted} />
                        <Text style={styles.hintText}>Nhập ít nhất 2 ký tự để tìm kiếm</Text>
                    </View>
                ) : results.length === 0 ? (
                    <View style={styles.center}>
                        <Text style={styles.hintText}>Không tìm thấy người dùng nào</Text>
                    </View>
                ) : (
                    <FlatList
                        data={results}
                        keyExtractor={(item) => String(item.id)}
                        renderItem={renderUser}
                        contentContainerStyle={{ padding: Spacing.md }}
                    />
                )}
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modal: { flex: 1, backgroundColor: DiscordColors.backgroundDark },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: Spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: DiscordColors.divider,
    },
    modalTitle: { fontSize: FontSizes.xl, fontWeight: '700', color: DiscordColors.textPrimary },
    closeBtn: { padding: Spacing.xs },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: DiscordColors.backgroundLight,
        margin: Spacing.md,
        borderRadius: 12,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        gap: 8,
    },
    searchInput: { flex: 1, color: DiscordColors.textPrimary, fontSize: FontSizes.md },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
    hintText: { color: DiscordColors.textMuted, fontSize: FontSizes.sm, textAlign: 'center' },
    userItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: DiscordColors.divider,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: { color: '#fff', fontWeight: '700', fontSize: FontSizes.md },
    userInfo: { flex: 1, marginLeft: Spacing.md },
    displayName: { fontSize: FontSizes.md, fontWeight: '600', color: DiscordColors.textPrimary },
    username: { fontSize: FontSizes.sm, color: DiscordColors.textMuted },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: 6,
        borderRadius: 16,
        gap: 4,
    },
    addBtn: { backgroundColor: DiscordColors.blurple },
    pendingBtn: { backgroundColor: DiscordColors.backgroundLight },
    acceptBtn: { backgroundColor: '#3BA55C' },
    friendedBtn: { backgroundColor: DiscordColors.backgroundLight },
    actionBtnText: { color: '#fff', fontSize: FontSizes.sm, fontWeight: '600' },
});
