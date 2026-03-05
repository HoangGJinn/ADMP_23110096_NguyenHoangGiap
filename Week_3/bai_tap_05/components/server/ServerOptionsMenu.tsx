import { BorderRadius, DiscordColors, FontSizes, Spacing } from '@/constants/discord-theme';
import { ServerResponse } from '@/services/serverService';
import { Ionicons } from '@expo/vector-icons';
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

type MenuOption = {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    action: () => void;
    color?: string;
    showFor: ('OWNER' | 'ADMIN' | 'MEMBER')[];
};

interface ServerOptionsMenuProps {
    visible: boolean;
    server: ServerResponse | null;
    currentUserRole: 'OWNER' | 'ADMIN' | 'MEMBER';
    onClose: () => void;
    onInvitePress: () => void;
    onSettingsPress: () => void;
    onMembersPress: () => void;
    onLeavePress: () => void;
    onDeletePress: () => void;
}

export default function ServerOptionsMenu({
    visible,
    server,
    currentUserRole,
    onClose,
    onInvitePress,
    onSettingsPress,
    onMembersPress,
    onLeavePress,
    onDeletePress,
}: ServerOptionsMenuProps) {
    if (!server) return null;

    const menuOptions: MenuOption[] = [
        {
            icon: 'person-add-outline',
            label: 'Mời bạn bè',
            action: onInvitePress,
            showFor: ['OWNER', 'ADMIN', 'MEMBER'],
        },
        {
            icon: 'settings-outline',
            label: 'Cài đặt server',
            action: onSettingsPress,
            showFor: ['OWNER', 'ADMIN'],
        },
        {
            icon: 'people-outline',
            label: 'Xem thành viên',
            action: onMembersPress,
            showFor: ['OWNER', 'ADMIN', 'MEMBER'],
        },
        {
            icon: 'exit-outline',
            label: 'Rời server',
            action: onLeavePress,
            color: DiscordColors.warning,
            showFor: ['ADMIN', 'MEMBER'],
        },
        {
            icon: 'trash-outline',
            label: 'Xóa server',
            action: onDeletePress,
            color: DiscordColors.error,
            showFor: ['OWNER'],
        },
    ];

    const filteredOptions = menuOptions.filter(option =>
        option.showFor.includes(currentUserRole)
    );

    const handleOptionPress = (option: MenuOption) => {
        onClose();
        // Small delay to allow modal animation to complete
        setTimeout(() => {
            option.action();
        }, 200);
    };

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent={true}
            onRequestClose={onClose}
        >
            <TouchableOpacity
                style={styles.overlay}
                activeOpacity={1}
                onPress={onClose}
            >
                <View style={styles.container}>
                    {/* Server Header */}
                    <View style={styles.header}>
                        <View style={styles.serverIcon}>
                            <Text style={styles.serverIconText}>
                                {server.name.substring(0, 2).toUpperCase()}
                            </Text>
                        </View>
                        <View style={styles.serverInfo}>
                            <Text style={styles.serverName} numberOfLines={1}>
                                {server.name}
                            </Text>
                            <Text style={styles.serverStats}>
                                {server.memberCount} thành viên • {server.channelCount} kênh
                            </Text>
                        </View>
                    </View>

                    {/* Divider */}
                    <View style={styles.divider} />

                    {/* Menu Options */}
                    <View style={styles.menuContainer}>
                        {filteredOptions.map((option, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.menuItem}
                                onPress={() => handleOptionPress(option)}
                            >
                                <Ionicons
                                    name={option.icon}
                                    size={22}
                                    color={option.color || DiscordColors.textSecondary}
                                />
                                <Text style={[
                                    styles.menuItemText,
                                    option.color && { color: option.color }
                                ]}>
                                    {option.label}
                                </Text>
                                <Ionicons
                                    name="chevron-forward"
                                    size={18}
                                    color={DiscordColors.textMuted}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Cancel Button */}
                    <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                        <Text style={styles.cancelText}>Đóng</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
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
        paddingBottom: Spacing.xl,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.lg,
    },
    serverIcon: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: DiscordColors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    serverIconText: {
        fontSize: FontSizes.lg,
        fontWeight: 'bold',
        color: DiscordColors.textPrimary,
    },
    serverInfo: {
        marginLeft: Spacing.md,
        flex: 1,
    },
    serverName: {
        fontSize: FontSizes.lg,
        fontWeight: 'bold',
        color: DiscordColors.textPrimary,
    },
    serverStats: {
        fontSize: FontSizes.sm,
        color: DiscordColors.textMuted,
        marginTop: 2,
    },
    divider: {
        height: 1,
        backgroundColor: DiscordColors.divider,
        marginHorizontal: Spacing.lg,
    },
    menuContainer: {
        paddingVertical: Spacing.sm,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
    },
    menuItemText: {
        flex: 1,
        marginLeft: Spacing.md,
        fontSize: FontSizes.md,
        color: DiscordColors.textPrimary,
    },
    cancelButton: {
        marginHorizontal: Spacing.lg,
        marginTop: Spacing.sm,
        backgroundColor: DiscordColors.backgroundLight,
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
    },
    cancelText: {
        fontSize: FontSizes.md,
        fontWeight: '600',
        color: DiscordColors.textPrimary,
    },
});
