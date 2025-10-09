// =====================================
// File: hooks/useCoachmarks.ts
// =====================================
import { useCallback, useMemo, useRef, useState } from "react";
import { LayoutRectangle } from "react-native";


export type TargetMap = Record<string, LayoutRectangle | undefined>;


export function useCoachmarks() {
const [visible, setVisible] = useState(false);
const [index, setIndex] = useState(0);
const [steps, setSteps] = useState<{ targetId: string; text: string; align?: string }[]>([]);
const targetsRef = useRef<TargetMap>({});


const register = useCallback((id: string, rect?: LayoutRectangle) => {
targetsRef.current[id] = rect;
}, []);


const start = useCallback((s: { targetId: string; text: string; align?: string }[]) => {
setSteps(s);
setIndex(0);
setVisible(true);
}, []);


const stop = useCallback(() => setVisible(false), []);
const next = useCallback(() => {
if (index >= steps.length - 1) setVisible(false);
else setIndex((i) => i + 1);
}, [index, steps.length]);


const cur = steps[index];
const rect = cur ? targetsRef.current[cur.targetId] : undefined;


return { visible, index, step: cur, rect, next, stop, start, register };
}