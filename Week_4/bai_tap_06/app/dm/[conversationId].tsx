import { BorderRadius, DiscordColors, FontSizes, Spacing } from '@/constants/discord-theme';
import { DMMessage, DMReaction, dmService } from '@/services/dmService';
import { WS_URL } from '@/services/config';
import { getToken } from '@/services/storeRef';
import { Client } from '@stomp/stompjs';
import * as Clipboard from 'expo-clipboard';
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
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
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

interface MsgItemProps {
    msg: DMMessage;
    grouped: boolean;
    isMine: boolean;
    onLongPress: (msg: DMMessage) => void;
    onReactionPress: (msg: DMMessage, reaction: DMReaction) => void;
}

function MsgItem({ msg, grouped, isMine, onLongPress, onReactionPress }: MsgItemProps) {
    const color = avatarColor(msg.senderId);
    const name = msg.senderDisplayName || msg.senderUsername || 'Unknown';

    const reactionsRow = msg.reactions && msg.reactions.length > 0 ? (
        <View style={styles.reactionsRow}>
            {msg.reactions.map((r) => (
                <TouchableOpacity
                    key={r.emoji}
                    style={[styles.reactionChip, isMine && styles.reactionChipMine]}
                    onPress={() => onReactionPress(msg, r)}
                    activeOpacity={0.7}
                >
                    <Text style={styles.reactionEmoji}>{r.emoji}</Text>
                    {r.count > 1 && <Text style={styles.reactionCount}>{r.count}</Text>}
                </TouchableOpacity>
            ))}
        </View>
    ) : null;

    if (grouped) {
        return (
            <Pressable onLongPress={() => onLongPress(msg)} delayLongPress={350}>
                <View style={styles.grouped}>
                    {msg.deleted ? (
                        <Text style={styles.deletedText}>Tin nhắn đã bị xóa</Text>
                    ) : (
                        <>
                            <Text style={styles.msgText}>{msg.content}</Text>
                            {msg.edited && <Text style={styles.editedTag}>(đã sửa)</Text>}
                        </>
                    )}
                </View>
                {reactionsRow && <View style={styles.groupedReactions}>{reactionsRow}</View>}
            </Pressable>
        );
    }
    return (
        <Pressable onLongPress={() => onLongPress(msg)} delayLongPress={350}>
            <View style={styles.msgRow}>
                <View style={[styles.avatar, { backgroundColor: color }]}>
                    <Text style={styles.avatarText}>{initials(name)}</Text>
                </View>
                <View style={styles.msgBody}>
                    <View style={styles.msgHeader}>
                        <Text style={[styles.senderName, { color }]}>{name}</Text>
                        <Text style={styles.time}>{formatTime(msg.createdAt)}</Text>
                        {isMine && <Text style={styles.mineTag}>• Bạn</Text>}
                    </View>
                    {msg.deleted ? (
                        <Text style={styles.deletedText}>Tin nhắn đã bị xóa</Text>
                    ) : (
                        <>
                            <Text style={styles.msgText}>{msg.content}</Text>
                            {msg.edited && <Text style={styles.editedTag}>(đã sửa)</Text>}
                        </>
                    )}
                    {reactionsRow}
                </View>
            </View>
        </Pressable>
    );
}

// ─── Discord-style Message Context Menu ──────────────────────────────────────

const QUICK_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '😡'];

interface MessageContextMenuProps {
    visible: boolean;
    msg: DMMessage | null;
    isMine: boolean;
    currentUserId: number;
    onClose: () => void;
    onReact: (msg: DMMessage, emoji: string) => void;
    onEdit: (msg: DMMessage) => void;
    onDelete: (msg: DMMessage) => void;
    onCopy: (msg: DMMessage) => void;
}

function MessageContextMenu({
    visible, msg, isMine, currentUserId,
    onClose, onReact, onEdit, onDelete, onCopy,
}: MessageContextMenuProps) {
    if (!msg) return null;
    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <Pressable style={ctxStyles.overlay} onPress={onClose}>
                <Pressable style={ctxStyles.sheet} onPress={(e) => e.stopPropagation()}>
                    {/* Quick reaction row */}
                    <View style={ctxStyles.reactRow}>
                        {QUICK_EMOJIS.map((emoji) => {
                            const alreadyReacted = msg.reactions?.some(
                                (r) => r.emoji === emoji && r.userIds.includes(currentUserId)
                            );
                            return (
                                <TouchableOpacity
                                    key={emoji}
                                    style={[ctxStyles.quickEmoji, alreadyReacted && ctxStyles.quickEmojiActive]}
                                    onPress={() => { onReact(msg, emoji); onClose(); }}
                                    activeOpacity={0.7}
                                >
                                    <Text style={ctxStyles.quickEmojiText}>{emoji}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    <View style={ctxStyles.divider} />

                    {/* Message preview */}
                    {!!msg.content && (
                        <View style={ctxStyles.preview}>
                            <Text style={ctxStyles.previewText} numberOfLines={2}>
                                {msg.content}
                            </Text>
                        </View>
                    )}

                    {/* Actions */}
                    {isMine && !msg.deleted && (
                        <TouchableOpacity
                            style={ctxStyles.menuItem}
                            onPress={() => { onEdit(msg); onClose(); }}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="pencil-outline" size={22} color={DiscordColors.textSecondary} />
                            <Text style={ctxStyles.menuText}>Chỉnh Sửa Tin Nhắn</Text>
                        </TouchableOpacity>
                    )}

                    {!msg.deleted && (
                        <TouchableOpacity
                            style={ctxStyles.menuItem}
                            onPress={() => { onCopy(msg); onClose(); }}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="copy-outline" size={22} color={DiscordColors.textSecondary} />
                            <Text style={ctxStyles.menuText}>Sao Chép Văn Bản</Text>
                        </TouchableOpacity>
                    )}

                    {isMine && !msg.deleted && (
                        <TouchableOpacity
                            style={ctxStyles.menuItem}
                            onPress={() => { onDelete(msg); onClose(); }}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="trash-outline" size={22} color={DiscordColors.error} />
                            <Text style={[ctxStyles.menuText, { color: DiscordColors.error }]}>Xóa Tin Nhắn</Text>
                        </TouchableOpacity>
                    )}

                    <View style={{ height: Platform.OS === 'ios' ? 34 : 12 }} />
                </Pressable>
            </Pressable>
        </Modal>
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

    // Edit/Delete/Reaction state
    const [editingMessage, setEditingMessage] = useState<DMMessage | null>(null);
    const [contextMenuMsg, setContextMenuMsg] = useState<DMMessage | null>(null);

    const flatListRef = useRef<FlatList>(null);
    const stompClientRef = useRef<Client | null>(null);
    // Refs để tránh stale closure trong WS callback
    const currentUserRef = useRef(currentUser);
    const friendNameRef = useRef(friendName);
    useEffect(() => { currentUserRef.current = currentUser; }, [currentUser]);
    useEffect(() => { friendNameRef.current = friendName; }, [friendName]);

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
            edited: raw.edited ?? false,
            deleted: raw.deleted ?? false,
            reactions: dmService.parseReactions(raw.reactions),
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

    // ── Real-time: subscribe WebSocket for incoming DM messages ────────────
    useEffect(() => {
        const token = getToken();
        const topic = `/topic/dm/${conversationId}`;

        const client = new Client({
            brokerURL: WS_URL,
            connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
            reconnectDelay: 5000,
            forceBinaryWSFrames: true,
            appendMissingNULLonIncoming: true,
            onConnect: () => {
                console.log('✅ DM STOMP connected, subscribing:', topic);
                client.subscribe(topic, (frame) => {
                    try {
                        const raw = JSON.parse(frame.body);
                        console.log('📨 DM WS received:', raw.id, 'sender:', raw.senderId);

                        const curId = Number(currentUserRef.current?.userId);
                        const isMine = raw.senderId === curId;
                        const incoming: DMMessage = {
                            id: String(raw.id),
                            senderId: raw.senderId,
                            senderUsername: isMine
                                ? (currentUserRef.current?.userName ?? '')
                                : (friendNameRef.current ?? ''),
                            senderDisplayName: isMine
                                ? (currentUserRef.current?.userName ?? '')
                                : (friendNameRef.current ?? ''),
                            receiverId: raw.receiverId,
                            content: raw.content ?? '',
                            createdAt: raw.createdAt
                                ? (typeof raw.createdAt === 'number'
                                    ? new Date(raw.createdAt).toISOString()
                                    : String(raw.createdAt))
                                : new Date().toISOString(),
                        };

                        setMessages(prev => {
                            // Dedup — tránh hiển tin nhắn 2 lần (REST optimistic + WS push)
                            if (prev.some(m => m.id === incoming.id)) return prev;
                            const next = [...prev, incoming];
                            setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 80);
                            return next;
                        });
                    } catch (e) {
                        console.error('DM WS parse error:', e);
                    }
                });
            },
            onStompError: (frame) => {
                console.error('❌ DM STOMP error:', frame.headers['message']);
            },
        });

        stompClientRef.current = client;
        client.activate();

        return () => {
            client.deactivate();
            stompClientRef.current = null;
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [conversationId]);

    // ── Send / Edit message ─────────────────────────────────────────────────
    const handleSend = useCallback(async () => {
        const text = inputText.trim();
        if (!text || isSending || !friendId) return;
        setIsSending(true);
        setInputText('');

        // Edit mode
        if (editingMessage) {
            const prevContent = editingMessage.content;
            setEditingMessage(null);
            setMessages(prev =>
                prev.map(m => m.id === editingMessage.id ? { ...m, content: text, edited: true } : m)
            );
            try {
                await dmService.editMessage(editingMessage.id, text);
            } catch (e) {
                console.error('DM editMessage:', e);
                // Revert on error
                setMessages(prev =>
                    prev.map(m => m.id === editingMessage.id ? { ...m, content: prevContent, edited: false } : m)
                );
                Alert.alert('Lỗi', 'Không thể sửa tin nhắn.');
            } finally {
                setIsSending(false);
            }
            return;
        }

        // Send new message
        try {
            const sent = await dmService.sendMessage(Number(friendId), text);
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
    }, [inputText, isSending, friendId, currentUser, editingMessage]);

    // ── Long-press message → context menu (Discord bottom sheet) ──────────
    const handleMessageLongPress = useCallback((msg: DMMessage) => {
        setContextMenuMsg(msg);
    }, []);

    const handleDeleteMessage = useCallback(async (msg: DMMessage) => {
        // Optimistic update
        setMessages(prev =>
            prev.map(m => m.id === msg.id ? { ...m, deleted: true, content: '' } : m)
        );
        try {
            await dmService.deleteMessage(msg.id);
        } catch (e) {
            console.error('DM deleteMessage:', e);
            // Revert
            setMessages(prev =>
                prev.map(m => m.id === msg.id ? { ...m, deleted: false, content: msg.content } : m)
            );
            Alert.alert('Lỗi', 'Không thể xóa tin nhắn.');
        }
    }, []);

    // ── Reactions ───────────────────────────────────────────────────────────
    const handleReact = useCallback(async (msg: DMMessage, emoji: string) => {
        const currentUserId = Number(currentUser?.userId);
        const existing = msg.reactions?.find(r => r.emoji === emoji);
        const alreadyReacted = existing?.userIds.includes(currentUserId) ?? false;

        setMessages(prev => prev.map(m => {
            if (m.id !== msg.id) return m;
            if (alreadyReacted) {
                return {
                    ...m,
                    reactions: m.reactions
                        ?.map(r => ({ ...r, userIds: r.userIds.filter(id => id !== currentUserId), count: r.userIds.filter(id => id !== currentUserId).length }))
                        .filter(r => r.count > 0),
                };
            }
            if (existing) {
                return {
                    ...m,
                    reactions: m.reactions?.map(r =>
                        r.emoji === emoji
                            ? { ...r, count: r.count + 1, userIds: [...r.userIds, currentUserId] }
                            : r
                    ),
                };
            }
            return {
                ...m,
                reactions: [...(m.reactions ?? []), { emoji, count: 1, userIds: [currentUserId] }],
            };
        }));

        try {
            if (alreadyReacted) {
                await dmService.removeReaction(msg.id);
            } else {
                await dmService.addReaction(msg.id, emoji);
            }
        } catch (e) {
            console.error('DM react:', e);
        }
    }, [currentUser]);

    const handleCopyText = useCallback(async (msg: DMMessage) => {
        await Clipboard.setStringAsync(msg.content);
    }, []);

    const handleEditFromMenu = useCallback((msg: DMMessage) => {
        setEditingMessage(msg);
        setInputText(msg.content);
    }, []);

    const handleDeleteFromMenu = useCallback((msg: DMMessage) => {
        Alert.alert('Xóa tin nhắn', 'Tin nhắn sẽ bị xóa vĩnh viễn. Bạn có chắc?', [
            { text: 'Hủy', style: 'cancel' },
            { text: 'Xóa', style: 'destructive', onPress: () => handleDeleteMessage(msg) },
        ]);
    }, []);

    // Tapping an existing reaction chip → reuse the same toggle logic
    const handleReactionPress = useCallback((msg: DMMessage, reaction: DMReaction) => {
        handleReact(msg, reaction.emoji);
    }, [handleReact]);

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
                            return (
                                <MsgItem
                                    msg={item.message}
                                    grouped={item.isGrouped}
                                    isMine={item.message.senderId === Number(currentUser?.userId)}
                                    onLongPress={handleMessageLongPress}
                                    onReactionPress={handleReactionPress}
                                />
                            );
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

                {/* ── Editing indicator ──────────────────────────────────── */}
                {editingMessage && (
                    <View style={styles.editingBar}>
                        <Ionicons name="pencil" size={14} color={DiscordColors.primary} />
                        <Text style={styles.editingText} numberOfLines={1}>
                            Đang sửa: {editingMessage.content}
                        </Text>
                        <TouchableOpacity
                            onPress={() => { setEditingMessage(null); setInputText(''); }}
                        >
                            <Ionicons name="close-circle" size={18} color={DiscordColors.textMuted} />
                        </TouchableOpacity>
                    </View>
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
                                : <Ionicons name={editingMessage ? 'checkmark' : 'send'} size={18} color="#fff" />
                            }
                        </Pressable>
                    ) : null}
                </View>
            </KeyboardAvoidingView>

            {/* ── Discord-style context menu ─────────────────────────────── */}
            <MessageContextMenu
                visible={!!contextMenuMsg}
                msg={contextMenuMsg}
                isMine={contextMenuMsg?.senderId === Number(currentUser?.userId)}
                currentUserId={Number(currentUser?.userId)}
                onClose={() => setContextMenuMsg(null)}
                onReact={handleReact}
                onEdit={handleEditFromMenu}
                onDelete={handleDeleteFromMenu}
                onCopy={handleCopyText}
            />
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
    mineTag: { fontSize: FontSizes.xs, color: DiscordColors.primary, marginLeft: 2 },
    msgText: { fontSize: FontSizes.md, color: DiscordColors.textSecondary, lineHeight: 22 },
    editedTag: { fontSize: FontSizes.xs, color: DiscordColors.textMuted, marginTop: 2 },
    deletedText: { fontSize: FontSizes.md, color: DiscordColors.textMuted, fontStyle: 'italic' },

    // Reactions
    reactionsRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: Spacing.xs, gap: 4 },
    reactionChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: DiscordColors.backgroundLight,
        borderRadius: BorderRadius.round,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderWidth: 1,
        borderColor: DiscordColors.divider,
    },
    reactionChipMine: {
        borderColor: DiscordColors.primary,
        backgroundColor: 'rgba(88,101,242,0.15)',
    },
    reactionEmoji: { fontSize: 14 },
    reactionCount: { fontSize: FontSizes.xs, color: DiscordColors.textSecondary, marginLeft: 3 },
    groupedReactions: { paddingLeft: 56 + Spacing.lg, paddingBottom: 2 },

    // Editing bar
    editingBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(88,101,242,0.12)',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        gap: Spacing.sm,
        borderTopWidth: 1,
        borderTopColor: DiscordColors.primary,
    },
    editingText: {
        flex: 1,
        fontSize: FontSizes.sm,
        color: DiscordColors.primary,
    },



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

// ─── Context Menu Styles ──────────────────────────────────────────────────────

const ctxStyles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.65)',
        justifyContent: 'flex-end',
    },
    sheet: {
        backgroundColor: '#1e2124',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        overflow: 'hidden',
    },
    reactRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    quickEmoji: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#2f3136',
        alignItems: 'center',
        justifyContent: 'center',
    },
    quickEmojiActive: {
        backgroundColor: 'rgba(88,101,242,0.25)',
        borderWidth: 2,
        borderColor: '#5865F2',
    },
    quickEmojiText: { fontSize: 26 },
    divider: { height: 1, backgroundColor: '#40444b' },
    preview: {
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#40444b',
    },
    previewText: {
        fontSize: 13,
        color: '#72767d',
        fontStyle: 'italic',
        lineHeight: 18,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        gap: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#2f3136',
    },
    menuText: {
        fontSize: 16,
        color: '#dcddde',
        fontWeight: '500',
    },
});
