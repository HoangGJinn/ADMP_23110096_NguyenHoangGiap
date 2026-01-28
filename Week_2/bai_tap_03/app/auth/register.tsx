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

export default function RegisterScreen() {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Vui lòng nhập tên đăng nhập';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Tên đăng nhập phải có ít nhất 3 ký tự';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu không khớp';
    }

    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Vui lòng nhập tên hiển thị';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        displayName: formData.displayName,
      });
      Alert.alert(
        'Đăng ký thành công',
        'Tài khoản của bạn đã được tạo. Vui lòng đăng nhập.',
        [{ text: 'Đăng nhập', onPress: () => router.replace('/auth/login') }]
      );
    } catch (error: any) {
      Alert.alert('Lỗi đăng ký', error.message || 'Đã xảy ra lỗi');
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
          showsVerticalScrollIndicator={false}
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
            <Text style={styles.title}>Tạo tài khoản</Text>
            <Text style={styles.subtitle}>
              Điền thông tin để tạo tài khoản mới
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <CustomInput
              label="Tên đăng nhập"
              placeholder="Nhập tên đăng nhập"
              value={formData.username}
              onChangeText={(text) => updateField('username', text)}
              error={errors.username}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <CustomInput
              label="Email"
              placeholder="Nhập địa chỉ email"
              value={formData.email}
              onChangeText={(text) => updateField('email', text)}
              error={errors.email}
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
            />

            <CustomInput
              label="Tên hiển thị"
              placeholder="Nhập tên hiển thị"
              value={formData.displayName}
              onChangeText={(text) => updateField('displayName', text)}
              error={errors.displayName}
            />

            <CustomInput
              label="Mật khẩu"
              placeholder="Nhập mật khẩu"
              value={formData.password}
              onChangeText={(text) => updateField('password', text)}
              error={errors.password}
              isPassword
            />

            <CustomInput
              label="Xác nhận mật khẩu"
              placeholder="Nhập lại mật khẩu"
              value={formData.confirmPassword}
              onChangeText={(text) => updateField('confirmPassword', text)}
              error={errors.confirmPassword}
              isPassword
            />

            <CustomButton
              title="Đăng ký"
              onPress={handleRegister}
              loading={loading}
              style={{ marginTop: Spacing.md }}
            />
          </View>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Đã có tài khoản? </Text>
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
    marginBottom: Spacing.xxl,
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
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.xxl,
    paddingBottom: Spacing.xxl,
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
