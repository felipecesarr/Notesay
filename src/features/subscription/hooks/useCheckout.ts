import { useMutation } from "@tanstack/react-query";
import { createCheckoutSession } from "../controller";

/**
 * Hook to handle Stripe Checkout session creation
 */
export function useCheckout() {
  return useMutation({
    mutationFn: async (plan: "MONTHLY") => {
      const result = await createCheckoutSession(plan);
      if (!result.success || !result.url) {
        throw new Error(result.error || "Failed to start checkout");
      }
      return result.url;
    },
    onSuccess: (url) => {
      window.location.href = url;
    },
    onError: (error: Error) => {
      console.error("Checkout error:");
      alert(error.message);
    }
  });
}
