"use client"
import { createContext, useContext } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDashboard } from "./Dashboard";
import Link from "next/link";

interface UsageStatsContextType {
  userData: {
    storage_used: number;
    storage_total: number;
    tokens_used: number;
    tokens_total: number;
    prompts_used: number;
    prompts_total: number;
  };
  simulateUsage: (type: 'storage' | 'tokens' | 'prompts', amount: number) => Promise<void>;
}

const UsageStatsContext = createContext<UsageStatsContextType | null>(null);

export function UsageStats({ children }: { children: React.ReactNode }) {
  const { userData, simulateUsage } = useDashboard();

  return (
    <UsageStatsContext.Provider value={{ userData: userData!, simulateUsage }}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        {children}
      </div>
    </UsageStatsContext.Provider>
  );
}

function useUsageStats() {
  const context = useContext(UsageStatsContext);
  if (!context) {
    throw new Error("useUsageStats must be used within a UsageStats component");
  }
  return context;
}

function formatBytes(bytes: number) {
  const gb = bytes / 1000000000;
  return `${gb.toFixed(1)} GB`;
}

function getProgressColor(used: number, total: number) {
  if (used > total) return 'bg-red-600';
  if (used >= total * 0.9) return 'bg-yellow-500';
  return 'bg-blue-600';
}

export function StorageCard() {
  const { userData, simulateUsage } = useUsageStats();
  const { storage_used, storage_total } = userData;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Storage</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-2">
          {formatBytes(storage_used)} used of {formatBytes(storage_total)}
        </p>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div
            className={`h-2 rounded-full ${getProgressColor(storage_used, storage_total)}`}
            style={{ width: `${Math.min((storage_used / storage_total) * 100, 100)}%` }}
          />
        </div>
        {storage_used > storage_total && (
          <>
            <p className="text-sm text-red-600 mb-2">
              Storage limit exceeded by {formatBytes(storage_used - storage_total)}
            </p>
            <Link href="/" className="w-full">
              <Button className="w-full">
                Upgrade Plan
              </Button>
            </Link>
          </>
        )}
        {storage_used >= storage_total * 0.9 && storage_used <= storage_total && (
          <>
            <p className="text-sm text-yellow-600 mb-2">
              Near storage limit ({formatBytes(storage_total - storage_used)} remaining)
            </p>
            <Link href="/" className="w-full">
              <Button className="w-full" >
                Upgrade Plan
              </Button>
            </Link>
          </>
        )}
        <Button 
          onClick={() => simulateUsage('storage', 1000000000)}
          className="w-full mt-1 "
          variant="outline"
          disabled={storage_used >= storage_total}
        >
          Simulate Usage (+1 GB)
        </Button>
      </CardContent>
    </Card>
  );
}

export function TokensCard() {
  const { userData, simulateUsage } = useUsageStats();
  const { tokens_used, tokens_total } = userData;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Tokens</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-2">
          {tokens_used} tokens used of {tokens_total} tokens
        </p>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div
            className={`h-2 rounded-full ${getProgressColor(tokens_used, tokens_total)}`}
            style={{ width: `${Math.min((tokens_used / tokens_total) * 100, 100)}%` }}
          />
        </div>
        {tokens_used > tokens_total && (
          <>
            <p className="text-sm text-red-600 mb-2">
              Token limit exceeded by {tokens_used - tokens_total} tokens
            </p>
            <Link href="/" className="w-full">
              <Button className="w-full" >
                Upgrade Plan
              </Button>
            </Link>
          </>
        )}
        {tokens_used >= tokens_total * 0.9 && tokens_used <= tokens_total && (
          <>
            <p className="text-sm text-yellow-600 mb-2">
              Near token limit ({tokens_total - tokens_used} remaining)
            </p>
            <Link href="/" className="w-full">
              <Button className="w-full">
                Upgrade Plan
              </Button>
            </Link>
          </>
          
        )}
        <Button 
          onClick={() => simulateUsage('tokens', 100)}
          className="w-full mt-1 "
          variant="outline"
          disabled={tokens_used >= tokens_total}
        >
          Simulate Usage (+100 tokens)
        </Button>
      </CardContent>
    </Card>
  );
}

export function PromptsCard() {
  const { userData, simulateUsage } = useUsageStats();
  const { prompts_used, prompts_total } = userData;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Prompts</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-2">
          {prompts_used} prompts used of {prompts_total} prompts
        </p>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div
            className={`h-2 rounded-full ${getProgressColor(prompts_used, prompts_total)}`}
            style={{ width: `${Math.min((prompts_used / prompts_total) * 100, 100)}%` }}
          />
        </div>
        {prompts_used > prompts_total && (
          <>
            <p className="text-sm text-red-600 mb-2">
              Prompt limit exceeded by {prompts_used - prompts_total} prompts
            </p>
            <Link href="/" className="w-full">
              <Button className="w-full">
                Upgrade Plan
              </Button>
            </Link>
          </>
        )}
        {prompts_used >= prompts_total * 0.9 && prompts_used <= prompts_total && (
          <>
            <p className="text-sm text-yellow-600 mb-2">
              Near prompt limit ({prompts_total - prompts_used} remaining)
            </p>
            <Link href="/" className="w-full">
              <Button className="w-full" >
                Upgrade Plan
              </Button>
            </Link>
          </>
        )}
        <Button 
          onClick={() => simulateUsage('prompts', 1)}
          className="w-full mt-1 "
          variant="outline"
          disabled={prompts_used >= prompts_total}
        >
          Simulate Usage (+1 prompt)
        </Button>
      </CardContent>
    </Card>
  );
}

// Compound component subcomponents
UsageStats.Storage = StorageCard;
UsageStats.Tokens = TokensCard;
UsageStats.Prompts = PromptsCard; 