// components/onboarding/OnboardingModal.tsx
import { ThemedText } from "@/components/themed-text";
import { ONBOARDING_STEPS } from "@/constants/onboarding";
import { TERMS_URL } from "@/constants/terms";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useThemeColors } from "@/utils";

type Props = {
  visible: boolean;
  onClose: (opts?: { termsAccepted?: boolean }) => void;
};

export function OnboardingModal({ visible, onClose }: Props) {
  const colors = useThemeColors();
  const isDark = colors.isDark;

  const C = {
    bg: colors.bg.primary,
    text: colors.text.primary,
    subtext: colors.text.secondary,
    border: colors.border.default,
    track: colors.bg.tertiary,
    accent: colors.brand.primary,
    overlay: "rgba(0,0,0,0.6)", // Standard modal overlay
    primaryTextOnAccent: colors.isDark ? colors.text.primary : colors.text.primary,
    dotActive: colors.brand.primary,
    dotInactive: colors.isDark ? colors.bg.tertiary : colors.border.alt,
  };

  const [index, setIndex] = useState(0);
  const [accepted, setAccepted] = useState(false);
  const step = ONBOARDING_STEPS[index];
  const isLast = index === ONBOARDING_STEPS.length - 1;

  const { width } = Dimensions.get("window");
  const maxW = useMemo(() => Math.min(width - 32, 560), [width]);

  const [opacity] = useState(() => new Animated.Value(1));
  const [translateY] = useState(() => new Animated.Value(0));

  const runIn = () => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 180, useNativeDriver: true }),
    ]).start();
  };
  const runOut = (cb: () => void) => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 140, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 8, duration: 140, useNativeDriver: true }),
    ]).start(cb);
  };

  const next = () => {
    if (isLast) {
      onClose({ termsAccepted: accepted });
      return;
    }
    runOut(() => {
      setIndex((i) => i + 1);
      setAccepted(false);
      runIn();
    });
  };

  const disabled = isLast && !accepted;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      statusBarTranslucent
      onRequestClose={() => {}}
      presentationStyle="overFullScreen"
    >
      <View style={[styles.backdrop, { backgroundColor: C.overlay }]}>
        <Animated.View
          style={[
            styles.card,
            { maxWidth: maxW, backgroundColor: C.bg, opacity, transform: [{ translateY }] },
          ]}
        >
          {/* progress bar */}
          <View style={[styles.progressTrack, { backgroundColor: C.track }]}>
            <View
              style={[
                styles.progressBar,
                { width: `${((index + 1) / ONBOARDING_STEPS.length) * 100}%`, backgroundColor: C.accent },
              ]}
            />
          </View>

          <ThemedText type="title" style={[styles.title, { color: C.text }]}>
            {step.title}
          </ThemedText>
          <ThemedText style={[styles.text, { color: C.subtext }]}>{step.text}</ThemedText>

          {/* dots */}
          <View style={styles.dots}>
            {ONBOARDING_STEPS.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  { backgroundColor: i === index ? C.dotActive : C.dotInactive },
                ]}
              />
            ))}
          </View>

          {/* último passo: checkbox + link para Termos */}
          {isLast && (
            <View style={styles.checkboxRow}>
              <Pressable
                onPress={() => setAccepted((v) => !v)}
                style={[
                  styles.checkbox,
                  { borderColor: accepted ? C.accent : C.border },
                ]}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: accepted }}
              >
                {accepted && <View style={[styles.checkboxInner, { backgroundColor: C.accent }]} />}
              </Pressable>

              <ThemedText style={{ color: C.text }}>
                Li e aceito os{" "}
                <ThemedText
                  style={[styles.link, { color: C.accent }]}
                  onPress={() => router.push(TERMS_URL)}
                >
                  Termos de Uso
                </ThemedText>
                .
              </ThemedText>
            </View>
          )}

          {/* Botão único: Próximo / Entendi */}
          <View style={styles.row}>
            <Pressable
              onPress={next}
              disabled={disabled}
              style={[
                styles.btn,
                { backgroundColor: C.accent },
                disabled && styles.btnDisabled,
              ]}
              accessibilityRole="button"
            >
              <ThemedText style={[styles.btnText, { color: C.primaryTextOnAccent }]}>
                {isLast ? "Entendi" : "Próximo"}
              </ThemedText>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  card: {
    width: "100%",
    borderRadius: 16,
    padding: 20,
    gap: 12,
  },
  progressTrack: {
    height: 6,
    borderRadius: 6,
    overflow: "hidden",
  },
  progressBar: {
    height: 6,
  },
  title: { fontSize: 20, fontWeight: "700" },
  text: { fontSize: 16 },
  row: { flexDirection: "row", gap: 12, justifyContent: "flex-end", marginTop: 4 },
  btn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 120,
  },
  btnDisabled: { opacity: 0.5 },
  btnText: { fontWeight: "700" },

  dots: { flexDirection: "row", gap: 6, marginTop: 4 },
  dot: { width: 8, height: 8, borderRadius: 8 },
  checkboxRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 6, flexWrap: "wrap" },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxInner: { width: 12, height: 12, borderRadius: 2 },
  link: { textDecorationLine: "underline", fontWeight: "600" },
});
