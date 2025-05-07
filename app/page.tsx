"use client";

import { PricingPlans } from "@/components/pricing/PricingPlans";

export default function Home() {
  return (
    <PricingPlans>
      <PricingPlans.Header />
      <PricingPlans.Error />
      <PricingPlans.List />
      <PricingPlans.AccountSection />
    </PricingPlans>
  );
}
