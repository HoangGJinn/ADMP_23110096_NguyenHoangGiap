import { CustomButton } from '@/components/auth/CustomButton';
import { CustomInput } from '@/components/auth/CustomInput';
import { DiscordColors, FontSizes, Spacing } from '@/constants/discord-theme';
import { useAuth } from '@/contexts/AuthContext';
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

export default function LoginScreen() {
  const { login } = useAuth();
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ userName?: string; password?: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { userName?: string; password?: string } = {};

    if (!userName.trim()) {
      newErrors.userName = 'Vui lòng nhập tên đăng nhập';
    }
    if (!password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await login({ userName, password });
      // Navigation will be handled by the root layout based on auth state
    } catch (error: any) {
      Alert.alert('Lỗi đăng nhập', error.message || 'Đã xảy ra lỗi');
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
            <View style={styles.logoContainer}>
              <Ionicons name="chatbubble-ellipses" size={48} color={DiscordColors.primary} />
            </View>
            <Text style={styles.title}>Chào mừng trở lại!</Text>
            <Text style={styles.subtitle}>
              Đăng nhập để tiếp tục sử dụng ứng dụng
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Text style={styles.sectionLabel}>THÔNG TIN TÀI KHOẢN</Text>

            <CustomInput
              label="Tên đăng nhập"
              placeholder="Nhập tên đăng nhập"
              value={userName}
              onChangeText={(text) => {
                setUserName(text);
                setErrors((prev) => ({ ...prev, userName: undefined }));
              }}
              error={errors.userName}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <CustomInput
              label="Mật khẩu"
              placeholder="Nhập mật khẩu"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setErrors((prev) => ({ ...prev, password: undefined }));
              }}
              error={errors.password}
              isPassword
            />

            <TouchableOpacity
              onPress={() => router.push('/auth/forgot-password')}
              style={styles.forgotPassword}
            >
              <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
            </TouchableOpacity>

            <CustomButton
              title="Đăng nhập"
              onPress={handleLogin}
              loading={loading}
            />
          </View>

          {/* Register Link */}
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Chưa có tài khoản? </Text>
            <TouchableOpacity onPress={() => router.push('/auth/register')}>
              <Text style={styles.registerLink}>Đăng ký ngay</Text>
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
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xxxl,
  },
  logoContainer: {
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
  sectionLabel: {
    color: DiscordColors.textSecondary,
    fontSize: FontSizes.xs,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: Spacing.lg,
  },
  forgotPassword: {
    alignSelf: 'flex-start',
    marginBottom: Spacing.xl,
    marginTop: -Spacing.sm,
  },
  forgotPasswordText: {
    color: DiscordColors.textLink,
    fontSize: FontSizes.sm,
    fontWeight: '500',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.xxl,
  },
  registerText: {
    color: DiscordColors.textSecondary,
    fontSize: FontSizes.md,
  },
  registerLink: {
    color: DiscordColors.textLink,
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
});
