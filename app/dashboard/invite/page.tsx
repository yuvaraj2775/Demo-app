"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { InviteForm } from "@/components/dashboard/InviteForm";
import { Toaster } from "@/components/ui/sonner";

export default function InviteMemberPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Toaster />
      <div className="max-w-md mx-auto">
        <div className="mb-8">
          <Link href="/dashboard" className="flex items-center text-gray-600 hover:text-gray-900">
            <ChevronLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>

        <InviteForm />
      </div>
    </div>
  );
} 