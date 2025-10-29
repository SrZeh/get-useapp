import React, { useState, useCallback } from 'react';
import {
  TextInput,
  View,
  Text,
  ViewStyle,
  TextStyle,
  TextInputProps,
  StyleSheet,
  NativeSyntheticEvent,
  TextInputFocusEventData,
} from 'react-native';
import { z } from 'zod';
import { ThemedText } from './themed-text';
import { useThemeColors } from '@/utils';
import { Spacing, BorderRadius } from '@/constants/spacing';

type InputProps = TextInputProps & {
  label?: string;
  error?: string;
  helperText?: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  zodSchema?: z.ZodSchema<any>;
  showErrorOnBlur?: boolean;
  onValidationChange?: (isValid: boolean, error?: string) => void;
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
  validateOnChange = false,
  validateOnBlur = true,
  zodSchema,
  showErrorOnBlur = true,
  onValidationChange,
  value,
  onChangeText,
  onBlur,
  ...rest
}: InputProps) {
  const colors = useThemeColors();
  const [localError, setLocalError] = useState<string | undefined>();
  const [isBlurred, setIsBlurred] = useState(false);

  const validateValue = useCallback((val: string) => {
    if (!zodSchema) return { valid: true };

    const result = zodSchema.safeParse(val);
    const isValid = result.success;
    const errorMsg = result.success 
      ? undefined 
      : result.error.errors[0]?.message;

    return { valid: isValid, error: errorMsg };
  }, [zodSchema]);

  const handleChange = useCallback((text: string) => {
    onChangeText?.(text);

    // Real-time validation
    if (validateOnChange) {
      const validation = validateValue(text);
      setLocalError(validation.error);
      onValidationChange?.(validation.valid, validation.error);
    }
  }, [onChangeText, validateOnChange, validateValue, onValidationChange]);

  const handleBlur = useCallback((e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setIsBlurred(true);
    onBlur?.(e);

    // Validate on blur if enabled
    if (validateOnBlur && value) {
      const validation = validateValue(value);
      setLocalError(validation.error);
      onValidationChange?.(validation.valid, validation.error);
    }
  }, [onBlur, validateOnBlur, value, validateValue, onValidationChange]);

  const displayError = (showErrorOnBlur && isBlurred) || !showErrorOnBlur 
    ? error || localError 
    : undefined;

  const hasError = !!displayError;

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
            hasError && { color: colors.semantic.error },
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
          accessibilityHint={
            rest.accessibilityHint ||
            (hasError ? `Erro: ${displayError}` : helperText) ||
            undefined
          }
          accessibilityRole="text"
          accessibilityState={{
            disabled: rest.editable === false,
            invalid: hasError,
          }}
          accessibilityLiveRegion={hasError ? 'polite' : undefined}
          value={value}
          onChangeText={handleChange}
          onBlur={handleBlur}
          {...rest}
        />

        {rightElement && (
          <View style={styles.rightElement}>{rightElement}</View>
        )}
      </View>

      {(displayError || helperText) && (
        <View style={styles.helperContainer}>
          {displayError ? (
            <ThemedText
              type="caption-2"
              style={[styles.helperText, styles.errorText]}
              lightColor={colors.semantic.error}
              darkColor={colors.semantic.error}
              accessibilityRole="alert"
              accessibilityLiveRegion="polite"
            >
              {displayError}
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
    marginBottom: Spacing.sm,
  },
  label: {
    marginBottom: Spacing['2xs'],
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm,
    minHeight: 48, // WCAG minimum touch target
  },
  input: {
    flex: 1,
    fontSize: 17, // iOS body size - using native TextInput, so direct value is acceptable
    lineHeight: 22,
    paddingVertical: Spacing.xs,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro", system-ui, sans-serif',
  },
  inputWithLeft: {
    marginLeft: Spacing['2xs'],
    paddingLeft: 0,
  },
  inputWithRight: {
    marginRight: Spacing['2xs'],
    paddingRight: 0,
  },
  leftElement: {
    marginRight: Spacing['2xs'],
  },
  rightElement: {
    marginLeft: Spacing['2xs'],
  },
  helperContainer: {
    marginTop: Spacing['2xs'],
  },
  helperText: {
    fontSize: 11, // caption-2 size - using native TextInput helper, acceptable
    lineHeight: 13,
  },
  errorText: {
    fontWeight: '500',
  },
});

