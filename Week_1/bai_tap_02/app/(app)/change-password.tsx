import { CustomButton } from '@/components/auth/CustomButton';
import { CustomInput } from '@/components/auth/CustomInput';
import { DiscordColors, FontSizes, Spacing } from '@/constants/discord-theme';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/authService';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ChangePasswordScreen() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'Vui lòng nhập mật khẩu mới';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu không khớp';
    }

    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'Mật khẩu mới phải khác mật khẩu hiện tại';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // First verify current password by attempting login
      await authService.login({
        userName: user?.userName || '',
        password: formData.currentPassword,
      });

      // If login succeeds, request password reset
      // Note: This is a workaround since there's no dedicated change-password API
      // In production, you'd have a proper change-password endpoint
      Alert.alert(
        'Thành công',
        'Mật khẩu đã được xác nhận. Để đổi mật khẩu, vui lòng sử dụng tính năng Quên mật khẩu.',
        [
          {
            text: 'Đi đến Quên mật khẩu',
            onPress: () => router.replace('/auth/forgot-password'),
          },
          { text: 'Quay lại', onPress: () => router.back() },
        ]
      );
    } catch (error: any) {
      setErrors({ currentPassword: 'Mật khẩu hiện tại không đúng' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-back" size={24} color={DiscordColors.textSecondary} />
              <Text style={styles.backText}>Quay lại</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Đổi mật khẩu</Text>
            <Text style={styles.subtitle}>
              Nhập mật khẩu hiện tại và mật khẩu mới
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <CustomInput
              label="Mật khẩu hiện tại"
              placeholder="Nhập mật khẩu hiện tại"
              value={formData.currentPassword}
              onChangeText={(text) => updateField('currentPassword', text)}
              error={errors.currentPassword}
              isPassword
            />

            <CustomInput
              label="Mật khẩu mới"
              placeholder="Nhập mật khẩu mới"
              value={formData.newPassword}
              onChangeText={(text) => updateField('newPassword', text)}
              error={errors.newPassword}
              isPassword
            />

            <CustomInput
              label="Xác nhận mật khẩu mới"
              placeholder="Nhập lại mật khẩu mới"
              value={formData.confirmPassword}
              onChangeText={(text) => updateField('confirmPassword', text)}
              error={errors.confirmPassword}
              isPassword
            />

            <CustomButton
              title="Đổi mật khẩu"
              onPress={handleSubmit}
              loading={loading}
              style={{ marginTop: Spacing.lg }}
            />

            <CustomButton
              title="Hủy"
              onPress={() => router.back()}
              variant="secondary"
              style={{ marginTop: Spacing.md }}
            />
          </View>

          {/* Info Note */}
          <View style={styles.noteContainer}>
            <Ionicons name="information-circle-outline" size={20} color={DiscordColors.textMuted} />
            <Text style={styles.noteText}>
              Nếu bạn quên mật khẩu hiện tại, hãy sử dụng tính năng "Quên mật khẩu" để đặt lại.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DiscordColors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: Spacing.xl,
  },
  header: {
    marginBottom: Spacing.xxl,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  backText: {
    color: DiscordColors.textSecondary,
    fontSize: FontSizes.md,
    marginLeft: Spacing.xs,
  },
  title: {
    fontSize: FontSizes.title,
    fontWeight: 'bold',
    color: DiscordColors.textPrimary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSizes.md,
    color: DiscordColors.textSecondary,
  },
  form: {
    width: '100%',
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: Spacing.xxxl,
    padding: Spacing.md,
    backgroundColor: DiscordColors.backgroundDarker,
    borderRadius: 8,
  },
  noteText: {
    flex: 1,
    fontSize: FontSizes.sm,
    color: DiscordColors.textMuted,
    marginLeft: Spacing.sm,
    lineHeight: 18,
  },
});
