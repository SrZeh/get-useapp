// =====================================
// File: providers/CoachmarksProvider.tsx
// =====================================
import React, { createContext, useContext, useMemo } from "react";
import { useCoachmarks } from "@/hooks/useCoachmarks";
import { CoachmarkOverlay } from "@/components/coachmarks/CoachmarkOverlay";

const Ctx = createContext<ReturnType<typeof useCoachmarks> | null>(null);


export function CoachmarksProvider({ children }: { children: React.ReactNode }) {
  const state = useCoachmarks();
  
  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(() => state, [state]);
  
  return (
    <Ctx.Provider value={value}>
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