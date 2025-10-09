// =====================================
// File: components/coachmarks/CoachmarkTarget.tsx
// =====================================
import { useCoachmarksContext } from "@/providers/CoachmarksProvider";
import React, { useCallback } from "react";
import { LayoutChangeEvent, View } from "react-native";


export function CoachmarkTarget({ id, children }: { id: string; children: React.ReactNode }) {
const { register } = useCoachmarksContext();
const onLayout = useCallback((e: LayoutChangeEvent) => {
register(id, e.nativeEvent.layout);
}, [id, register]);


return <View onLayout={onLayout}>{children}</View>;
}