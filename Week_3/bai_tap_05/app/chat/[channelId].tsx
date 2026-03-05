import { BorderRadius, DiscordColors, FontSizes, Spacing } from '@/constants/discord-theme';
import { getChannelMessages } from '@/services/messageService';
import { chatService } from '@/services/chatService';
import { WS_URL } from '@/services/config';
import { getToken } from '@/services/storeRef';
import { Client } from '@stomp/stompjs';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
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

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChatMessage {
    id: string;
    content: string;
    senderId: number;
    senderName: string;
    senderAvatar: string | null;
    createdAt: string | number[];
    isEdited?: boolean;
}

type ListItem =
    | { type: 'date'; label: string; key: string }
    | { type: 'message'; message: ChatMessage; isGrouped: boolean; key: string };

// ─── Helpers ──────────────────────────────────────────────────────────────────

const parseDate = (raw: string | number[] | null | undefined): Date => {
    if (!raw) return new Date();
    if (Array.isArray(raw)) {
        const [y, mo, d, h = 0, mi = 0, s = 0] = raw;
        return new Date(y, mo - 1, d, h, mi, s);
    }
    return new Date(raw as string);
};

const formatTime = (raw: string | number[] | null | undefined) =>
    parseDate(raw).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

const formatDateLabel = (raw: string | number[] | null | undefined): string => {
    const d = parseDate(raw);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return 'Hôm nay';
    if (d.toDateString() === yesterday.toDateString()) return 'Hôm qua';
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const sameDay = (a?: string | number[], b?: string | number[]) =>
    parseDate(a).toDateString() === parseDate(b).toDateString();

const avatarColor = (id: number) =>
    ['#5865F2', '#3BA55C', '#FAA61A', '#ED4245', '#9B84EE', '#EB459E'][id % 6];

const initials = (name: string) => {
    const w = name.trim().split(' ');
    return w.length >= 2 ? (w[0][0] + w[w.length - 1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
};

const toMsg = (m: any): ChatMessage => ({
    id: String(m.id),
    content: m.content ?? '',
    senderId: m.senderId,
    senderName: m.senderName ?? '',
    senderAvatar: m.senderAvatar ?? null,
    createdAt: m.createdAt,
    isEdited: m.isEdited ?? m.edited ?? false,
});

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

function MsgItem({ msg, grouped, onLong }: { msg: ChatMessage; grouped: boolean; onLong: () => void }) {
    const color = avatarColor(msg.senderId);
    if (grouped) {
        return (
            <Pressable onLongPress={onLong} style={styles.grouped}>
                <Text style={styles.msgText}>{msg.content}
                    {msg.isEdited && <Text style={styles.edited}> (đã sửa)</Text>}
                </Text>
            </Pressable>
        );
    }
    return (
        <Pressable onLongPress={onLong} style={styles.msgRow}>
            <View style={[styles.avatar, { backgroundColor: color }]}>
                <Text style={styles.avatarText}>{initials(msg.senderName)}</Text>
            </View>
            <View style={styles.msgBody}>
                <View style={styles.msgHeader}>
                    <Text style={[styles.senderName, { color }]}>{msg.senderName}</Text>
                    <Text style={styles.time}>{formatTime(msg.createdAt)}</Text>
                </View>
                <Text style={styles.msgText}>{msg.content}
                    {msg.isEdited && <Text style={styles.edited}> (đã sửa)</Text>}
                </Text>
            </View>
        </Pressable>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function ChatScreen() {
    const router = useRouter();
    const { channelId, channelName } = useLocalSearchParams<{
        channelId: string; channelName: string; serverId: string;
    }>();

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [inputText, setInputText] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [wsStatus, setWsStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
    const [editingMsg, setEditingMsg] = useState<ChatMessage | null>(null);

    const flatListRef = useRef<FlatList>(null);
    const stompRef = useRef<Client | null>(null);

    // ── Build list items (date separators + grouping) ─────────────────────────
    const buildItems = (msgs: ChatMessage[]): ListItem[] => {
        const items: ListItem[] = [];
        msgs.forEach((msg, i) => {
            const prev = msgs[i - 1];
            if (i === 0 || !sameDay(prev?.createdAt, msg.createdAt)) {
                items.push({ type: 'date', label: formatDateLabel(msg.createdAt), key: `d-${i}` });
            }
            const isGrouped = !!prev
                && prev.senderId === msg.senderId
                && sameDay(prev.createdAt, msg.createdAt)
                && parseDate(msg.createdAt).getTime() - parseDate(prev.createdAt).getTime() < 5 * 60 * 1000;
            items.push({ type: 'message', message: msg, isGrouped, key: `m-${msg.id}` });
        });
        return items;
    };

    // ── Load REST history ────────────────────────────────────────────────────
    useEffect(() => {
        if (!channelId) return;
        setIsLoading(true);
        getChannelMessages(Number(channelId))
            .then(raw => setMessages(raw.map(toMsg)))
            .catch(e => console.error('fetchMessages:', e))
            .finally(() => setIsLoading(false));
    }, [channelId]);

    // Scroll to bottom after load
    useEffect(() => {
        if (!isLoading && messages.length > 0) {
            setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 200);
        }
    }, [isLoading]);

    // ── WebSocket — Local Client (pattern từ repo tham khảo) ─────────────────
    useEffect(() => {
        if (!channelId) return;

        const connectWebSocket = () => {
            const token = getToken();
            const client = new Client({
                brokerURL: WS_URL,
                connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
                reconnectDelay: 5000,
                forceBinaryWSFrames: true,
                appendMissingNULLonIncoming: true,
                onConnect: () => {
                    console.log('✅ WS connected, subscribing /topic/channel/' + channelId);
                    setWsStatus('connected');

                    client.subscribe(`/topic/channel/${channelId}`, (frame) => {
                        try {
                            const payload = JSON.parse(frame.body);
                            console.log('📨 WS payload:', JSON.stringify(payload).substring(0, 200));

                            if (payload.type === 'EDIT') {
                                // Backend gửi SocketResponse{type:"EDIT", data: ChatMessage}
                                const edited = payload.data;
                                if (!edited) return;
                                setMessages(prev => prev.map(m =>
                                    m.id === String(edited.id) ? { ...m, content: edited.content, isEdited: true } : m
                                ));
                            } else if (payload.type === 'DELETE') {
                                const deletedId = String(payload.data);
                                setMessages(prev => prev.filter(m => m.id !== deletedId));
                            } else {
                                // Tin nhắn mới — backend gửi thẳng ChatMessage (không có type field)
                                const raw = payload.data ?? payload;
                                const newMsg = toMsg(raw);
                                setMessages(prev => {
                                    if (prev.some(m => m.id === newMsg.id)) return prev;
                                    return [...prev, newMsg];
                                });
                                setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
                            }
                        } catch (e) {
                            console.error('WS parse error:', e);
                        }
                    });
                },
                onStompError: (frame) => {
                    console.error('STOMP error:', frame.headers['message']);
                    setWsStatus('error');
                },
                onWebSocketError: () => setWsStatus('error'),
                onDisconnect: () => setWsStatus('connecting'),
            });

            client.activate();
            stompRef.current = client;
        };

        connectWebSocket();

        return () => {
            console.log('🔌 Deactivating WS for channel', channelId);
            stompRef.current?.deactivate();
            stompRef.current = null;
        };
    }, [channelId]);

    // ── Send ────────────────────────────────────────────────────────────────
    const handleSend = useCallback(async () => {
        const text = inputText.trim();
        if (!text || isSending) return;
        setIsSending(true);
        setInputText('');
        try {
            if (editingMsg) {
                await chatService.editMessage(editingMsg.id, text);
                setEditingMsg(null);
            } else {
                const client = stompRef.current;
                if (client?.connected) {
                    client.publish({
                        destination: `/app/chat/${channelId}`,
                        body: JSON.stringify({ content: text }),
                    });
                } else {
                    setInputText(text);
                    Alert.alert('Lỗi', 'Chưa kết nối WebSocket. Vui lòng thử lại.');
                }
            }
        } catch (e) {
            console.error('handleSend:', e);
            setInputText(text);
        } finally {
            setIsSending(false);
        }
    }, [inputText, isSending, channelId, editingMsg]);

    // ── Long press ───────────────────────────────────────────────────────────
    const handleLongPress = (msg: ChatMessage) => {
        Alert.alert('Tùy chọn', msg.content.substring(0, 60) + '...', [
            { text: 'Chỉnh sửa', onPress: () => { setEditingMsg(msg); setInputText(msg.content); } },
            { text: 'Xóa', style: 'destructive', onPress: async () => {
                try {
                    await chatService.deleteMessage(msg.id);
                    setMessages(prev => prev.filter(m => m.id !== msg.id));
                } catch { Alert.alert('Lỗi', 'Không thể xóa tin nhắn'); }
            }},
            { text: 'Hủy', style: 'cancel' },
        ]);
    };

    // ── Render ───────────────────────────────────────────────────────────────
    const listItems = buildItems(messages);

    const renderItem = ({ item }: { item: ListItem }) => {
        if (item.type === 'date') return <DateSep label={item.label} />;
        return (
            <MsgItem
                msg={item.message}
                grouped={item.isGrouped}
                onLong={() => handleLongPress(item.message)}
            />
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={DiscordColors.textPrimary} />
                </Pressable>
                <View style={styles.channelInfo}>
                    <Text style={styles.channelName}>#{channelName || 'general'}</Text>
                    {wsStatus === 'connected'
                        ? <View style={styles.dot} />
                        : wsStatus === 'connecting'
                        ? <ActivityIndicator size="small" color="#FAA61A" style={{ marginLeft: 6 }} />
                        : <Ionicons name="warning-outline" size={14} color="#ED4245" style={{ marginLeft: 6 }} />
                    }
                </View>
                <Pressable style={styles.headerBtn} onPress={() => {
                    getChannelMessages(Number(channelId))
                        .then(raw => setMessages(raw.map(toMsg)))
                        .catch(() => {});
                }}>
                    <Ionicons name="refresh-outline" size={22} color={DiscordColors.textSecondary} />
                </Pressable>
            </View>

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
                        renderItem={renderItem}
                        keyExtractor={item => item.key}
                        style={styles.list}
                        contentContainerStyle={{ paddingVertical: Spacing.md, flexGrow: 1 }}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View style={styles.center}>
                                <Ionicons name="chatbubbles-outline" size={48} color={DiscordColors.textMuted} />
                                <Text style={styles.emptyTitle}>Chưa có tin nhắn</Text>
                                <Text style={styles.emptyText}>Hãy bắt đầu cuộc trò chuyện!</Text>
                            </View>
                        }
                    />
                )}

                {/* Edit banner */}
                {editingMsg && (
                    <View style={styles.editBanner}>
                        <Ionicons name="create-outline" size={16} color={DiscordColors.blurple} />
                        <Text style={styles.editText} numberOfLines={1}>Sửa: {editingMsg.content}</Text>
                        <Pressable onPress={() => { setEditingMsg(null); setInputText(''); }}>
                            <Ionicons name="close" size={18} color={DiscordColors.textMuted} />
                        </Pressable>
                    </View>
                )}

                {/* Input */}
                <View style={styles.inputRow}>
                    <View style={styles.inputWrap}>
                        <TextInput
                            style={styles.input}
                            placeholder={`Nhắn #${channelName || 'general'}`}
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
    header: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
        borderBottomWidth: 1, borderBottomColor: DiscordColors.divider,
    },
    backBtn: { padding: Spacing.sm },
    channelInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', marginLeft: Spacing.sm },
    channelName: { fontSize: FontSizes.lg, fontWeight: '700', color: DiscordColors.textPrimary },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#3BA55C', marginLeft: 6 },
    headerBtn: { padding: Spacing.sm },
    content: { flex: 1 },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
    loadingText: { color: DiscordColors.textMuted, marginTop: Spacing.md },
    list: { flex: 1 },
    // Date separator
    dateSep: {
        flexDirection: 'row', alignItems: 'center',
        marginVertical: Spacing.md, paddingHorizontal: Spacing.lg,
    },
    dateLine: { flex: 1, height: 1, backgroundColor: DiscordColors.divider },
    dateLabel: { fontSize: FontSizes.xs, color: DiscordColors.textMuted, marginHorizontal: Spacing.md, fontWeight: '600' },
    // Messages
    msgRow: { flexDirection: 'row', paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: 2 },
    grouped: { paddingLeft: 56 + Spacing.lg, paddingRight: Spacing.lg, paddingVertical: 2 },
    avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md },
    avatarText: { color: '#fff', fontSize: FontSizes.sm, fontWeight: '700' },
    msgBody: { flex: 1 },
    msgHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
    senderName: { fontSize: FontSizes.md, fontWeight: '700', marginRight: Spacing.sm },
    time: { fontSize: FontSizes.xs, color: DiscordColors.textMuted },
    msgText: { fontSize: FontSizes.md, color: DiscordColors.textSecondary, lineHeight: 22 },
    edited: { fontSize: FontSizes.xs, color: DiscordColors.textMuted, fontStyle: 'italic' },
    // Edit banner
    editBanner: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: DiscordColors.backgroundLight,
        paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    },
    editText: { flex: 1, color: DiscordColors.textSecondary, fontSize: FontSizes.sm },
    // Input
    inputRow: {
        flexDirection: 'row', alignItems: 'flex-end',
        paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
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
    input: { fontSize: FontSizes.md, color: DiscordColors.textPrimary, paddingVertical: Spacing.sm, maxHeight: 100 },
    sendBtn: {
        backgroundColor: DiscordColors.blurple,
        borderRadius: BorderRadius.round,
        width: 40, height: 40,
        alignItems: 'center', justifyContent: 'center',
    },
    emptyTitle: { fontSize: FontSizes.lg, fontWeight: '600', color: DiscordColors.textSecondary, marginTop: Spacing.lg },
    emptyText: { fontSize: FontSizes.md, color: DiscordColors.textMuted, marginTop: Spacing.sm },
});
