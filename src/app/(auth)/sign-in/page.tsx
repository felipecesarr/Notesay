"use client";

import { SignInDialog } from "@/features/auth/presentation/SignInDialog";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const router = useRouter();

  return (
    <SignInDialog
      open={true}
      onOpenChange={(open) => {
        if (!open) {
          router.push("/");
        }
      }}
    />
  );
}
