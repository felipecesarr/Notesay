import { useQuery } from "@tanstack/react-query";
import { getSubscriptionStatus } from "@/features/subscription/controller";

export interface SubscriptionData {
  subscription: Record<string, unknown> | null;
  status: {
    isActive: boolean;
    isPastDue: boolean;
    isCanceled: boolean;
  };
}

export function useSubscription() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["subscription"],
    queryFn: async (): Promise<SubscriptionData | null> => {
      const result = await getSubscriptionStatus();
      if (result.success && result.subscription) {
        return {
          subscription: result.subscription,
          status: {
            isActive: result.isActive || false,
            isPastDue: result.isPastDue || false,
            isCanceled: result.isCanceled || false,
          }
        };
      }
      return null;
    },
    staleTime: 5 * 60 * 1000, 
    refetchOnWindowFocus: true,
  });

  return {
    subscription: data?.subscription || null,
    status: data?.status || null,
    isLoading,
    refetchSubscription: refetch
  };
}
