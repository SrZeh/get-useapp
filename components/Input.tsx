import React from 'react';
import {
  TextInput,
  View,
  Text,
  ViewStyle,
  TextStyle,
  TextInputProps,
  StyleSheet,
} from 'react-native';
import { ThemedText } from './themed-text';
import { useThemeColors } from '@/utils';

type InputProps = TextInputProps & {
  label?: string;
  error?: string;
  helperText?: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
};

export function Input({
  label,
  error,
  helperText,
  containerStyle,
  inputStyle,
  leftElement,
  rightElement,
  style,
  placeholderTextColor,
  ...rest
}: InputProps) {
  const colors = useThemeColors();
  const hasError = !!error;

  const borderColor = hasError
    ? colors.semantic.error
    : colors.border.default;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <ThemedText
          type="caption-1"
          style={[
            styles.label,
            hasError && { color: '#ef4444' },
          ]}
        >
          {label}
        </ThemedText>
      )}

      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: colors.input.bg,
            borderColor,
            borderWidth: hasError ? 2 : 1,
          },
        ]}
      >
        {leftElement && (
          <View style={styles.leftElement}>{leftElement}</View>
        )}

        <TextInput
          style={[
            styles.input,
            {
              color: colors.text.primary,
            },
            leftElement && styles.inputWithLeft,
            rightElement && styles.inputWithRight,
            inputStyle,
            style,
          ]}
          placeholderTextColor={placeholderTextColor || colors.input.placeholder}
          accessibilityLabel={label || rest.accessibilityLabel}
          accessibilityHint={rest.accessibilityHint}
          {...rest}
        />

        {rightElement && (
          <View style={styles.rightElement}>{rightElement}</View>
        )}
      </View>

      {(error || helperText) && (
        <View style={styles.helperContainer}>
          {error ? (
            <ThemedText
              type="caption-2"
              style={[styles.helperText, styles.errorText]}
              lightColor={colors.semantic.error}
              darkColor={colors.semantic.error}
            >
              {error}
            </ThemedText>
          ) : (
            helperText && (
              <ThemedText
                type="caption-2"
                style={styles.helperText}
                lightColor={colors.text.quaternary}
                darkColor={colors.text.quaternary}
              >
                {helperText}
              </ThemedText>
            )
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 16,
    minHeight: 48,
  },
  input: {
    flex: 1,
    fontSize: 17,
    lineHeight: 22,
    paddingVertical: 12,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro", system-ui, sans-serif',
  },
  inputWithLeft: {
    marginLeft: 8,
    paddingLeft: 0,
  },
  inputWithRight: {
    marginRight: 8,
    paddingRight: 0,
  },
  leftElement: {
    marginRight: 8,
  },
  rightElement: {
    marginLeft: 8,
  },
  helperContainer: {
    marginTop: 8,
  },
  helperText: {
    fontSize: 11,
    lineHeight: 13,
  },
  errorText: {
    fontWeight: '500',
  },
});

