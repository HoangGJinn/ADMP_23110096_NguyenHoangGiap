import { CustomButton } from '@/components/auth/CustomButton';
import { CustomInput } from '@/components/auth/CustomInput';
import { DiscordColors, FontSizes, Spacing } from '@/constants/discord-theme';
import api from '@/services/api';
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

export default function VerifyEmailScreen() {
  const params = useLocalSearchParams<{ email?: string; userName?: string }>();
  const [email, setEmail] = useState(params.email || '');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; otp?: string }>({});

  // Check if email was passed from login (should be read-only)
  const emailFromParams = !!params.email;

  const validateForm = (): boolean => {
    const newErrors: { email?: string; otp?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    if (!otp.trim()) {
      newErrors.otp = 'Vui lòng nhập mã xác thực';
    } else if (otp.length !== 6) {
      newErrors.otp = 'Mã xác thực phải có 6 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleVerify = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Use correct endpoint (api.ts BASE_URL already includes /api/auth)
      await api.post('/verify-account', { email, otp });
      Alert.alert(
        'Thành công',
        'Tài khoản đã được xác thực. Bạn có thể đăng nhập ngay bây giờ.',
        [{ text: 'Đăng nhập', onPress: () => router.replace('/auth/login') }]
      );
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Mã xác thực không đúng hoặc đã hết hạn');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email.trim()) {
      setErrors({ email: 'Vui lòng nhập email để gửi lại mã' });
      return;
    }

    setResending(true);
    try {
      // Use correct endpoint (api.ts BASE_URL already includes /api/auth)
      await api.post('/resend-otp', { email, type: 'VERIFY' });
      Alert.alert('Thành công', 'Mã xác thực mới đã được gửi đến email của bạn');
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể gửi lại mã xác thực');
    } finally {
      setResending(false);
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
            <Ionicons name="arrow-back" size={24} color={DiscordColors.textPrimary} />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="mail-outline" size={48} color={DiscordColors.primary} />
            </View>
            <Text style={styles.title}>Xác thực tài khoản</Text>
            <Text style={styles.subtitle}>
              Nhập mã xác thực đã được gửi đến email của bạn để kích hoạt tài khoản
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Text style={styles.sectionLabel}>THÔNG TIN XÁC THỰC</Text>

            <CustomInput
              label="Email"
              placeholder="Nhập email"
              value={email}
              onChangeText={(text) => {
                if (!emailFromParams) {
                  setEmail(text);
                  setErrors((prev) => ({ ...prev, email: undefined }));
                }
              }}
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!emailFromParams}
            />

            <CustomInput
              label="Mã xác thực (OTP)"
              placeholder="Nhập mã 6 ký tự"
              value={otp}
              onChangeText={(text) => {
                setOtp(text.toUpperCase());
                setErrors((prev) => ({ ...prev, otp: undefined }));
              }}
              error={errors.otp}
              maxLength={6}
              autoCapitalize="characters"
              autoFocus={emailFromParams}
            />

            <CustomButton
              title="Xác thực tài khoản"
              onPress={handleVerify}
              loading={loading}
            />

            <TouchableOpacity
              style={styles.resendButton}
              onPress={handleResendOtp}
              disabled={resending}
            >
              <Text style={styles.resendText}>
                {resending ? 'Đang gửi...' : 'Gửi lại mã xác thực'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Đã xác thực rồi? </Text>
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
    marginBottom: Spacing.lg,
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
    paddingHorizontal: Spacing.md,
  },
  form: {
    width: '100%',
  },
  sectionLabel: {
    color: DiscordColors.textSecondary,
    fontSize: FontSizes.xs,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: Spacing.lg,
  },
  resendButton: {
    alignItems: 'center',
    marginTop: Spacing.lg,
    padding: Spacing.md,
  },
  resendText: {
    color: DiscordColors.textLink,
    fontSize: FontSizes.md,
    fontWeight: '500',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.xxl,
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
