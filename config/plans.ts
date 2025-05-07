export interface PlanFeature {
  name: string;
  value: string;
}

export interface Plan {
  name: string;
  price: string;
  period?: string;
  features: PlanFeature[];
  buttonText: string;
  buttonVariant: 'default' | 'outline';
}

export const plans: Plan[] = [
  {
    name: "Basic",
    price: "Free",
    features: [
      { name: "Storage", value: "5 GB" },
      { name: "Tokens", value: "1000" },
      { name: "Prompts", value: "3" },
      { name: "Users", value: "5" }
    ],
    buttonText: "Free Plan",
    buttonVariant: "outline"
  },
  {
    name: "Pro",
    price: "$9.99",
    period: "/month",
    features: [
      { name: "Storage", value: "10 GB" },
      { name: "Tokens", value: "2000" },
      { name: "Prompts", value: "6" },
      { name: "Users", value: "10" }
    ],
    buttonText: "Get Pro",
    buttonVariant: "default"
  },
  {
    name: "Enterprise",
    price: "$19.99",
    period: "/month",
    features: [
      { name: "Storage", value: "15 GB" },
      { name: "Tokens", value: "3000" },
      { name: "Prompts", value: "9" },
      { name: "Users", value: "15" }
    ],
    buttonText: "Get Enterprise",
    buttonVariant: "outline"
  }
]; 