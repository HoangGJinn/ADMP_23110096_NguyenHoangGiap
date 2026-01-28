import { CustomButton } from '@/components/auth/CustomButton';
import { BorderRadius, DiscordColors, FontSizes, Spacing } from '@/constants/discord-theme';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  const handleChangePassword = () => {
    router.push('/(app)/change-password');
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

  const avatarColor = getAvatarColor(user?.userName || 'User');
  const initials = (user?.userName || 'U').charAt(0).toUpperCase();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Banner */}
        <View style={styles.banner}>
          <View style={[styles.bannerOverlay, { backgroundColor: avatarColor }]} />
        </View>

        {/* Profile Avatar */}
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.statusBadge}>
            <Ionicons name="ellipse" size={16} color={DiscordColors.success} />
          </View>
        </View>

        {/* User Info Card */}
        <View style={styles.card}>
          {/* Username */}
          <View style={styles.usernameContainer}>
            <Text style={styles.displayName}>{user?.displayName || user?.userName}</Text>
            <Text style={styles.username}>@{user?.userName}</Text>
          </View>

          <View style={styles.divider} />

          {/* Info Section */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>THÔNG TIN TÀI KHOẢN</Text>

            <View style={styles.infoItem}>
              <Ionicons name="person-outline" size={20} color={DiscordColors.textSecondary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>User ID</Text>
                <Text style={styles.infoValue}>{user?.userId}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <Ionicons name="at-outline" size={20} color={DiscordColors.textSecondary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Tên đăng nhập</Text>
                <Text style={styles.infoValue}>{user?.userName}</Text>
              </View>
            </View>

            {user?.email && (
              <View style={styles.infoItem}>
                <Ionicons name="mail-outline" size={20} color={DiscordColors.textSecondary} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Email</Text>
                  <Text style={styles.infoValue}>{user.email}</Text>
                </View>
              </View>
            )}
          </View>

          <View style={styles.divider} />

          {/* Actions */}
          <View style={styles.actionsSection}>
            <TouchableOpacity style={styles.actionItem} onPress={handleChangePassword}>
              <Ionicons name="key-outline" size={20} color={DiscordColors.textSecondary} />
              <Text style={styles.actionText}>Đổi mật khẩu</Text>
              <Ionicons name="chevron-forward" size={20} color={DiscordColors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout Button */}
        <View style={styles.logoutContainer}>
          <CustomButton
            title="Đăng xuất"
            onPress={handleLogout}
            variant="secondary"
            style={styles.logoutButton}
          />
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
  scrollContent: {
    flexGrow: 1,
  },
  banner: {
    height: 100,
    backgroundColor: DiscordColors.backgroundDarker,
    position: 'relative',
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.6,
  },
  avatarContainer: {
    alignItems: 'center',
    marginTop: -50,
    zIndex: 1,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 6,
    borderColor: DiscordColors.backgroundDark,
  },
  avatarText: {
    fontSize: 40,
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
  usernameContainer: {
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
  },
  divider: {
    height: 1,
    backgroundColor: DiscordColors.divider,
    marginHorizontal: Spacing.lg,
  },
  infoSection: {
    padding: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    color: DiscordColors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: Spacing.md,
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
  actionsSection: {
    padding: Spacing.lg,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  actionText: {
    flex: 1,
    fontSize: FontSizes.md,
    color: DiscordColors.textPrimary,
    marginLeft: Spacing.md,
  },
  logoutContainer: {
    padding: Spacing.xl,
    paddingTop: Spacing.xxxl,
  },
  logoutButton: {
    borderColor: DiscordColors.error,
  },
});
