import { useAuth } from '@/contexts/AuthContext';
import { AGORA_APP_ID } from '@/services/config';
import {
    getVoiceToken,
    sendVoiceAction,
    subscribeVoice,
    unsubscribeVoice,
    VoiceState,
} from '@/services/voiceService';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Alert,
    PermissionsAndroid,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Agora — chỉ import khi không phải web (native module)
let createAgoraRtcEngine: any = null;
let ChannelProfileType: any = null;
if (Platform.OS !== 'web') {
    try {
        const agora = require('react-native-agora');
        createAgoraRtcEngine = agora.createAgoraRtcEngine;
        ChannelProfileType = agora.ChannelProfileType;
    } catch (e) {
        console.warn('react-native-agora not available:', e);
    }
}

// ─── Avatar helpers ───────────────────────────────────────────────────────────

const AVATAR_COLORS = ['#5865F2', '#3BA55C', '#FAA61A', '#ED4245', '#9B84EE', '#EB459E'];

const avatarColor = (id: string) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const initials = (name: string) => {
    const w = name.trim().split(' ');
    return w.length >= 2 ? (w[0][0] + w[w.length - 1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
};

// ─── Participant Card ─────────────────────────────────────────────────────────

function ParticipantCard({ state, isSpeaking }: { state: VoiceState; isSpeaking: boolean }) {
    const color = avatarColor(state.userId);
    const label = state.userId;
    const shortName = label.length > 12 ? label.slice(0, 12) + '…' : label;

    return (
        <View style={styles.card}>
            <View style={[
                styles.avatarCircle,
                { backgroundColor: color },
                isSpeaking && !state.isMuted && styles.avatarSpeaking,
            ]}>
                <Text style={styles.avatarText}>{initials(label)}</Text>
                {state.isMuted && (
                    <View style={styles.muteBadge}>
                        <Ionicons name="mic-off" size={10} color="#fff" />
                    </View>
                )}
            </View>
            <Text style={styles.cardName} numberOfLines={1}>{shortName}</Text>
        </View>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function VoiceRoomScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const { channelId, channelName, serverId } = useLocalSearchParams<{
        channelId: string;
        channelName: string;
        serverId: string;
    }>();

    const [participants, setParticipants] = useState<VoiceState[]>([]);
    const [speakingUsers, setSpeakingUsers] = useState<Set<string>>(new Set());
    const [isMuted, setIsMuted] = useState(false);
    const [isDeafened, setIsDeafened] = useState(false);
    const [isJoined, setIsJoined] = useState(false);
    const [status, setStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');

    const engineRef = useRef<any>(null);
    const channelIdNum = Number(channelId);
    const serverIdNum = Number(serverId);
    const userId = user?.userId ?? '';
    const userName = user?.userName ?? userId;

    // ── Initialize Agora & join room ──────────────────────────────────────────

    const requestMicPermission = async (): Promise<boolean> => {
        if (Platform.OS !== 'android') return true;
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
                {
                    title: 'Quyền dùng micro',
                    message: 'Voice chat cần quyền micro để bạn có thể nói chuyện.',
                    buttonPositive: 'Cấp quyền',
                    buttonNegative: 'Từ chối',
                }
            );
            return granted === PermissionsAndroid.RESULTS.GRANTED;
        } catch (e) {
            console.warn('Permission request error:', e);
            return false;
        }
    };

    const initVoice = useCallback(async () => {
        // Guard: tránh khởi tạo 2 lần nếu component re-render
        if (engineRef.current) return;

        try {
            // 0. Xin quyền micro trước khi khởi tạo Agora
            const hasMic = await requestMicPermission();
            if (!hasMic) {
                Alert.alert(
                    'Cần quyền micro',
                    'Vui lòng cấp quyền micro trong Cài đặt > Ứng dụng để sử dụng voice chat.',
                    [{ text: 'OK', onPress: () => router.back() }]
                );
                return;
            }

            // 1. Lấy token từ backend
            const tokenRes = await getVoiceToken(channelIdNum, userId);
            const agoraToken = tokenRes.token;

            // 2. Kết nối WebSocket và subscribe
            await subscribeVoice(serverIdNum, (msg) => {
                if (msg.type === 'INITIAL_SYNC' && msg.states) {
                    setParticipants(msg.states);
                } else if (msg.type === 'JOIN' && msg.state) {
                    setParticipants(prev => {
                        const exists = prev.find(p => p.userId === msg.state!.userId);
                        return exists ? prev : [...prev, msg.state!];
                    });
                } else if (msg.type === 'LEAVE' && msg.state) {
                    setParticipants(prev => prev.filter(p => p.userId !== msg.state!.userId));
                } else if (msg.type === 'UPDATE_STATE' && msg.state) {
                    setParticipants(prev =>
                        prev.map(p => p.userId === msg.state!.userId ? { ...p, ...msg.state } : p)
                    );
                }
            });

            // 3. Gửi JOIN event qua WebSocket
            await sendVoiceAction({
                type: 'JOIN',
                state: {
                    userId,
                    channelId: channelIdNum,
                    serverId: serverIdNum,
                    isMuted: false,
                    isDeafened: false,
                },
            });

            // 4. Khởi tạo Agora RTC engine
            if (createAgoraRtcEngine && agoraToken) {
                const engine = createAgoraRtcEngine();
                engineRef.current = engine;

                // Thứ tự đúng theo Agora v4:
                // initialize → registerEventHandler → setChannelProfile → enableAudio → join
                engine.initialize({ appId: AGORA_APP_ID });

                engine.registerEventHandler({
                    onJoinChannelSuccess: () => {
                        console.log('✅ Agora joined channel');
                        setIsJoined(true);
                        setStatus('connected');
                        engine.muteLocalAudioStream(false);
                        // Bật volume indication: cứ 200ms report 1 lần, ngưỡng phát hiện = 3
                        engine.enableAudioVolumeIndication(200, 3, true);
                    },
                    onAudioVolumeIndication: (speakers: any[], totalVolume: number) => {
                        // speakers: [{ uid, userAccount, volume, vad }]
                        console.log('[Mic] totalVolume:', totalVolume, 'speakers:', JSON.stringify(speakers));
                        const speaking = new Set<string>();
                        for (const s of speakers) {
                            if (s.volume > 20) {
                                // local user có uid=0, dùng userId của mình
                                const id = s.uid === 0 ? userId : (s.userAccount || String(s.uid));
                                speaking.add(id);
                            }
                        }
                        setSpeakingUsers(speaking);
                    },
                    onUserJoined: (_connection: any, remoteUid: number) => {
                        console.log('👥 Remote user joined:', remoteUid);
                    },
                    onUserOffline: (_connection: any, remoteUid: number) => {
                        console.log('👤 Remote user left:', remoteUid);
                    },
                    onError: (err: number, msg: string) => {
                        console.error('❌ Agora error:', err, msg);
                        setStatus('error');
                    },
                });

                engine.setChannelProfile(ChannelProfileType.ChannelProfileCommunication);
                engine.enableAudio();
                engine.setDefaultAudioRouteToSpeakerphone(true);

                // Testing Mode: token rỗng ("") — Secured Mode: dùng token từ backend
                const tokenToUse = agoraToken || null;
                engine.joinChannelWithUserAccount(tokenToUse, String(channelIdNum), userId);
            } else {
                // Không có Agora (Expo Go) — chỉ dùng WS để hiển thị participants
                setStatus('connected');
            }
        } catch (err: any) {
            console.error('Voice init error:', err);
            setStatus('error');
            Alert.alert('Lỗi', 'Không thể kết nối phòng thoại: ' + (err.message ?? err));
        }
    }, [channelIdNum, serverIdNum, userId]);

    useEffect(() => {
        initVoice();

        return () => {
            // Cleanup: leave Agora, send LEAVE WS event, unsubscribe
            if (engineRef.current) {
                engineRef.current.leaveChannel();
                engineRef.current.release();
                engineRef.current = null;
            }
            sendVoiceAction({
                type: 'LEAVE',
                state: {
                    userId,
                    channelId: channelIdNum,
                    serverId: serverIdNum,
                    isMuted,
                    isDeafened,
                },
            });
            unsubscribeVoice(serverIdNum);
        };
    }, []);

    // ── Controls ──────────────────────────────────────────────────────────────

    const toggleMute = useCallback(() => {
        const next = !isMuted;
        setIsMuted(next);
        engineRef.current?.muteLocalAudioStream(next);
        sendVoiceAction({
            type: 'UPDATE_STATE',
            state: { userId, channelId: channelIdNum, serverId: serverIdNum, isMuted: next, isDeafened },
        });
    }, [isMuted, isDeafened, userId, channelIdNum, serverIdNum]);

    const toggleDeafen = useCallback(() => {
        const next = !isDeafened;
        setIsDeafened(next);
        engineRef.current?.muteAllRemoteAudioStreams(next);
        // Khi deafen cũng tự mute mic
        if (next && !isMuted) {
            setIsMuted(true);
            engineRef.current?.muteLocalAudioStream(true);
        }
        sendVoiceAction({
            type: 'UPDATE_STATE',
            state: {
                userId, channelId: channelIdNum, serverId: serverIdNum,
                isMuted: next ? true : isMuted,
                isDeafened: next,
            },
        });
    }, [isDeafened, isMuted, userId, channelIdNum, serverIdNum]);

    const handleLeave = useCallback(() => {
        router.back();
    }, [router]);

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleLeave} style={styles.headerBtn}>
                    <Ionicons name="chevron-down" size={26} color="#fff" />
                </TouchableOpacity>

                <View style={styles.headerCenter}>
                    <Text style={styles.headerChannel} numberOfLines={1}>{channelName}</Text>
                    <View style={styles.statusRow}>
                        <View style={[styles.statusDot, { backgroundColor: status === 'connected' ? '#3BA55C' : status === 'error' ? '#ED4245' : '#FAA61A' }]} />
                        <Text style={styles.statusText}>
                            {status === 'connected' ? 'Đã kết nối' : status === 'error' ? 'Lỗi kết nối' : 'Đang kết nối...'}
                        </Text>
                    </View>
                </View>

                <TouchableOpacity style={styles.headerBtn} onPress={toggleDeafen}>
                    <Ionicons
                        name={isDeafened ? 'volume-mute' : 'volume-high'}
                        size={22}
                        color={isDeafened ? '#ED4245' : '#fff'}
                    />
                </TouchableOpacity>

                <TouchableOpacity style={styles.headerBtn}>
                    <Ionicons name="person-add-outline" size={22} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Participant Grid */}
            <ScrollView
                style={styles.participantArea}
                contentContainerStyle={styles.participantContent}
                showsVerticalScrollIndicator={false}
            >
                {participants.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="people-outline" size={48} color="#4f545c" />
                        <Text style={styles.emptyText}>Chưa có ai trong phòng</Text>
                    </View>
                ) : (
                    <View style={styles.grid}>
                        {participants.map(p => (
                            <ParticipantCard key={p.userId} state={p} isSpeaking={speakingUsers.has(p.userId)} />
                        ))}
                    </View>
                )}
            </ScrollView>

            {/* Invite Banner */}
            <TouchableOpacity style={styles.inviteBanner} activeOpacity={0.7}>
                <View style={styles.inviteIcon}>
                    <Ionicons name="person-add-outline" size={20} color="#b9bbbe" />
                </View>
                <View style={styles.inviteText}>
                    <Text style={styles.inviteTitle}>Thêm người vào Trò Chuyện Thoại</Text>
                    <Text style={styles.inviteSub}>Cho nhóm biết bạn đang ở đây!</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#72767d" />
            </TouchableOpacity>

            {/* Control Bar */}
            <View style={styles.controls}>
                {/* Camera off */}
                <TouchableOpacity style={styles.controlBtn}>
                    <Ionicons name="videocam-off-outline" size={24} color="#b9bbbe" />
                </TouchableOpacity>

                {/* Mic toggle */}
                <TouchableOpacity
                    style={[styles.controlBtn, isMuted && styles.controlBtnActive]}
                    onPress={toggleMute}
                >
                    <Ionicons
                        name={isMuted ? 'mic-off' : 'mic-outline'}
                        size={24}
                        color={isMuted ? '#fff' : '#b9bbbe'}
                    />
                </TouchableOpacity>

                {/* Chat */}
                <TouchableOpacity style={styles.controlBtn} onPress={() => router.back()}>
                    <Ionicons name="chatbubble-outline" size={24} color="#b9bbbe" />
                </TouchableOpacity>

                {/* Sound / deafen */}
                <TouchableOpacity
                    style={[styles.controlBtn, isDeafened && styles.controlBtnActive]}
                    onPress={toggleDeafen}
                >
                    <Ionicons
                        name={isDeafened ? 'volume-mute' : 'volume-medium-outline'}
                        size={24}
                        color={isDeafened ? '#fff' : '#b9bbbe'}
                    />
                </TouchableOpacity>

                {/* Leave (red) */}
                <TouchableOpacity style={styles.leaveBtn} onPress={handleLeave}>
                    <Ionicons name="call" size={24} color="#fff" style={{ transform: [{ rotate: '135deg' }] }} />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: '#000',
    },
    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#2f3136',
    },
    headerBtn: {
        padding: 8,
    },
    headerCenter: {
        flex: 1,
        alignItems: 'center',
    },
    headerChannel: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 4,
    },
    statusText: {
        color: '#72767d',
        fontSize: 11,
    },
    // Participants
    participantArea: {
        flex: 1,
    },
    participantContent: {
        padding: 16,
        flexGrow: 1,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 16,
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 80,
    },
    emptyText: {
        color: '#4f545c',
        marginTop: 12,
        fontSize: 14,
    },
    // Participant card
    card: {
        width: 140,
        aspectRatio: 3 / 4,
        backgroundColor: '#36393f',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
    },
    avatarCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    avatarSpeaking: {
        borderWidth: 3,
        borderColor: '#3BA55C',
        shadowColor: '#3BA55C',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.9,
        shadowRadius: 8,
        elevation: 8,
    },
    avatarText: {
        color: '#fff',
        fontSize: 24,
        fontWeight: '700',
    },
    muteBadge: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        backgroundColor: '#ED4245',
        borderRadius: 8,
        padding: 2,
        borderWidth: 2,
        borderColor: '#36393f',
    },
    cardName: {
        color: '#dcddde',
        fontSize: 13,
        fontWeight: '500',
        marginTop: 10,
        textAlign: 'center',
    },
    // Invite banner
    inviteBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1e1f22',
        marginHorizontal: 16,
        marginBottom: 12,
        borderRadius: 10,
        padding: 14,
    },
    inviteIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#2f3136',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    inviteText: {
        flex: 1,
    },
    inviteTitle: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    inviteSub: {
        color: '#72767d',
        fontSize: 12,
        marginTop: 2,
    },
    // Control bar
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingHorizontal: 24,
        paddingVertical: 16,
        backgroundColor: '#1e1f22',
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: '#2f3136',
    },
    controlBtn: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: '#2f3136',
        alignItems: 'center',
        justifyContent: 'center',
    },
    controlBtnActive: {
        backgroundColor: '#4f545c',
    },
    leaveBtn: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: '#ED4245',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
