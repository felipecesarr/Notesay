"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/features/auth/presentation/auth-client";
import { Header, Hero, SpacedRepetitionSection, ChatModesSection, ReadAloudSection, SkillsAndInterviewSection, PricingSection, FAQSection, Footer, MobileWarningDialog } from "@/features/landing/presentation";
import { SignInDialog } from "@/features/auth/presentation/SignInDialog";
import { useEffect, useState } from "react";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await authClient.getSession();
        
        if (data?.user) {
          setIsAuthenticated(true);
          router.push("/dashboard");
        } else {
          setIsAuthenticated(false);
        }
      } catch {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, [router]);

  // Don't render until we know auth state to avoid flashing content
  if (isAuthenticated === null) return null;

  return (
    <main className="min-h-screen bg-white selection:bg-stone-200">
      {/* <MobileWarningDialog /> */}
      <Header 
        onSignInClick={() => setIsSignInOpen(true)} 
        onGetStartedClick={() => setIsSignInOpen(true)} 
      />
      
      <div className="flex flex-col gap-0">
        <Hero />
        <SpacedRepetitionSection />
        <ChatModesSection />
        <ReadAloudSection />
        
        {/* Last section with Special Gradient Background - Tucked under previous section */}
        <div 
        className="pt-32 -mt-24 relative z-0"
        style={{
          background: "linear-gradient(to bottom, rgba(196, 180, 255, 0.3) 30%, rgba(208, 228, 172, 1) 90%, transparent 100%)"
        }}
        >
            <SkillsAndInterviewSection />
            <PricingSection onGetStartedClick={() => setIsSignInOpen(true)} />
            <FAQSection />
            <Footer 
              onSignInClick={() => setIsSignInOpen(true)} 
              onGetStartedClick={() => setIsSignInOpen(true)}
            />
        </div>
      </div>

      {/* Sign In Dialog */}
      <SignInDialog open={isSignInOpen} onOpenChange={setIsSignInOpen} />
    </main>
  );
}
