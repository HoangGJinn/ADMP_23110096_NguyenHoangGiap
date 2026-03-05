import { BorderRadius, DiscordColors, FontSizes, Spacing } from '@/constants/discord-theme';
import { DMMessage, dmService } from '@/services/dmService';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/redux/store';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const parseDate = (raw: string | null | undefined): Date => {
    if (!raw) return new Date();
    return new Date(raw);
};

const formatTime = (raw: string | null | undefined) =>
    parseDate(raw).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

const formatDateLabel = (raw: string | null | undefined): string => {
    const d = parseDate(raw);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return 'Hôm nay';
    if (d.toDateString() === yesterday.toDateString()) return 'Hôm qua';
    return d.toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' });
};

const sameDay = (a?: string | null, b?: string | null) =>
    parseDate(a).toDateString() === parseDate(b).toDateString();

const avatarColor = (id: number) =>
    ['#5865F2', '#3BA55C', '#FAA61A', '#ED4245', '#9B84EE', '#EB459E'][Math.abs(id) % 6];

const initials = (name: string) => {
    if (!name) return '?';
    const w = name.trim().split(' ');
    return w.length >= 2 ? (w[0][0] + w[w.length - 1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
};

// ─── Types ────────────────────────────────────────────────────────────────────

type ListItem =
    | { type: 'date'; label: string; key: string }
    | { type: 'message'; message: DMMessage; isGrouped: boolean; key: string };

// ─── Sub-components ───────────────────────────────────────────────────────────

function DateSep({ label }: { label: string }) {
    return (
        <View style={styles.dateSep}>
            <View style={styles.dateLine} />
            <Text style={styles.dateLabel}>{label}</Text>
            <View style={styles.dateLine} />
        </View>
    );
}

function MsgItem({ msg, grouped }: { msg: DMMessage; grouped: boolean }) {
    const color = avatarColor(msg.senderId);
    const name = msg.senderDisplayName || msg.senderUsername || 'Unknown';

    if (grouped) {
        return (
            <View style={styles.grouped}>
                <Text style={styles.msgText}>{msg.content}</Text>
            </View>
        );
    }
    return (
        <View style={styles.msgRow}>
            <View style={[styles.avatar, { backgroundColor: color }]}>
                <Text style={styles.avatarText}>{initials(name)}</Text>
            </View>
            <View style={styles.msgBody}>
                <View style={styles.msgHeader}>
                    <Text style={[styles.senderName, { color }]}>{name}</Text>
                    <Text style={styles.time}>{formatTime(msg.createdAt)}</Text>
                </View>
                <Text style={styles.msgText}>{msg.content}</Text>
            </View>
        </View>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function DMChatScreen() {
    const router = useRouter();
    const currentUser = useSelector((state: RootState) => state.auth.user);
    const { conversationId, friendName, friendId } = useLocalSearchParams<{
        conversationId: string;
        friendName: string;
        friendId: string;
    }>();

    const [messages, setMessages] = useState<DMMessage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [inputText, setInputText] = useState('');
    const [isSending, setIsSending] = useState(false);

    const flatListRef = useRef<FlatList>(null);

    // ── Build list items ────────────────────────────────────────────────────
    const buildItems = (msgs: DMMessage[]): ListItem[] => {
        const items: ListItem[] = [];
        msgs.forEach((msg, i) => {
            const prev = msgs[i - 1];
            if (i === 0 || !sameDay(prev?.createdAt, msg.createdAt)) {
                items.push({ type: 'date', label: formatDateLabel(msg.createdAt), key: `d-${i}` });
            }
            const isGrouped =
                !!prev &&
                prev.senderId === msg.senderId &&
                sameDay(prev.createdAt, msg.createdAt) &&
                parseDate(msg.createdAt).getTime() - parseDate(prev.createdAt).getTime() < 5 * 60 * 1000;
            items.push({ type: 'message', message: msg, isGrouped, key: `m-${msg.id}-${i}` });
        });
        return items;
    };

    // ── Load messages (REST) ────────────────────────────────────────────────
    const enrichMsg = useCallback((raw: any): DMMessage => {
        const curId = Number(currentUser?.userId);
        const isMine = raw.senderId === curId;
        return {
            id: String(raw.id),
            senderId: raw.senderId,
            senderUsername: isMine
                ? (currentUser?.userName ?? '')
                : (raw.senderUsername ?? friendName ?? ''),
            senderDisplayName: isMine
                ? (currentUser?.userName ?? '')
                : (raw.senderDisplayName ?? friendName ?? ''),
            receiverId: raw.receiverId,
            content: raw.content ?? '',
            createdAt: raw.createdAt ?? new Date().toISOString(),
        };
    }, [currentUser, friendName]);

    const loadMessages = useCallback(async () => {
        if (!conversationId) return;
        try {
            setIsLoading(true);
            const res = await dmService.getMessages(conversationId);
            const sorted = [...(res.content || [])]
                .sort((a, b) => parseDate(a.createdAt).getTime() - parseDate(b.createdAt).getTime())
                .map(enrichMsg);
            setMessages(sorted);
        } catch (e) {
            console.error('DM loadMessages:', e);
        } finally {
            setIsLoading(false);
        }
    }, [conversationId, enrichMsg]);

    useEffect(() => { loadMessages(); }, [loadMessages]);

    // Scroll to bottom after load
    useEffect(() => {
        if (!isLoading && messages.length > 0) {
            setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 200);
        }
    }, [isLoading]);

    // ── Send message via REST ───────────────────────────────────────────────
    const handleSend = useCallback(async () => {
        const text = inputText.trim();
        if (!text || isSending || !friendId) return;
        setIsSending(true);
        setInputText('');
        try {
            const sent = await dmService.sendMessage(Number(friendId), text);
            // Map response to DMMessage — backend DirectMessageResponse has no senderDisplayName,
            // so we fill it from the Redux current user.
            const newMsg: DMMessage = {
                id: String(sent.id),
                senderId: sent.senderId,
                senderUsername: currentUser?.userName ?? '',
                senderDisplayName: currentUser?.userName ?? '',
                receiverId: sent.receiverId,
                content: sent.content,
                createdAt: sent.createdAt ?? new Date().toISOString(),
            };
            setMessages(prev => {
                if (prev.some(m => m.id === newMsg.id)) return prev;
                return [...prev, newMsg];
            });
            setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
        } catch (e) {
            console.error('DM handleSend:', e);
            setInputText(text);
            Alert.alert('Lỗi', 'Không thể gửi tin nhắn. Vui lòng thử lại.');
        } finally {
            setIsSending(false);
        }
    }, [inputText, isSending, friendId, currentUser]);

    const listItems = buildItems(messages);
    const friendColor = avatarColor(Number(friendId) || 0);
    const displayName = friendName || 'Direct Message';

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* ── Header ─────────────────────────────────────────────────── */}
            <View style={styles.header}>
                <Pressable style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={DiscordColors.textPrimary} />
                </Pressable>

                {/* Avatar + Name */}
                <View style={styles.partnerRow}>
                    <View style={[styles.headerAvatar, { backgroundColor: friendColor }]}>
                        <Text style={styles.headerAvatarText}>{displayName.charAt(0).toUpperCase()}</Text>
                        <View style={styles.onlineDot} />
                    </View>
                    <Text style={styles.partnerName} numberOfLines={1}>{displayName}</Text>
                </View>

                {/* Action buttons */}
                <View style={styles.headerActions}>
                    <Pressable
                        style={styles.headerBtn}
                        onPress={() => Alert.alert('Cuộc gọi thoại', 'Tính năng đang phát triển')}
                    >
                        <Ionicons name="call-outline" size={22} color={DiscordColors.textPrimary} />
                    </Pressable>
                    <Pressable
                        style={styles.headerBtn}
                        onPress={() => Alert.alert('Cuộc gọi video', 'Tính năng đang phát triển')}
                    >
                        <Ionicons name="videocam-outline" size={24} color={DiscordColors.textPrimary} />
                    </Pressable>
                    <Pressable
                        style={styles.headerBtn}
                        onPress={() => Alert.alert('Tìm kiếm', 'Tính năng đang phát triển')}
                    >
                        <Ionicons name="search-outline" size={22} color={DiscordColors.textPrimary} />
                    </Pressable>
                </View>
            </View>

            {/* ── Content ────────────────────────────────────────────────── */}
            <KeyboardAvoidingView
                style={styles.content}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={90}
            >
                {isLoading ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color={DiscordColors.blurple} />
                        <Text style={styles.loadingText}>Đang tải tin nhắn...</Text>
                    </View>
                ) : (
                    <FlatList
                        ref={flatListRef}
                        data={listItems}
                        renderItem={({ item }) => {
                            if (item.type === 'date') return <DateSep label={item.label} />;
                            return <MsgItem msg={item.message} grouped={item.isGrouped} />;
                        }}
                        keyExtractor={item => item.key}
                        style={styles.list}
                        contentContainerStyle={{ paddingVertical: Spacing.md, flexGrow: 1 }}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View style={styles.center}>
                                <View style={[styles.emptyAvatar, { backgroundColor: friendColor }]}>
                                    <Text style={styles.emptyAvatarText}>{displayName.charAt(0).toUpperCase()}</Text>
                                </View>
                                <Text style={styles.emptyFriendName}>{displayName}</Text>
                                <Text style={styles.emptySubtitle}>
                                    Đây là phần đầu lịch sử tin nhắn trực tiếp với{' '}
                                    <Text style={{ fontWeight: '700', color: DiscordColors.textPrimary }}>
                                        {displayName}
                                    </Text>
                                    .
                                </Text>
                            </View>
                        }
                    />
                )}

                {/* ── Input ──────────────────────────────────────────────── */}
                <View style={styles.inputRow}>
                    <View style={styles.inputWrap}>
                        <TextInput
                            style={styles.input}
                            placeholder={`Nhắn @${displayName}`}
                            placeholderTextColor={DiscordColors.textMuted}
                            value={inputText}
                            onChangeText={setInputText}
                            multiline
                            maxLength={2000}
                        />
                    </View>
                    {inputText.trim() ? (
                        <Pressable
                            style={[styles.sendBtn, isSending && { opacity: 0.5 }]}
                            onPress={handleSend}
                            disabled={isSending}
                        >
                            {isSending
                                ? <ActivityIndicator size="small" color="#fff" />
                                : <Ionicons name="send" size={18} color="#fff" />
                            }
                        </Pressable>
                    ) : null}
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: DiscordColors.backgroundDark },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: DiscordColors.divider,
    },
    backBtn: { padding: Spacing.sm },
    partnerRow: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: Spacing.sm,
        overflow: 'hidden',
    },
    headerAvatar: {
        width: 34,
        height: 34,
        borderRadius: 17,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.sm,
    },
    headerAvatarText: { color: '#fff', fontSize: 14, fontWeight: '700' },
    onlineDot: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#3BA55C',
        borderWidth: 2,
        borderColor: DiscordColors.backgroundDark,
    },
    partnerName: {
        fontSize: FontSizes.md,
        fontWeight: '700',
        color: DiscordColors.textPrimary,
        flexShrink: 1,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerBtn: { padding: Spacing.sm },

    // Content
    content: { flex: 1 },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xl, paddingVertical: 60 },
    loadingText: { color: DiscordColors.textMuted, marginTop: Spacing.md },
    list: { flex: 1 },

    // Date separator
    dateSep: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
    },
    dateLine: { flex: 1, height: 1, backgroundColor: DiscordColors.divider },
    dateLabel: {
        fontSize: FontSizes.xs,
        color: DiscordColors.textMuted,
        marginHorizontal: Spacing.md,
        fontWeight: '600',
    },

    // Messages
    msgRow: {
        flexDirection: 'row',
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.md,
        paddingBottom: 2,
    },
    grouped: {
        paddingLeft: 56 + Spacing.lg,
        paddingRight: Spacing.lg,
        paddingVertical: 2,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },
    avatarText: { color: '#fff', fontSize: FontSizes.sm, fontWeight: '700' },
    msgBody: { flex: 1 },
    msgHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
    senderName: { fontSize: FontSizes.md, fontWeight: '700', marginRight: Spacing.sm },
    time: { fontSize: FontSizes.xs, color: DiscordColors.textMuted },
    msgText: { fontSize: FontSizes.md, color: DiscordColors.textSecondary, lineHeight: 22 },

    // Empty state
    emptyAvatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.md,
    },
    emptyAvatarText: { color: '#fff', fontSize: 32, fontWeight: '700' },
    emptyFriendName: {
        fontSize: FontSizes.xl,
        fontWeight: '800',
        color: DiscordColors.textPrimary,
        marginBottom: Spacing.sm,
    },
    emptySubtitle: {
        fontSize: FontSizes.md,
        color: DiscordColors.textMuted,
        textAlign: 'center',
        lineHeight: 22,
    },

    // Input
    inputRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
    },
    inputWrap: {
        flex: 1,
        backgroundColor: DiscordColors.backgroundLight,
        borderRadius: BorderRadius.lg,
        paddingHorizontal: Spacing.md,
        marginRight: Spacing.sm,
        minHeight: 44,
        justifyContent: 'center',
    },
    input: {
        fontSize: FontSizes.md,
        color: DiscordColors.textPrimary,
        paddingVertical: Spacing.sm,
        maxHeight: 100,
    },
    sendBtn: {
        backgroundColor: DiscordColors.blurple,
        borderRadius: BorderRadius.round,
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
