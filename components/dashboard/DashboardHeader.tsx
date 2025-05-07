import Link from "next/link";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AccountSwitcher } from "./AccountSwitcher";


interface DashboardHeaderProps {
  plan: string;
}

export function DashboardHeader({ plan }: DashboardHeaderProps) {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserEmail(user?.email || null);
    };
    getUser();
  }, [supabase.auth]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <Link href="/" className="border-2 border-black rounded-md p-1">Go to pricing</Link>
        <div className="mt-0.5">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">Current plan: <span className="font-bold text-lg text-blue-500" > {plan}</span> </p>
        </div>
      </div>
      <div className="flex items-center gap-4">
       
        <AccountSwitcher/>
        
      </div>
    </div>
  );
} 