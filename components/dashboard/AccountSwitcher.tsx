import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, Plus, Trash2 } from "lucide-react";

export function AccountSwitcher() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [currentEmail, setCurrentEmail] = useState<string | null>(null);
  const [savedSessions, setSavedSessions] = useState<{ email: string; session: string }[]>([]);

  useEffect(() => {
    const loadSessions = async () => {
      try {
        // Get current session
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error('Auth error:', error);
          router.push('/auth/login');
          return;
        }

        setCurrentEmail(user?.email || null);

        // Load saved sessions from localStorage
        const saved = localStorage.getItem('supabase_sessions');
        if (saved) {
          setSavedSessions(JSON.parse(saved));
        }
      } catch (error) {
        console.error('Error loading sessions:', error);
        router.push('/auth/login');
      }
    };
    loadSessions();
  }, [supabase.auth, router]);

  const handleSignOut = async () => {
    try {
      // Remove current account from saved sessions
      if (currentEmail) {
        const updatedSessions = savedSessions.filter(session => session.email !== currentEmail);
        localStorage.setItem('supabase_sessions', JSON.stringify(updatedSessions));
        setSavedSessions(updatedSessions);
      }

      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Clear current session
      localStorage.removeItem('current_session');
      
      // Redirect to login
      router.push('/auth/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const switchAccount = async (session: string) => {
    try {
      // Parse the session string
      const sessionData = JSON.parse(session);
      
      // Set the new session
      const { error } = await supabase.auth.setSession({
        access_token: sessionData.access_token,
        refresh_token: sessionData.refresh_token,
      });

      if (error) {
        console.error('Error switching account:', error);
        router.push('/auth/login');
        return;
      }

      // Store the current session
      localStorage.setItem('current_session', session);

      // Force a hard refresh of the page
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Error switching account:', error);
      router.push('/auth/login');
    }
  };

  const handleAddAccount = () => {
    // Store current session before redirecting
    const currentSession = localStorage.getItem('current_session');
    if (currentSession) {
      // Store the current session as previous session
      localStorage.setItem('previous_session', currentSession);
    }
    
    // Clear the current session to ensure the new login takes precedence
    localStorage.removeItem('current_session');
    
    // Redirect to login with add_account flag
    window.location.href = '/auth/login?add_account=true';
  };

  const handleDeleteAccount = (emailToDelete: string) => {
    try {
      // Remove the account from saved sessions
      const updatedSessions = savedSessions.filter(session => session.email !== emailToDelete);
      localStorage.setItem('supabase_sessions', JSON.stringify(updatedSessions));
      setSavedSessions(updatedSessions);

      // If the deleted account is the current one, sign out
      if (emailToDelete === currentEmail) {
        handleSignOut();
      }
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            {currentEmail}
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {savedSessions.map((savedSession) => (
            <DropdownMenuItem
              key={savedSession.email}
              onClick={() => switchAccount(savedSession.session)}
              className={`flex items-center justify-between ${currentEmail === savedSession.email ? "bg-gray-100" : ""}`}
            >
              <span>{savedSession.email}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 hover:bg-red-100"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteAccount(savedSession.email);
                }}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleAddAccount} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Account
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
} 