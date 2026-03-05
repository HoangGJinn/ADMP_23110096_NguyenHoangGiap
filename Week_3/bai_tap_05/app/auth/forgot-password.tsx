import { CustomButton } from '@/components/auth/CustomButton';
import { CustomInput } from '@/components/auth/CustomInput';
import { DiscordColors, FontSizes, Spacing } from '@/constants/discord-theme';
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

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const validateForm = (): boolean => {
    if (!email.trim()) {
      setError('Vui lòng nhập email');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Email không hợp lệ');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    setError('');
    if (!validateForm()) return;

    setLoading(true);
    try {
      await authService.forgotPassword({ email });
      setSuccess(true);
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    router.push({
      pathname: '/auth/reset-password',
      params: { email },
    });
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
              <Ionicons name="mail-outline" size={48} color={DiscordColors.primary} />
            </View>
            <Text style={styles.title}>Quên mật khẩu</Text>
            <Text style={styles.subtitle}>
              Nhập email của bạn để nhận mã OTP đặt lại mật khẩu
            </Text>
          </View>

          {success ? (
            /* Success State */
            <View style={styles.successContainer}>
              <View style={styles.successIcon}>
                <Ionicons name="checkmark-circle" size={64} color={DiscordColors.success} />
              </View>
              <Text style={styles.successTitle}>Đã gửi mã OTP!</Text>
              <Text style={styles.successText}>
                Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư.
              </Text>
              <Text style={styles.noteText}>
                Lưu ý: Nếu chưa cấu hình email server, bạn có thể lấy mã OTP từ bảng 
                password_reset_otp trong database.
              </Text>
              <CustomButton
                title="Tiếp tục đặt lại mật khẩu"
                onPress={handleContinue}
                style={{ marginTop: Spacing.xl }}
              />
            </View>
          ) : (
            /* Form */
            <View style={styles.form}>
              <CustomInput
                label="Email"
                placeholder="Nhập địa chỉ email"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setError('');
                }}
                error={error}
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
              />

              <CustomButton
                title="Gửi mã OTP"
                onPress={handleSubmit}
                loading={loading}
              />
            </View>
          )}

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
    paddingHorizontal: Spacing.lg,
  },
  form: {
    width: '100%',
  },
  successContainer: {
    alignItems: 'center',
  },
  successIcon: {
    marginBottom: Spacing.lg,
  },
  successTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: 'bold',
    color: DiscordColors.success,
    marginBottom: Spacing.sm,
  },
  successText: {
    fontSize: FontSizes.md,
    color: DiscordColors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  noteText: {
    fontSize: FontSizes.sm,
    color: DiscordColors.warning,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingHorizontal: Spacing.lg,
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
