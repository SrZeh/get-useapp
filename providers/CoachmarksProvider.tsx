// =====================================
// File: providers/CoachmarksProvider.tsx
// =====================================
import React, { createContext, useContext } from "react";
import { useCoachmarks } from "@/hooks/useCoachmarks";
import { CoachmarkOverlay } from "@/components/coachmarks/CoachmarkOverlay";

const Ctx = createContext<ReturnType<typeof useCoachmarks> | null>(null);


export function CoachmarksProvider({ children }: { children: React.ReactNode }) {
const state = useCoachmarks();
return (
<Ctx.Provider value={state}>
{children}
<CoachmarkOverlay />
</Ctx.Provider>
);
}

export function useCoachmarksContext() {
const ctx = useContext(Ctx);
if (!ctx) throw new Error("useCoachmarksContext must be used inside CoachmarksProvider");
return ctx;
}