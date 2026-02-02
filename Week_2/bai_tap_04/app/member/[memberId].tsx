import { BorderRadius, DiscordColors, FontSizes, Spacing } from '@/constants/discord-theme';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface MemberProfile {
    id: number;
    userId: number;
    userName: string;
    displayName: string | null;
    nickname: string | null;
    role: string;
    avatarUrl?: string | null;
    bio?: string | null;
    pronouns?: string | null;
    country?: string | null;
    birthDate?: string | null;
}

export default function MemberProfileScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{
        memberId?: string;
        userId?: string;
        userName?: string;
        displayName?: string;
        nickname?: string;
        role?: string;
        serverId?: string;
        serverName?: string;
    }>();

    const [member, setMember] = useState<MemberProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [avatarError, setAvatarError] = useState(false);

    useEffect(() => {
        const loadMemberData = async () => {
            setIsLoading(true);
            try {
                // If we have userId, we could fetch their profile from API
                // For now, use the params passed from search
                const memberData: MemberProfile = {
                    id: Number(params.memberId) || 0,
                    userId: Number(params.userId) || 0,
                    userName: params.userName || 'Unknown',
                    displayName: params.displayName || null,
                    nickname: params.nickname || null,
                    role: params.role || 'MEMBER',
                };
                setMember(memberData);
            } catch (error) {
                console.error('Error loading member:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadMemberData();
    }, [params]);

    const handleBack = () => {
        router.back();
    };

    // Generate avatar color based on username
    const getAvatarColor = (name: string) => {
        const colors = [
            '#5865F2', '#57F287', '#FEE75C', '#EB459E', '#ED4245',
            '#3BA55C', '#FAA61A', '#9B84EE', '#F47FFF', '#00D4AA',
        ];
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'OWNER':
                return '#FAA61A';
            case 'ADMIN':
                return '#ED4245';
            default:
                return DiscordColors.textSecondary;
        }
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={DiscordColors.blurple} />
                </View>
            </SafeAreaView>
        );
    }

    if (!member) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={DiscordColors.textPrimary} />
                    </TouchableOpacity>
                </View>
                <View style={styles.loadingContainer}>
                    <Text style={styles.errorText}>Không tìm thấy thông tin thành viên</Text>
                </View>
            </SafeAreaView>
        );
    }

    const avatarColor = getAvatarColor(member.userName);
    const initials = (member.userName || 'U').charAt(0).toUpperCase();
    const displayName = member.nickname || member.displayName || member.userName;

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={DiscordColors.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Hồ sơ thành viên</Text>
                    <View style={{ width: 40 }} />
                </View>

                {/* Banner */}
                <View style={styles.banner}>
                    <View style={[styles.bannerOverlay, { backgroundColor: avatarColor }]} />
                </View>

                {/* Avatar */}
                <View style={styles.avatarContainer}>
                    {member.avatarUrl && !avatarError ? (
                        <Image
                            source={{ uri: member.avatarUrl }}
                            style={styles.avatar}
                            onError={() => setAvatarError(true)}
                        />
                    ) : (
                        <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
                            <Text style={styles.avatarText}>{initials}</Text>
                        </View>
                    )}
                    <View style={styles.statusBadge}>
                        <Ionicons name="ellipse" size={16} color={DiscordColors.success} />
                    </View>
                </View>

                {/* User Info Card */}
                <View style={styles.card}>
                    <View style={styles.nameContainer}>
                        <Text style={styles.displayName}>{displayName}</Text>
                        <Text style={styles.username}>@{member.userName}</Text>
                        
                        {/* Role Badge */}
                        <View style={[styles.roleBadge, { backgroundColor: getRoleColor(member.role) + '20' }]}>
                            <Text style={[styles.roleText, { color: getRoleColor(member.role) }]}>
                                {member.role}
                            </Text>
                        </View>
                    </View>

                    {member.pronouns && (
                        <Text style={styles.pronouns}>{member.pronouns}</Text>
                    )}

                    {member.bio && (
                        <>
                            <View style={styles.divider} />
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>GIỚI THIỆU</Text>
                                <Text style={styles.bioText}>{member.bio}</Text>
                            </View>
                        </>
                    )}

                    <View style={styles.divider} />

                    {/* Info Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>THÔNG TIN</Text>

                        <View style={styles.infoItem}>
                            <Ionicons name="person-outline" size={20} color={DiscordColors.textSecondary} />
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>User ID</Text>
                                <Text style={styles.infoValue}>{member.userId}</Text>
                            </View>
                        </View>

                        {params.serverName && (
                            <View style={styles.infoItem}>
                                <Ionicons name="server-outline" size={20} color={DiscordColors.textSecondary} />
                                <View style={styles.infoContent}>
                                    <Text style={styles.infoLabel}>Server</Text>
                                    <Text style={styles.infoValue}>{params.serverName}</Text>
                                </View>
                            </View>
                        )}

                        {member.country && (
                            <View style={styles.infoItem}>
                                <Ionicons name="globe-outline" size={20} color={DiscordColors.textSecondary} />
                                <View style={styles.infoContent}>
                                    <Text style={styles.infoLabel}>Quốc gia</Text>
                                    <Text style={styles.infoValue}>{member.country}</Text>
                                </View>
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: DiscordColors.backgroundDark,
    },
    scrollView: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        backgroundColor: DiscordColors.backgroundDark,
    },
    backButton: {
        padding: Spacing.sm,
    },
    headerTitle: {
        fontSize: FontSizes.lg,
        fontWeight: '600',
        color: DiscordColors.textPrimary,
    },
    banner: {
        height: 80,
        backgroundColor: DiscordColors.backgroundDarker,
        position: 'relative',
    },
    bannerOverlay: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.6,
    },
    avatarContainer: {
        alignItems: 'center',
        marginTop: -45,
        zIndex: 1,
    },
    avatar: {
        width: 90,
        height: 90,
        borderRadius: 45,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 5,
        borderColor: DiscordColors.backgroundDark,
    },
    avatarText: {
        fontSize: 36,
        fontWeight: 'bold',
        color: DiscordColors.textPrimary,
    },
    statusBadge: {
        position: 'absolute',
        bottom: 2,
        right: '35%',
        backgroundColor: DiscordColors.backgroundDark,
        borderRadius: 10,
        padding: 2,
    },
    card: {
        backgroundColor: DiscordColors.backgroundDarker,
        marginHorizontal: Spacing.lg,
        marginTop: Spacing.lg,
        borderRadius: BorderRadius.lg,
        overflow: 'hidden',
    },
    nameContainer: {
        padding: Spacing.lg,
    },
    displayName: {
        fontSize: FontSizes.xxl,
        fontWeight: 'bold',
        color: DiscordColors.textPrimary,
        marginBottom: Spacing.xs,
    },
    username: {
        fontSize: FontSizes.md,
        color: DiscordColors.textSecondary,
        marginBottom: Spacing.sm,
    },
    roleBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.sm,
    },
    roleText: {
        fontSize: FontSizes.xs,
        fontWeight: '600',
    },
    pronouns: {
        fontSize: FontSizes.sm,
        color: DiscordColors.textSecondary,
        fontStyle: 'italic',
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.md,
    },
    divider: {
        height: 1,
        backgroundColor: DiscordColors.divider,
        marginHorizontal: Spacing.lg,
    },
    section: {
        padding: Spacing.lg,
    },
    sectionTitle: {
        fontSize: FontSizes.xs,
        fontWeight: '600',
        color: DiscordColors.textSecondary,
        letterSpacing: 0.5,
        marginBottom: Spacing.md,
    },
    bioText: {
        fontSize: FontSizes.md,
        color: DiscordColors.textPrimary,
        lineHeight: 20,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.sm,
    },
    infoContent: {
        marginLeft: Spacing.md,
        flex: 1,
    },
    infoLabel: {
        fontSize: FontSizes.sm,
        color: DiscordColors.textMuted,
    },
    infoValue: {
        fontSize: FontSizes.md,
        color: DiscordColors.textPrimary,
        marginTop: 2,
    },
    errorText: {
        fontSize: FontSizes.md,
        color: DiscordColors.textMuted,
    },
});
