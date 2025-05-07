import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useBase } from './useBase';

export interface Plan {
  name: string;
  price: string;
  period?: string;
  features: string[];
  buttonText: string;
  buttonVariant: "outline" | "default";
}

export const plans: Plan[] = [
  {
    name: "Basic",
    price: "Free",
    features: [
      "5 GB Storage",
      "1000 Tokens",
      "3 Prompts",
      "5 Users",
    ],
    buttonText: "Free Plan",
    buttonVariant: "outline",
  },
  {
    name: "Pro",
    price: "$9.99 ",
    period: "/month",
    features: [
      "10 GB Storage",
      "2000 Tokens",
      "6 Prompts",
      "10 Users",
    ],
    buttonText: "Get Pro",
    buttonVariant: "default",
  },
  {
    name: "Enterprise",
    price: "$19.99",
    period: "/month",
    features: [
      "15 GB Storage",
      "3000 Tokens",
      "9 Prompts",
      "15 Users",
    ],
    buttonText: "Get Enterprise",
    buttonVariant: "outline",
  },
];

export function usePlanSelection() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const userDataHook = useBase({ tableName: 'users_data' });
  const [loading, setLoading] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setIsLoggedIn(!!user);
        
        if (user) {
          const result = await userDataHook.fetchData({ id: user.id });
          if (result && Array.isArray(result) && result.length > 0) {
            setCurrentPlan(result[0].plan);
          }
        }
      } catch (err) {
        console.error('Error checking auth:', err);
      }
    };

    checkAuth();
  }, [supabase, userDataHook]);

  const handlePlanSelect = async (planName: string) => {
    try {
      setError(null);
      setLoading(planName);

      // Validate plan name
      if (!plans.some(p => p.name === planName)) {
        throw new Error('Invalid plan selected');
      }

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        // If not logged in, store selected plan in localStorage and redirect to signup
        localStorage.setItem('selectedPlan', planName);
        router.push('/auth/signup');
        return;
      }

      // Don't allow selecting the same plan
      if (currentPlan === planName) {
        setError('You are already on this plan');
        return;
      }

      // Update the user's plan in the database
      const result = await userDataHook.updateData(user.id, { plan: planName });

      if (!result) {
        throw new Error('Failed to update plan');
      }

      // Update local state
      setCurrentPlan(planName);
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Error updating plan:', error);
      setError(error instanceof Error ? error.message : 'Failed to update plan. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return {
    loading,
    currentPlan,
    isLoggedIn,
    error,
    handlePlanSelect,
  };
} 