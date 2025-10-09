// =====================================
// File: components/onboarding/OnboardingModal.tsx
// =====================================
import React, { useMemo, useState } from "react";
import {
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  View,
  Animated,
  Linking,
} from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ONBOARDING_STEPS } from "@/constants/onboarding";
import { TERMS_URL } from "@/constants/terms";

type Props = {
  visible: boolean;
  // ⬇️ agora aceita opções (para enviar se aceitou termos)
  onClose: (opts?: { termsAccepted?: boolean }) => void;
};

export function OnboardingModal({ visible, onClose }: Props) {
  const [index, setIndex] = useState(0);
  const [accepted, setAccepted] = useState(false);
  const step = ONBOARDING_STEPS[index];
  const isLast = index === ONBOARDING_STEPS.length - 1;

  const { width } = Dimensions.get("window");
  const maxW = useMemo(() => Math.min(width - 32, 560), [width]);

  // animação simples por passo
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
      onRequestClose={() => {
        /* bloqueado */
      }}
      presentationStyle="overFullScreen"
    >
      <View style={styles.backdrop}>
        <Animated.View
          style={[styles.card, { maxWidth: maxW, opacity, transform: [{ translateY }] }]}
        >
          {/* progress bar */}
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressBar,
                { width: `${((index + 1) / ONBOARDING_STEPS.length) * 100}%` },
              ]}
            />
          </View>

          <ThemedText type="title" style={styles.title}>
            {step.title}
          </ThemedText>
          <ThemedText style={styles.text}>{step.text}</ThemedText>

          {/* dots */}
          <View style={styles.dots}>
            {ONBOARDING_STEPS.map((_, i) => (
              <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
            ))}
          </View>

          {/* último passo: checkbox de aceite */}
          {isLast && (
            <View style={styles.checkboxRow}>
              <Pressable
                onPress={() => setAccepted((v) => !v)}
                style={[styles.checkbox, accepted && styles.checkboxOn]}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: accepted }}
              >
                {accepted && <View style={styles.checkboxInner} />}
              </Pressable>
              <ThemedText>
                Li e aceito os{" "}
                <ThemedText
                  style={styles.link}
                  onPress={() => Linking.openURL(TERMS_URL)}
                >
                  Termos de Uso
                </ThemedText>
                .
              </ThemedText>
            </View>
          )}

          <View style={styles.row}>
            <Pressable
              onPress={next}
              disabled={disabled}
              style={[styles.btn, styles.btnPrimary, disabled && styles.btnDisabled]}
            >
              <ThemedText style={styles.btnText}>
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
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  card: {
    width: "100%",
    borderRadius: 16,
    padding: 20,
    gap: 12,
    backgroundColor: "#111214",
  },
  progressTrack: {
    height: 6,
    backgroundColor: "#1b1b1d",
    borderRadius: 6,
    overflow: "hidden",
  },
  progressBar: {
    height: 6,
    backgroundColor: "#96ff9a",
  },
  title: { fontSize: 20, fontWeight: "700" },
  text: { fontSize: 16, opacity: 0.9 },
  row: { flexDirection: "row", gap: 12, justifyContent: "flex-end", marginTop: 4 },
  btn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  btnPrimary: { backgroundColor: "#96ff9a" },
  btnDisabled: { opacity: 0.5 },
  btnText: { fontWeight: "700", color: "#000" },
  btnGhost: { borderWidth: 1, borderColor: "#444" },

  // ⬇️ estilos que faltavam
  dots: { flexDirection: "row", gap: 6, marginTop: 4 },
  dot: { width: 8, height: 8, borderRadius: 8, backgroundColor: "#3a3a3a" },
  dotActive: { backgroundColor: "#96ff9a" },

  checkboxRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 6 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#4a4a4a",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxOn: { borderColor: "#96ff9a" },
  checkboxInner: { width: 12, height: 12, borderRadius: 2, backgroundColor: "#96ff9a" },
  link: { textDecorationLine: "underline" },
});
