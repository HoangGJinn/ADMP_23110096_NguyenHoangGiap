import { BorderRadius, DiscordColors, FontSizes, Spacing } from '@/constants/discord-theme';
import { ServerResponse, updateServer, UpdateServerRequest } from '@/services/serverService';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
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

interface ServerSettingsModalProps {
    visible: boolean;
    server: ServerResponse | null;
    onClose: () => void;
    onSuccess: (updatedServer: ServerResponse) => void;
}

export default function ServerSettingsModal({ 
    visible, 
    server, 
    onClose, 
    onSuccess 
}: ServerSettingsModalProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [iconUrl, setIconUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Pre-fill form when server changes
    useEffect(() => {
        if (server) {
            setName(server.name || '');
            setDescription(server.description || '');
            setIconUrl(server.iconUrl || '');
            setError(null);
        }
    }, [server]);

    const handleSave = async () => {
        if (!server) return;

        if (!name.trim()) {
            setError('Vui lòng nhập tên server');
            return;
        }

        if (name.trim().length < 2) {
            setError('Tên server phải có ít nhất 2 ký tự');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const data: UpdateServerRequest = {
                name: name.trim(),
                description: description.trim() || undefined,
                iconUrl: iconUrl.trim() || undefined,
            };

            const updatedServer = await updateServer(server.id, data);
            
            Alert.alert('Thành công', 'Đã cập nhật thông tin server!', [
                { text: 'OK', onPress: () => {
                    onSuccess(updatedServer);
                    onClose();
                }}
            ]);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi cập nhật server');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setError(null);
        onClose();
    };

    const hasChanges = () => {
        if (!server) return false;
        return (
            name.trim() !== (server.name || '') ||
            description.trim() !== (server.description || '') ||
            iconUrl.trim() !== (server.iconUrl || '')
        );
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
                        <Text style={styles.title}>Cài Đặt Server</Text>
                        <View style={{ width: 40 }} />
                    </View>

                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        {/* Server Icon Preview */}
                        <View style={styles.iconPreview}>
                            <View style={styles.serverIcon}>
                                {name ? (
                                    <Text style={styles.iconText}>
                                        {name.substring(0, 2).toUpperCase()}
                                    </Text>
                                ) : (
                                    <Ionicons name="camera" size={32} color={DiscordColors.textMuted} />
                                )}
                            </View>
                            <Text style={styles.iconHint}>Icon server</Text>
                        </View>

                        {/* Error Message */}
                        {error && (
                            <View style={styles.errorContainer}>
                                <Ionicons name="alert-circle" size={18} color={DiscordColors.error} />
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        )}

                        {/* Name Input */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>TÊN SERVER <Text style={styles.required}>*</Text></Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Nhập tên server"
                                placeholderTextColor={DiscordColors.textMuted}
                                value={name}
                                onChangeText={setName}
                                maxLength={100}
                            />
                        </View>

                        {/* Description Input */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>MÔ TẢ</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Nhập mô tả server (tùy chọn)"
                                placeholderTextColor={DiscordColors.textMuted}
                                value={description}
                                onChangeText={setDescription}
                                multiline
                                numberOfLines={3}
                                maxLength={500}
                            />
                        </View>

                        {/* Icon URL Input */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>ICON URL</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="https://example.com/icon.png (tùy chọn)"
                                placeholderTextColor={DiscordColors.textMuted}
                                value={iconUrl}
                                onChangeText={setIconUrl}
                                autoCapitalize="none"
                                keyboardType="url"
                            />
                        </View>

                        {/* Server Info */}
                        {server && (
                            <View style={styles.infoBox}>
                                <Text style={styles.infoTitle}>Thông tin server</Text>
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Chủ sở hữu:</Text>
                                    <Text style={styles.infoValue}>{server.ownerName}</Text>
                                </View>
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Thành viên:</Text>
                                    <Text style={styles.infoValue}>{server.memberCount}</Text>
                                </View>
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Kênh:</Text>
                                    <Text style={styles.infoValue}>{server.channelCount}</Text>
                                </View>
                            </View>
                        )}
                    </ScrollView>

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
                            style={[
                                styles.button, 
                                styles.saveButton, 
                                (isLoading || !hasChanges()) && styles.buttonDisabled
                            ]}
                            onPress={handleSave}
                            disabled={isLoading || !hasChanges()}
                        >
                            {isLoading ? (
                                <ActivityIndicator size="small" color={DiscordColors.textPrimary} />
                            ) : (
                                <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
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
        maxHeight: '90%',
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
    iconPreview: {
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    serverIcon: {
        width: 80,
        height: 80,
        borderRadius: 28,
        backgroundColor: DiscordColors.backgroundLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.sm,
    },
    iconText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: DiscordColors.textPrimary,
    },
    iconHint: {
        fontSize: FontSizes.sm,
        color: DiscordColors.textMuted,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: DiscordColors.error + '20',
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        marginBottom: Spacing.lg,
    },
    errorText: {
        color: DiscordColors.error,
        fontSize: FontSizes.sm,
        marginLeft: Spacing.sm,
        flex: 1,
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
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    infoBox: {
        backgroundColor: DiscordColors.backgroundLight,
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        marginBottom: Spacing.lg,
    },
    infoTitle: {
        fontSize: FontSizes.sm,
        fontWeight: '600',
        color: DiscordColors.textPrimary,
        marginBottom: Spacing.sm,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: Spacing.xs,
    },
    infoLabel: {
        fontSize: FontSizes.sm,
        color: DiscordColors.textMuted,
    },
    infoValue: {
        fontSize: FontSizes.sm,
        color: DiscordColors.textSecondary,
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
    saveButton: {
        backgroundColor: DiscordColors.primary,
    },
    saveButtonText: {
        color: DiscordColors.textPrimary,
        fontSize: FontSizes.md,
        fontWeight: '600',
    },
    buttonDisabled: {
        opacity: 0.5,
    },
});
