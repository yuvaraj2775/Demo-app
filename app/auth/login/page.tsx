"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [savedAccounts, setSavedAccounts] = useState<{ email: string; session: string }[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();

  useEffect(() => {
    // Load saved accounts
    const loadSavedAccounts = () => {
      const saved = localStorage.getItem('supabase_sessions');
      if (saved) {
        setSavedAccounts(JSON.parse(saved));
      }
    };
    loadSavedAccounts();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setError('Invalid email or password.');
        } else {
          setError(error.message);
        }
        return;
      }

      if (data?.session) {
        // Save the session
        const sessions = JSON.parse(localStorage.getItem('supabase_sessions') || '[]');
        const existingSessionIndex = sessions.findIndex((s: any) => s.email === email);
        
        if (existingSessionIndex === -1) {
          sessions.push({
            email,
            session: JSON.stringify(data.session)
          });
        } else {
          sessions[existingSessionIndex].session = JSON.stringify(data.session);
        }
        
        localStorage.setItem('supabase_sessions', JSON.stringify(sessions));
        localStorage.setItem('current_session', JSON.stringify(data.session));

        // Check if we're adding a new account
        const isAddingAccount = searchParams.get('add_account') === 'true';
        if (isAddingAccount) {
          // Clear any previous session
          localStorage.removeItem('previous_session');
        }

        // Check if user exists in team_members
        const { data: existingMember, error: checkError } = await supabase
          .from('team_members')
          .select('id')
          .eq('member_email', email)
          .single();

        if (checkError && checkError.code !== 'PGRST116') {
          console.error('Error checking team member:', checkError);
        }

        // If user doesn't exist in team_members, add them
        if (!existingMember) {
          const { error: insertError } = await supabase
            .from('team_members')
            .insert({
              team_owner_id: data.session.user.id,
              member_name: email.split('@')[0],
              member_email: email,
              role: 'admin'
            });

          if (insertError) {
            console.error('Error adding to team members:', insertError);
          }
        }

        // Force a hard refresh to ensure the new session is loaded
        window.location.href = '/dashboard';
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (session: string) => {
    try {
      const sessionData = JSON.parse(session);
      const { error } = await supabase.auth.setSession({
        access_token: sessionData.access_token,
        refresh_token: sessionData.refresh_token,
      });

      if (error) {
        console.error('Quick login error:', error);
        setError('Failed to switch accounts. Please try logging in manually.');
        return;
      }

      localStorage.setItem('current_session', session);
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Quick login error:', error);
      setError('Failed to switch accounts. Please try logging in manually.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>

        {savedAccounts.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Quick login with saved accounts:</p>
            <div className="flex flex-col gap-2">
              {savedAccounts.map((account) => (
                <Button
                  key={account.email}
                  variant="outline"
                  onClick={() => handleQuickLogin(account.session)}
                  className="w-full justify-start"
                >
                  {account.email}
                </Button>
              ))}
            </div>
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center p-3 bg-red-50 rounded-md">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </div>

          <div className="text-sm text-center">
            <Link
              href="/auth/signup"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Don't have an account? Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
} 