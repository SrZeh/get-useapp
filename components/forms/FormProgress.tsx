/**
 * Form progress indicator component
 * Shows visual progress for multi-step forms
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useThemeColors } from '@/utils';

type FormProgressProps = {
  steps: readonly string[];
  currentStep: number;
  showLabels?: boolean;
};

/**
 * Form progress indicator
 * Displays a progress bar with step indicators
 */
export function FormProgress({ steps, currentStep, showLabels = true }: FormProgressProps) {
  const colors = useThemeColors();

  return (
    <View style={styles.container}>
      <View style={styles.progressContainer}>
        {steps.map((_, index) => {
          const isActive = index <= currentStep;
          
          return (
            <View key={`step-${index}`} style={styles.stepContainer}>
              <View
                style={[
                  styles.progressBar,
                  {
                    backgroundColor: isActive
                      ? colors.brand.primary
                      : colors.border.default,
                  },
                ]}
              />
              {showLabels && index < steps.length - 1 && (
                <View style={styles.labelContainer}>
                  <ThemedText
                    type="caption"
                    style={[
                      styles.label,
                      {
                        color: isActive
                          ? colors.brand.primary
                          : colors.text.tertiary,
                      },
                    ]}
                  >
                    {steps[index]}
                  </ThemedText>
                </View>
              )}
            </View>
          );
        })}
      </View>
      
      {showLabels && (
        <View style={styles.currentStepLabel}>
          <ThemedText type="body" style={{ color: colors.text.secondary }}>
            Passo {currentStep + 1} de {steps.length}: {steps[currentStep]}
          </ThemedText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepContainer: {
    flex: 1,
    position: 'relative',
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
  },
  labelContainer: {
    marginTop: 8,
    alignItems: 'center',
  },
  label: {
    textAlign: 'center',
    fontSize: 11,
  },
  currentStepLabel: {
    alignItems: 'center',
    marginTop: 8,
  },
});

