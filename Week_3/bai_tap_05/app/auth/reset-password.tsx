import { CustomButton } from '@/components/auth/CustomButton';
import { CustomInput } from '@/components/auth/CustomInput';
import { DiscordColors, FontSizes, Spacing } from '@/constants/discord-theme';
import { authService } from '@/services/authService';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
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

export default function ResetPasswordScreen() {
  const params = useLocalSearchParams<{ email: string }>();
  const [formData, setFormData] = useState({
    email: params.email || '',
    otp: '',
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

    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    }

    if (!formData.otp.trim()) {
      newErrors.otp = 'Vui lòng nhập mã OTP';
    } else if (formData.otp.length !== 6) {
      newErrors.otp = 'Mã OTP phải có 6 ký tự';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'Vui lòng nhập mật khẩu mới';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu không khớp';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await authService.resetPassword({
        email: formData.email,
        otp: formData.otp,
        newPassword: formData.newPassword,
      });
      Alert.alert(
        'Thành công',
        'Mật khẩu đã được đổi thành công. Vui lòng đăng nhập với mật khẩu mới.',
        [{ text: 'Đăng nhập', onPress: () => router.replace('/auth/login') }]
      );
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Đã xảy ra lỗi');
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
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color={DiscordColors.textSecondary} />
            <Text style={styles.backText}>Quay lại</Text>
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="key-outline" size={48} color={DiscordColors.primary} />
            </View>
            <Text style={styles.title}>Đặt lại mật khẩu</Text>
            <Text style={styles.subtitle}>
              Nhập mã OTP và mật khẩu mới để hoàn tất
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <CustomInput
              label="Email"
              placeholder="Nhập email"
              value={formData.email}
              onChangeText={(text) => updateField('email', text)}
              error={errors.email}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <CustomInput
              label="Mã OTP"
              placeholder="Nhập mã 6 số"
              value={formData.otp}
              onChangeText={(text) => updateField('otp', text.replace(/[^0-9]/g, '').slice(0, 6))}
              error={errors.otp}
              keyboardType="number-pad"
              maxLength={6}
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
              label="Xác nhận mật khẩu"
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
              style={{ marginTop: Spacing.md }}
            />
          </View>

          {/* Back to Login */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Nhớ mật khẩu? </Text>
            <TouchableOpacity onPress={() => router.replace('/auth/login')}>
              <Text style={styles.loginLink}>Đăng nhập</Text>
            </TouchableOpacity>
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
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xxxl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: DiscordColors.backgroundDarker,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
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
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.xxxl,
  },
  loginText: {
    color: DiscordColors.textSecondary,
    fontSize: FontSizes.md,
  },
  loginLink: {
    color: DiscordColors.textLink,
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
});
