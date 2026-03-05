import { BorderRadius, DiscordColors, FontSizes, Spacing } from '@/constants/discord-theme';
import { regenerateInviteCode } from '@/services/serverService';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface InviteCodeModalProps {
    visible: boolean;
    serverId: number | null;
    inviteCode: string;
    serverName: string;
    isOwnerOrAdmin: boolean;
    onClose: () => void;
    onCodeRegenerated: (newCode: string) => void;
}

export default function InviteCodeModal({
    visible,
    serverId,
    inviteCode,
    serverName,
    isOwnerOrAdmin,
    onClose,
    onCodeRegenerated,
}: InviteCodeModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await Clipboard.setStringAsync(inviteCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể sao chép mã mời');
        }
    };

    const handleRegenerate = async () => {
        if (!serverId) return;

        Alert.alert(
            'Tạo mã mời mới?',
            'Mã mời cũ sẽ không còn hoạt động. Bạn có chắc chắn muốn tạo mã mới?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Tạo mới',
                    style: 'destructive',
                    onPress: async () => {
                        setIsLoading(true);
                        try {
                            const newCode = await regenerateInviteCode(serverId);
                            onCodeRegenerated(newCode);
                            Alert.alert('Thành công', 'Đã tạo mã mời mới!');
                        } catch (error) {
                            Alert.alert(
                                'Lỗi',
                                error instanceof Error ? error.message : 'Không thể tạo mã mời mới'
                            );
                        } finally {
                            setIsLoading(false);
                        }
                    },
                },
            ]
        );
    };

    const handleClose = () => {
        setCopied(false);
        onClose();
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={handleClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={DiscordColors.textSecondary} />
                        </TouchableOpacity>
                        <Text style={styles.title}>Mời Bạn Bè</Text>
                        <View style={{ width: 40 }} />
                    </View>

                    <View style={styles.content}>
                        {/* Server Name */}
                        <Text style={styles.serverName}>{serverName}</Text>

                        {/* Description */}
                        <Text style={styles.description}>
                            Chia sẻ mã mời này để bạn bè có thể tham gia server của bạn
                        </Text>

                        {/* Invite Code Display */}
                        <View style={styles.codeContainer}>
                            <Text style={styles.codeLabel}>MÃ MỜI</Text>
                            <View style={styles.codeBox}>
                                <Text style={styles.codeText} selectable>
                                    {inviteCode}
                                </Text>
                                <TouchableOpacity
                                    style={[styles.copyButton, copied && styles.copiedButton]}
                                    onPress={handleCopy}
                                >
                                    <Ionicons
                                        name={copied ? 'checkmark' : 'copy-outline'}
                                        size={20}
                                        color={copied ? DiscordColors.success : DiscordColors.textPrimary}
                                    />
                                </TouchableOpacity>
                            </View>
                            {copied && (
                                <Text style={styles.copiedText}>Đã sao chép!</Text>
                            )}
                        </View>

                        {/* Info */}
                        <View style={styles.infoBox}>
                            <Ionicons name="information-circle" size={18} color={DiscordColors.primary} />
                            <Text style={styles.infoText}>
                                Mã mời không có thời hạn và có thể sử dụng nhiều lần
                            </Text>
                        </View>

                        {/* Regenerate Button (Owner/Admin only) */}
                        {isOwnerOrAdmin && (
                            <TouchableOpacity
                                style={[styles.regenerateButton, isLoading && styles.buttonDisabled]}
                                onPress={handleRegenerate}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator size="small" color={DiscordColors.textPrimary} />
                                ) : (
                                    <>
                                        <Ionicons name="refresh" size={20} color={DiscordColors.textPrimary} />
                                        <Text style={styles.regenerateText}>Tạo Mã Mới</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Close Button */}
                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.closeFooterButton} onPress={handleClose}>
                            <Text style={styles.closeFooterText}>Đóng</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.lg,
    },
    container: {
        backgroundColor: DiscordColors.backgroundDark,
        borderRadius: BorderRadius.lg,
        width: '100%',
        maxWidth: 400,
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
        padding: Spacing.xs,
    },
    title: {
        fontSize: FontSizes.lg,
        fontWeight: 'bold',
        color: DiscordColors.textPrimary,
    },
    content: {
        padding: Spacing.lg,
    },
    serverName: {
        fontSize: FontSizes.xl,
        fontWeight: 'bold',
        color: DiscordColors.textPrimary,
        textAlign: 'center',
        marginBottom: Spacing.sm,
    },
    description: {
        fontSize: FontSizes.sm,
        color: DiscordColors.textSecondary,
        textAlign: 'center',
        marginBottom: Spacing.xl,
    },
    codeContainer: {
        marginBottom: Spacing.lg,
    },
    codeLabel: {
        fontSize: FontSizes.xs,
        fontWeight: '600',
        color: DiscordColors.textSecondary,
        letterSpacing: 0.5,
        marginBottom: Spacing.sm,
    },
    codeBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: DiscordColors.backgroundDarker,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
    },
    codeText: {
        flex: 1,
        fontSize: FontSizes.lg,
        fontWeight: '600',
        color: DiscordColors.textPrimary,
        letterSpacing: 1,
    },
    copyButton: {
        padding: Spacing.sm,
        borderRadius: BorderRadius.sm,
        backgroundColor: DiscordColors.backgroundLight,
    },
    copiedButton: {
        backgroundColor: DiscordColors.success + '30',
    },
    copiedText: {
        fontSize: FontSizes.xs,
        color: DiscordColors.success,
        marginTop: Spacing.xs,
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: DiscordColors.primary + '15',
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        marginBottom: Spacing.lg,
    },
    infoText: {
        flex: 1,
        marginLeft: Spacing.sm,
        fontSize: FontSizes.sm,
        color: DiscordColors.textSecondary,
    },
    regenerateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: DiscordColors.backgroundLight,
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        gap: Spacing.sm,
    },
    regenerateText: {
        fontSize: FontSizes.md,
        fontWeight: '600',
        color: DiscordColors.textPrimary,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    footer: {
        padding: Spacing.lg,
        borderTopWidth: 1,
        borderTopColor: DiscordColors.divider,
    },
    closeFooterButton: {
        backgroundColor: DiscordColors.primary,
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
    },
    closeFooterText: {
        fontSize: FontSizes.md,
        fontWeight: '600',
        color: DiscordColors.textPrimary,
    },
});
