// =====================================
// File: providers/OnboardingProvider.tsx
// =====================================
import React from "react";
import { useOnboardingVisibility } from "@/hooks/useOnboarding";
import { OnboardingModal } from "@/components/onboarding/OnboardingModal";


export function OnboardingProvider({ children }: { children: React.ReactNode }) {
const { visible, loading, markSeen } = useOnboardingVisibility();
if (loading) return <>{children}</>;
return (
<>
{children}
{/* onClose agora recebe { termsAccepted?: boolean } */}
<OnboardingModal
visible={visible}
onClose={(opts?: { termsAccepted?: boolean }) => markSeen(opts)}
/>
</>
);
}