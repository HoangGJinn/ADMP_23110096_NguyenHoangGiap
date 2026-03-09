import { BorderRadius, DiscordColors, FontSizes, Spacing } from '@/constants/discord-theme';
import {
    CategoryResponse,
    ChannelResponse,
    CreateChannelRequest,
    UpdateChannelRequest,
    createChannel,
    updateChannel,
} from '@/services/serverService';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface CreateChannelModalProps {
    visible: boolean;
    serverId: number | null;
    /** Danh sách categories để chọn */
    categories: CategoryResponse[];
    /** Category mặc định được chọn (khi bấm "+" trong category) */
    defaultCategoryId?: number | null;
    /** Nếu truyền vào thì là chế độ chỉnh sửa */
    editingChannel?: ChannelResponse | null;
    onClose: () => void;
    onSuccess: () => void;
}

type ChannelType = 'TEXT' | 'VOICE';

export default function CreateChannelModal({
    visible,
    serverId,
    categories,
    defaultCategoryId,
    editingChannel,
    onClose,
    onSuccess,
}: CreateChannelModalProps) {
    const isEditing = !!editingChannel;

    const [name, setName] = useState('');
    const [topic, setTopic] = useState('');
    const [channelType, setChannelType] = useState<ChannelType>('TEXT');
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (visible) {
            if (editingChannel) {
                setName(editingChannel.name);
                setTopic(editingChannel.topic ?? '');
                setChannelType(editingChannel.type as ChannelType);
                setSelectedCategoryId(editingChannel.categoryId ?? null);
            } else {
                setName('');
                setTopic('');
                setChannelType('TEXT');
                setSelectedCategoryId(defaultCategoryId ?? null);
            }
            setError(null);
        }
    }, [visible, editingChannel, defaultCategoryId]);

    const handleSubmit = async () => {
        const trimmedName = name.trim();
        if (!trimmedName) {
            setError('Vui lòng nhập tên kênh');
            return;
        }
        if (trimmedName.length < 2) {
            setError('Tên kênh phải có ít nhất 2 ký tự');
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            if (isEditing && editingChannel) {
                const data: UpdateChannelRequest = {
                    name: trimmedName,
                    topic: topic.trim() || undefined,
                    categoryId: selectedCategoryId,
                };
                await updateChannel(editingChannel.id, data);
            } else {
                if (!serverId) return;
                const data: CreateChannelRequest = {
                    name: trimmedName,
                    type: channelType,
                    topic: topic.trim() || undefined,
                    categoryId: selectedCategoryId,
                };
                await createChannel(serverId, data);
            }
            onSuccess();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.overlay}
            >
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Ionicons name="close" size={24} color={DiscordColors.textSecondary} />
                        </TouchableOpacity>
                        <Text style={styles.title}>
                            {isEditing ? 'Sửa kênh' : 'Tạo kênh'}
                        </Text>
                        <View style={{ width: 40 }} />
                    </View>

                    <ScrollView style={styles.body} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                        {error && (
                            <View style={styles.errorBox}>
                                <Ionicons name="alert-circle" size={16} color={DiscordColors.error} />
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        )}

                        {/* Channel Type — chỉ hiển thị khi tạo mới */}
                        {!isEditing && (
                            <View style={styles.section}>
                                <Text style={styles.label}>LOẠI KÊNH</Text>
                                <View style={styles.typeRow}>
                                    <TouchableOpacity
                                        style={[styles.typeBtn, channelType === 'TEXT' && styles.typeBtnActive]}
                                        onPress={() => setChannelType('TEXT')}
                                    >
                                        <Ionicons
                                            name="chatbubble-outline"
                                            size={20}
                                            color={channelType === 'TEXT' ? DiscordColors.textPrimary : DiscordColors.textMuted}
                                        />
                                        <View style={styles.typeInfo}>
                                            <Text style={[styles.typeName, channelType === 'TEXT' && styles.typeNameActive]}>
                                                Kênh văn bản
                                            </Text>
                                            <Text style={styles.typeDesc}>
                                                Gửi tin nhắn, ảnh, GIF, emoji và nhiều hơn nữa
                                            </Text>
                                        </View>
                                        {channelType === 'TEXT' && (
                                            <Ionicons name="checkmark-circle" size={20} color={DiscordColors.primary} />
                                        )}
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.typeBtn, channelType === 'VOICE' && styles.typeBtnActive]}
                                        onPress={() => setChannelType('VOICE')}
                                    >
                                        <Ionicons
                                            name="volume-high-outline"
                                            size={20}
                                            color={channelType === 'VOICE' ? DiscordColors.textPrimary : DiscordColors.textMuted}
                                        />
                                        <View style={styles.typeInfo}>
                                            <Text style={[styles.typeName, channelType === 'VOICE' && styles.typeNameActive]}>
                                                Kênh thoại
                                            </Text>
                                            <Text style={styles.typeDesc}>
                                                Trò chuyện bằng giọng nói và video
                                            </Text>
                                        </View>
                                        {channelType === 'VOICE' && (
                                            <Ionicons name="checkmark-circle" size={20} color={DiscordColors.primary} />
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                        {/* Channel Name */}
                        <View style={styles.section}>
                            <Text style={styles.label}>
                                TÊN KÊNH <Text style={styles.required}>*</Text>
                            </Text>
                            <View style={styles.nameInputWrapper}>
                                <Ionicons
                                    name={channelType === 'TEXT' ? 'chatbubble-outline' : 'volume-high-outline'}
                                    size={16}
                                    color={DiscordColors.textMuted}
                                    style={styles.nameIcon}
                                />
                                <TextInput
                                    style={styles.nameInput}
                                    placeholder="kênh-mới"
                                    placeholderTextColor={DiscordColors.textMuted}
                                    value={name}
                                    onChangeText={(t) => setName(t.toLowerCase().replace(/\s+/g, '-'))}
                                    maxLength={100}
                                    autoFocus={!isEditing}
                                    autoCapitalize="none"
                                />
                            </View>
                        </View>

                        {/* Topic (chỉ TEXT) */}
                        {channelType === 'TEXT' && (
                            <View style={styles.section}>
                                <Text style={styles.label}>CHỦ ĐỀ KÊNH</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    placeholder="Hãy cho mọi người biết kênh này về chủ đề gì..."
                                    placeholderTextColor={DiscordColors.textMuted}
                                    value={topic}
                                    onChangeText={setTopic}
                                    multiline
                                    numberOfLines={3}
                                    maxLength={1024}
                                />
                            </View>
                        )}

                        {/* Category Selection */}
                        <View style={styles.section}>
                            <Text style={styles.label}>DANH MỤC</Text>
                            <TouchableOpacity
                                style={[styles.typeBtn, selectedCategoryId === null && styles.typeBtnActive]}
                                onPress={() => setSelectedCategoryId(null)}
                            >
                                <Ionicons name="folder-outline" size={18} color={DiscordColors.textMuted} />
                                <Text style={[styles.catName, selectedCategoryId === null && styles.typeNameActive]}>
                                    Không có danh mục
                                </Text>
                                {selectedCategoryId === null && (
                                    <Ionicons name="checkmark-circle" size={18} color={DiscordColors.primary} />
                                )}
                            </TouchableOpacity>
                            {categories.map((cat) => (
                                <TouchableOpacity
                                    key={cat.id}
                                    style={[styles.typeBtn, selectedCategoryId === cat.id && styles.typeBtnActive]}
                                    onPress={() => setSelectedCategoryId(cat.id)}
                                >
                                    <Ionicons name="folder-outline" size={18} color={DiscordColors.textMuted} />
                                    <Text style={[styles.catName, selectedCategoryId === cat.id && styles.typeNameActive]}>
                                        {cat.name}
                                    </Text>
                                    {selectedCategoryId === cat.id && (
                                        <Ionicons name="checkmark-circle" size={18} color={DiscordColors.primary} />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={[styles.btn, styles.cancelBtn]}
                            onPress={onClose}
                            disabled={isLoading}
                        >
                            <Text style={styles.cancelText}>Hủy</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.btn, styles.submitBtn, isLoading && styles.btnDisabled]}
                            onPress={handleSubmit}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.submitText}>
                                    {isEditing ? 'Lưu' : 'Tạo kênh'}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: DiscordColors.backgroundDark,
        borderTopLeftRadius: BorderRadius.xl,
        borderTopRightRadius: BorderRadius.xl,
        maxHeight: '90%',
        paddingBottom: Platform.OS === 'ios' ? 34 : Spacing.lg,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: DiscordColors.divider,
    },
    closeBtn: { padding: 4 },
    title: {
        fontSize: FontSizes.lg,
        fontWeight: '700',
        color: DiscordColors.textPrimary,
    },
    body: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md },
    section: { marginBottom: Spacing.lg },
    errorBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(237,66,69,0.15)',
        borderRadius: BorderRadius.sm,
        padding: Spacing.sm,
        marginBottom: Spacing.md,
        gap: Spacing.xs,
    },
    errorText: { color: DiscordColors.error, fontSize: FontSizes.sm, flex: 1 },
    label: {
        fontSize: FontSizes.xs,
        fontWeight: '700',
        color: DiscordColors.textSecondary,
        marginBottom: Spacing.sm,
        letterSpacing: 0.5,
    },
    required: { color: DiscordColors.error },
    typeRow: { gap: Spacing.sm },
    typeBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: DiscordColors.backgroundLight,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        gap: Spacing.sm,
        borderWidth: 2,
        borderColor: 'transparent',
        marginBottom: Spacing.xs,
    },
    typeBtnActive: {
        borderColor: DiscordColors.primary,
        backgroundColor: 'rgba(88,101,242,0.1)',
    },
    typeInfo: { flex: 1 },
    typeName: {
        fontSize: FontSizes.md,
        color: DiscordColors.textSecondary,
        fontWeight: '600',
    },
    typeNameActive: { color: DiscordColors.textPrimary },
    typeDesc: {
        fontSize: FontSizes.xs,
        color: DiscordColors.textMuted,
        marginTop: 2,
    },
    catName: {
        flex: 1,
        fontSize: FontSizes.md,
        color: DiscordColors.textSecondary,
        fontWeight: '500',
    },
    nameInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: DiscordColors.inputBackground,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: DiscordColors.inputBorder,
        paddingHorizontal: Spacing.md,
    },
    nameIcon: { marginRight: Spacing.xs },
    nameInput: {
        flex: 1,
        paddingVertical: Spacing.md,
        color: DiscordColors.textPrimary,
        fontSize: FontSizes.md,
    },
    input: {
        backgroundColor: DiscordColors.inputBackground,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        color: DiscordColors.textPrimary,
        fontSize: FontSizes.md,
        borderWidth: 1,
        borderColor: DiscordColors.inputBorder,
    },
    textArea: { height: 80, textAlignVertical: 'top' },
    footer: {
        flexDirection: 'row',
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.md,
        gap: Spacing.sm,
    },
    btn: {
        flex: 1,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelBtn: { backgroundColor: DiscordColors.backgroundLight },
    cancelText: { color: DiscordColors.textSecondary, fontWeight: '600', fontSize: FontSizes.md },
    submitBtn: { backgroundColor: DiscordColors.primary },
    submitText: { color: '#fff', fontWeight: '700', fontSize: FontSizes.md },
    btnDisabled: { opacity: 0.6 },
});
