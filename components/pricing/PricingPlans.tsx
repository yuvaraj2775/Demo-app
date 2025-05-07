import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { Plan, plans, usePlanSelection } from "@/hooks/usePlanSelection";
import { createContext, useContext, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PricingContextType {
  loading: string | null;
  currentPlan: string | null;
  isLoggedIn: boolean;
  error: string | null;
  onPlanSelect: (planName: string) => void;
}

const PricingContext = createContext<PricingContextType | null>(null);

export function PricingPlans({ children }: { children: React.ReactNode }) {
  const { loading, currentPlan, isLoggedIn, error, handlePlanSelect } = usePlanSelection();

  return (
    <PricingContext.Provider value={{ loading, currentPlan, isLoggedIn, error, onPlanSelect: handlePlanSelect }}>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </div>
    </PricingContext.Provider>
  );
}

function usePricing() {
  const context = useContext(PricingContext);
  if (!context) {
    throw new Error("usePricing must be used within a PricingPlans component");
  }
  return context;
}

export function PricingHeader() {
  return (
    <div className="flex justify-between " >
      <div></div>
       <div className="text-center mb-12">
      <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
        Choose Your Plan
      </h1>
      <p className="mt-4 text-xl text-gray-600">
        Select the perfect plan for your needs
      </p>
      
    </div>
    <div className="text-right " >
      <Link href="/dashboard" className="border-2 border-black p-2 rounded-md" >Go to dashboard</Link>
    </div>
    </div>
   
    
  );
}

export function PricingError() {
  const { error } = usePricing();
  if (!error) return null;
  
  return (
    <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-md">
      {error}
    </div>
  );
}

export function PricingList() {
  const { loading, currentPlan, onPlanSelect } = usePricing();
  const [showDowngradeDialog, setShowDowngradeDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handlePlanClick = (planName: string) => {
    // Check if this is a downgrade
    const currentPlanIndex = plans.findIndex(p => p.name === currentPlan);
    const newPlanIndex = plans.findIndex(p => p.name === planName);
    
    if (currentPlan && newPlanIndex < currentPlanIndex) {
      // It's a downgrade, show confirmation dialog
      setSelectedPlan(planName);
      setShowDowngradeDialog(true);
    } else {
      // It's an upgrade or same plan, proceed directly
      onPlanSelect(planName);
    }
  };

  const handleConfirmDowngrade = () => {
    if (selectedPlan) {
      onPlanSelect(selectedPlan);
      setShowDowngradeDialog(false);
      setSelectedPlan(null);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card 
            key={plan.name} 
            className={`flex flex-col relative ${currentPlan === plan.name ? 'border-blue-500 border-2' : ''} ${plan.name === 'Pro' ? 'border-primary' : ''}`}
          >
            {plan.name === 'Pro' && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <div className="bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Recommended
                </div>
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-2xl font-bold">
                {plan.name}
                {currentPlan === plan.name && (
                  <span className="ml-2 text-sm text-blue-600">(Current Plan)</span>
                )}
              </CardTitle>
              <CardDescription>
                <span className="text-3xl font-bold">{plan.price}</span>
                {plan.period && (
                  <span className="text-gray-500">{plan.period}</span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center">
                    <svg
                      className="h-5 w-5 text-green-500 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                variant={plan.buttonVariant}
                className="w-full"
                onClick={() => handlePlanClick(plan.name)}
                disabled={loading === plan.name || currentPlan === plan.name}
              >
                {loading === plan.name ? "Processing..." : (
                  currentPlan === plan.name ? "Current Plan" : plan.buttonText
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog open={showDowngradeDialog} onOpenChange={(open) => {
        // Only allow closing through buttons
        if (!open) {
          return;
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Plan Downgrade</DialogTitle>
            <DialogDescription>
              Are you sure you want to downgrade your plan? This may result in reduced features and storage capacity.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDowngradeDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDowngrade}>
              Confirm Downgrade
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function PricingAccountSection() {
  const { isLoggedIn } = usePricing();

  return (
    <div className="mt-12 text-center">
      <p className="text-gray-600">
        {isLoggedIn ? (
          <>
            Want to add another account?{" "}
            <Link href="/auth/login?add_account=true" className="text-blue-600 hover:underline">
              Add Account
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/auth/login" className="text-blue-600 hover:underline">
              Sign in
            </Link>
          </>
        )}
      </p>
    </div>
  );
}

// Compound component subcomponents
PricingPlans.Header = PricingHeader;
PricingPlans.Error = PricingError;
PricingPlans.List = PricingList;
PricingPlans.AccountSection = PricingAccountSection; 