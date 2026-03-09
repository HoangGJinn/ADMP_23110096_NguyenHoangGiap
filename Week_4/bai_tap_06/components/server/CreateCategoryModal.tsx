import { BorderRadius, DiscordColors, FontSizes, Spacing } from '@/constants/discord-theme';
import {
    CategoryResponse,
    createCategory,
    CreateCategoryRequest,
    updateCategory,
} from '@/services/serverService';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface CreateCategoryModalProps {
    visible: boolean;
    serverId: number | null;
    /** Nếu truyền vào thì đây là chế độ chỉnh sửa */
    editingCategory?: CategoryResponse | null;
    onClose: () => void;
    onSuccess: () => void;
}

export default function CreateCategoryModal({
    visible,
    serverId,
    editingCategory,
    onClose,
    onSuccess,
}: CreateCategoryModalProps) {
    const isEditing = !!editingCategory;
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (visible) {
            setName(editingCategory?.name ?? '');
            setError(null);
        }
    }, [visible, editingCategory]);

    const handleSubmit = async () => {
        const trimmed = name.trim();
        if (!trimmed) {
            setError('Vui lòng nhập tên danh mục');
            return;
        }
        if (trimmed.length < 2) {
            setError('Tên danh mục phải có ít nhất 2 ký tự');
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            if (isEditing && editingCategory) {
                await updateCategory(editingCategory.id, { name: trimmed });
            } else {
                if (!serverId) return;
                const data: CreateCategoryRequest = { name: trimmed };
                await createCategory(serverId, data);
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
                            {isEditing ? 'Sửa danh mục' : 'Tạo danh mục'}
                        </Text>
                        <View style={{ width: 40 }} />
                    </View>

                    <View style={styles.body}>
                        {error && (
                            <View style={styles.errorBox}>
                                <Ionicons name="alert-circle" size={16} color={DiscordColors.error} />
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        )}

                        <Text style={styles.label}>TÊN DANH MỤC <Text style={styles.required}>*</Text></Text>
                        <TextInput
                            style={styles.input}
                            placeholder="ví dụ: THÔNG TIN"
                            placeholderTextColor={DiscordColors.textMuted}
                            value={name}
                            onChangeText={setName}
                            maxLength={100}
                            autoFocus
                            returnKeyType="done"
                            onSubmitEditing={handleSubmit}
                        />
                        <Text style={styles.hint}>
                            Tên danh mục sẽ được hiển thị in hoa trong danh sách kênh.
                        </Text>
                    </View>

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
                                    {isEditing ? 'Lưu' : 'Tạo'}
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
    body: {
        padding: Spacing.lg,
    },
    errorBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(237,66,69,0.15)',
        borderRadius: BorderRadius.sm,
        padding: Spacing.sm,
        marginBottom: Spacing.md,
        gap: Spacing.xs,
    },
    errorText: {
        color: DiscordColors.error,
        fontSize: FontSizes.sm,
        flex: 1,
    },
    label: {
        fontSize: FontSizes.xs,
        fontWeight: '700',
        color: DiscordColors.textSecondary,
        marginBottom: Spacing.xs,
        letterSpacing: 0.5,
    },
    required: { color: DiscordColors.error },
    input: {
        backgroundColor: DiscordColors.inputBackground,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        color: DiscordColors.textPrimary,
        fontSize: FontSizes.md,
        borderWidth: 1,
        borderColor: DiscordColors.inputBorder,
    },
    hint: {
        fontSize: FontSizes.xs,
        color: DiscordColors.textMuted,
        marginTop: Spacing.xs,
    },
    footer: {
        flexDirection: 'row',
        paddingHorizontal: Spacing.lg,
        gap: Spacing.sm,
    },
    btn: {
        flex: 1,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelBtn: {
        backgroundColor: DiscordColors.backgroundLight,
    },
    cancelText: {
        color: DiscordColors.textSecondary,
        fontWeight: '600',
        fontSize: FontSizes.md,
    },
    submitBtn: {
        backgroundColor: DiscordColors.primary,
    },
    submitText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: FontSizes.md,
    },
    btnDisabled: { opacity: 0.6 },
});
