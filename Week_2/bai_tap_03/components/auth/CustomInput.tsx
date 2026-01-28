import { BorderRadius, DiscordColors, FontSizes, Spacing } from '@/constants/discord-theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    TextInputProps,
    TouchableOpacity,
    View,
} from 'react-native';

interface CustomInputProps extends TextInputProps {
  label?: string;
  error?: string;
  isPassword?: boolean;
}

export const CustomInput: React.FC<CustomInputProps> = ({
  label,
  error,
  isPassword = false,
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, error && styles.labelError]}>
          {label}
          {error && <Text style={styles.errorText}> - {error}</Text>}
        </Text>
      )}
      <View style={styles.inputWrapper}>
        <TextInput
          style={[
            styles.input,
            isFocused && styles.inputFocused,
            error && styles.inputError,
            isPassword && styles.inputWithIcon,
            style,
          ]}
          placeholderTextColor={DiscordColors.inputPlaceholder}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={isPassword && !showPassword}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons
              name={showPassword ? 'eye-off' : 'eye'}
              size={20}
              color={DiscordColors.textMuted}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
    width: '100%',
  },
  label: {
    color: DiscordColors.textSecondary,
    fontSize: FontSizes.sm,
    fontWeight: '600',
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  labelError: {
    color: DiscordColors.error,
  },
  errorText: {
    color: DiscordColors.error,
    fontSize: FontSizes.sm,
    fontWeight: '400',
    fontStyle: 'italic',
    textTransform: 'none',
  },
  inputWrapper: {
    position: 'relative',
    width: '100%',
  },
  input: {
    backgroundColor: DiscordColors.inputBackground,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: DiscordColors.inputBorder,
    color: DiscordColors.textPrimary,
    fontSize: FontSizes.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    width: '100%',
  },
  inputFocused: {
    borderColor: DiscordColors.inputFocusBorder,
  },
  inputError: {
    borderColor: DiscordColors.error,
  },
  inputWithIcon: {
    paddingRight: 45,
  },
  eyeIcon: {
    position: 'absolute',
    right: Spacing.md,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
});

export default CustomInput;
