// =====================================
// File: components/coachmarks/CoachmarkOverlay.tsx
// =====================================
import { ThemedText } from "@/components/themed-text";
import { useCoachmarksContext } from "@/providers/CoachmarksProvider";
import React, { useMemo } from "react";
import { Dimensions, Modal, Pressable, StyleSheet, View, ViewStyle } from "react-native";
import { useThemeColors } from "@/utils/theme";

export function CoachmarkOverlay() {
const { visible, rect, step, next } = useCoachmarksContext();
const { width, height } = Dimensions.get("window");
const colors = useThemeColors();

const overlayStyle = useMemo(() => ({ backgroundColor: 'rgba(0,0,0,0.6)' }), []);

const hole = useMemo(() => {
if (!rect) return null;
const pad = 6;
return {
x: Math.max(0, rect.x - pad),
y: Math.max(0, rect.y - pad),
w: Math.min(width, rect.width + pad * 2),
h: Math.min(height, rect.height + pad * 2),
r: 12,
};
}, [rect, width, height]);

const borderStyle = useMemo(() => ({ 
  borderColor: colors.brand.primary 
}), [colors.brand.primary]);

if (!visible || !hole || !step) return null;

// estratégia sem dependências: 4 blocos opacos formando um "buraco"
return (
<Modal visible transparent animationType="fade" statusBarTranslucent>
<View style={styles.full}>
{/* Overlays */}
<View style={[overlayStyle, styles.overlay, { left: 0, top: 0, right: 0, height: hole.y }]} />
<View style={[overlayStyle, styles.overlay, { left: 0, top: hole.y, width: hole.x, height: hole.h }]} />
<View style={[overlayStyle, styles.overlay, { left: hole.x + hole.w, top: hole.y, right: 0, height: hole.h }]} />
<View style={[overlayStyle, styles.overlay, { left: 0, top: hole.y + hole.h, right: 0, bottom: 0 }]} />


{/* Borda do alvo */}
<View style={[borderStyle, styles.border, { left: hole.x, top: hole.y, width: hole.w, height: hole.h, borderRadius: hole.r }]} />


      {/* Balão */}
      <CoachBubble hole={{ x: hole.x, y: hole.y, w: hole.w, h: hole.h }} text={step.text} align={step.align ?? "bottom"} onNext={next} />
</View>
</Modal>
);
}

function CoachBubble({ hole, text, align = "bottom", onNext }: { hole: { x: number; y: number; w: number; h: number }; text: string; align?: "top" | "bottom" | "left" | "right"; onNext: () => void; }) {
  const colors = useThemeColors();
  const pad = 12;
  const base: ViewStyle = { position: "absolute" as const, left: hole.x, top: hole.y + hole.h + 8 };
  if (align === "top") base.top = hole.y - 8 - 120; // altura estimada
  if (align === "left") base.left = hole.x - 260 - 8; // largura estimada
  if (align === "right") base.left = hole.x + hole.w + 8;

  const bubbleStyle = useMemo(() => ({
    backgroundColor: colors.bg.secondary,
    borderColor: colors.border.alt,
  }), [colors.bg.secondary, colors.border.alt]);

  const btnStyle = useMemo(() => ({
    backgroundColor: colors.brand.primary,
  }), [colors.brand.primary]);

return (
<View style={[bubbleStyle, styles.bubble, base]}
pointerEvents="box-none"
>
<ThemedText style={{ fontSize: 15, marginBottom: 10 }}>{text}</ThemedText>
<Pressable onPress={onNext} style={[btnStyle, styles.btn]}>
<ThemedText style={{ fontWeight: "700" }}>Próximo</ThemedText>
</Pressable>
</View>
);
}

const styles = StyleSheet.create({
full: { flex: 1 },
overlay: { position: "absolute" },
border: { position: "absolute", borderWidth: 2, borderRadius: 12 },
bubble: {
position: "absolute",
maxWidth: 260,
padding: 12,
borderRadius: 12,
borderWidth: 1,
},
btn: {
alignSelf: "flex-end",
paddingVertical: 10,
paddingHorizontal: 14,
borderRadius: 10,
},
});