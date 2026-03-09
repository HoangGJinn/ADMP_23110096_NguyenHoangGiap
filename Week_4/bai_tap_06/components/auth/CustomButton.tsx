import { BorderRadius, DiscordColors, FontSizes, Spacing } from '@/constants/discord-theme';
import React from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextStyle,
    TouchableOpacity,
    ViewStyle,
} from 'react-native';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'link';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  style,
  textStyle,
}) => {
  const isDisabled = disabled || loading;

  const buttonStyle = [
    styles.button,
    variant === 'primary' && styles.buttonPrimary,
    variant === 'secondary' && styles.buttonSecondary,
    variant === 'link' && styles.buttonLink,
    isDisabled && styles.buttonDisabled,
    style,
  ];

  const buttonTextStyle = [
    styles.buttonText,
    variant === 'primary' && styles.textPrimary,
    variant === 'secondary' && styles.textSecondary,
    variant === 'link' && styles.textLink,
    isDisabled && styles.textDisabled,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'link' ? DiscordColors.textLink : DiscordColors.textPrimary}
          size="small"
        />
      ) : (
        <Text style={buttonTextStyle}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: BorderRadius.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    width: '100%',
  },
  buttonPrimary: {
    backgroundColor: DiscordColors.primary,
  },
  buttonSecondary: {
    backgroundColor: DiscordColors.backgroundLight,
    borderWidth: 1,
    borderColor: DiscordColors.divider,
  },
  buttonLink: {
    backgroundColor: 'transparent',
    paddingVertical: Spacing.xs,
    paddingHorizontal: 0,
    width: 'auto',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
  },
  textPrimary: {
    color: DiscordColors.textPrimary,
  },
  textSecondary: {
    color: DiscordColors.textSecondary,
  },
  textLink: {
    color: DiscordColors.textLink,
    fontSize: FontSizes.md,
    fontWeight: '500',
  },
  textDisabled: {
    color: DiscordColors.textMuted,
  },
});

export default CustomButton;
