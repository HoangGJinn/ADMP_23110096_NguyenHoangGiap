import { BorderRadius, DiscordColors, FontSizes, Spacing } from '@/constants/discord-theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface AddServerModalProps {
    visible: boolean;
    onClose: () => void;
    onCreateServer: () => void;
    onJoinServer: () => void;
}

export default function AddServerModal({
    visible,
    onClose,
    onCreateServer,
    onJoinServer,
}: AddServerModalProps) {
    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={DiscordColors.textSecondary} />
                        </TouchableOpacity>
                        <Text style={styles.title}>Thêm Server</Text>
                        <View style={{ width: 40 }} />
                    </View>

                    <View style={styles.content}>
                        <Text style={styles.subtitle}>
                            Tạo server mới hoặc tham gia server hiện có
                        </Text>

                        {/* Create Server Option */}
                        <TouchableOpacity
                            style={styles.option}
                            onPress={() => {
                                onClose();
                                onCreateServer();
                            }}
                        >
                            <View style={[styles.optionIcon, { backgroundColor: DiscordColors.primary + '20' }]}>
                                <Ionicons name="add-circle" size={32} color={DiscordColors.primary} />
                            </View>
                            <View style={styles.optionContent}>
                                <Text style={styles.optionTitle}>Tạo Server Mới</Text>
                                <Text style={styles.optionDescription}>
                                    Tạo server của riêng bạn và mời bạn bè tham gia
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={24} color={DiscordColors.textMuted} />
                        </TouchableOpacity>

                        {/* Divider */}
                        <View style={styles.divider} />

                        {/* Join Server Option */}
                        <TouchableOpacity
                            style={styles.option}
                            onPress={() => {
                                onClose();
                                onJoinServer();
                            }}
                        >
                            <View style={[styles.optionIcon, { backgroundColor: DiscordColors.success + '20' }]}>
                                <Ionicons name="enter" size={32} color={DiscordColors.success} />
                            </View>
                            <View style={styles.optionContent}>
                                <Text style={styles.optionTitle}>Tham Gia Server</Text>
                                <Text style={styles.optionDescription}>
                                    Nhập mã mời để tham gia server của bạn bè
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={24} color={DiscordColors.textMuted} />
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
    subtitle: {
        fontSize: FontSizes.md,
        color: DiscordColors.textSecondary,
        textAlign: 'center',
        marginBottom: Spacing.xl,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        backgroundColor: DiscordColors.backgroundDarker,
        borderRadius: BorderRadius.lg,
    },
    optionIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    optionContent: {
        flex: 1,
        marginHorizontal: Spacing.md,
    },
    optionTitle: {
        fontSize: FontSizes.lg,
        fontWeight: '600',
        color: DiscordColors.textPrimary,
        marginBottom: Spacing.xs,
    },
    optionDescription: {
        fontSize: FontSizes.sm,
        color: DiscordColors.textSecondary,
    },
    divider: {
        height: Spacing.md,
    },
});
