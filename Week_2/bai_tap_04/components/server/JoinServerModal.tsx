import { BorderRadius, DiscordColors, FontSizes, Spacing } from '@/constants/discord-theme';
import { joinServer } from '@/services/serverService';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
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

interface JoinServerModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function JoinServerModal({ visible, onClose, onSuccess }: JoinServerModalProps) {
    const [inviteCode, setInviteCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleJoin = async () => {
        if (!inviteCode.trim()) {
            setError('Vui lòng nhập mã mời');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const server = await joinServer({ inviteCode: inviteCode.trim() });
            
            Alert.alert('Thành công', `Đã tham gia server "${server.name}"!`, [
                { text: 'OK', onPress: () => {
                    resetForm();
                    onSuccess();
                    onClose();
                }}
            ]);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Mã mời không hợp lệ hoặc đã hết hạn');
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setInviteCode('');
        setError(null);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={handleClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.overlay}
            >
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={DiscordColors.textSecondary} />
                        </TouchableOpacity>
                        <Text style={styles.title}>Tham Gia Server</Text>
                        <View style={{ width: 40 }} />
                    </View>

                    <View style={styles.content}>
                        {/* Illustration */}
                        <View style={styles.illustration}>
                            <View style={styles.iconCircle}>
                                <Ionicons name="people" size={48} color={DiscordColors.primary} />
                            </View>
                        </View>

                        <Text style={styles.subtitle}>
                            Nhập mã mời để tham gia server của bạn bè
                        </Text>

                        {/* Error Message */}
                        {error && (
                            <View style={styles.errorContainer}>
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        )}

                        {/* Invite Code Input */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>MÃ MỜI <Text style={styles.required}>*</Text></Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Ví dụ: abc123xyz"
                                placeholderTextColor={DiscordColors.textMuted}
                                value={inviteCode}
                                onChangeText={setInviteCode}
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                            <Text style={styles.hint}>
                                Mã mời thường có dạng chuỗi ký tự ngắn được chia sẻ bởi thành viên server
                            </Text>
                        </View>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={handleClose}
                            disabled={isLoading}
                        >
                            <Text style={styles.cancelButtonText}>Hủy</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.joinButton, isLoading && styles.buttonDisabled]}
                            onPress={handleJoin}
                            disabled={isLoading || !inviteCode.trim()}
                        >
                            {isLoading ? (
                                <ActivityIndicator size="small" color={DiscordColors.textPrimary} />
                            ) : (
                                <Text style={styles.joinButtonText}>Tham Gia</Text>
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
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: DiscordColors.backgroundDark,
        borderTopLeftRadius: BorderRadius.xl,
        borderTopRightRadius: BorderRadius.xl,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: Spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: DiscordColors.divider,
    },
    closeButton: {
        padding: Spacing.sm,
    },
    title: {
        fontSize: FontSizes.xl,
        fontWeight: 'bold',
        color: DiscordColors.textPrimary,
    },
    content: {
        padding: Spacing.lg,
    },
    illustration: {
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    iconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: DiscordColors.primary + '20',
        alignItems: 'center',
        justifyContent: 'center',
    },
    subtitle: {
        textAlign: 'center',
        fontSize: FontSizes.md,
        color: DiscordColors.textSecondary,
        marginBottom: Spacing.xl,
    },
    errorContainer: {
        backgroundColor: DiscordColors.error + '20',
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        marginBottom: Spacing.lg,
    },
    errorText: {
        color: DiscordColors.error,
        fontSize: FontSizes.sm,
    },
    inputGroup: {
        marginBottom: Spacing.lg,
    },
    label: {
        fontSize: FontSizes.xs,
        fontWeight: '600',
        color: DiscordColors.textSecondary,
        letterSpacing: 0.5,
        marginBottom: Spacing.sm,
    },
    required: {
        color: DiscordColors.error,
    },
    input: {
        backgroundColor: DiscordColors.backgroundDarker,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        fontSize: FontSizes.md,
        color: DiscordColors.textPrimary,
    },
    hint: {
        fontSize: FontSizes.xs,
        color: DiscordColors.textMuted,
        marginTop: Spacing.sm,
    },
    footer: {
        flexDirection: 'row',
        padding: Spacing.lg,
        borderTopWidth: 1,
        borderTopColor: DiscordColors.divider,
        gap: Spacing.md,
    },
    button: {
        flex: 1,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        backgroundColor: DiscordColors.backgroundLight,
    },
    cancelButtonText: {
        color: DiscordColors.textPrimary,
        fontSize: FontSizes.md,
        fontWeight: '600',
    },
    joinButton: {
        backgroundColor: DiscordColors.success,
    },
    joinButtonText: {
        color: DiscordColors.textPrimary,
        fontSize: FontSizes.md,
        fontWeight: '600',
    },
    buttonDisabled: {
        opacity: 0.5,
    },
});
