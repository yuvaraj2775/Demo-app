import { Card } from '@/components/ui/card';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default function ThankYouPage({
  searchParams,
}: {
  searchParams: { action?: string; error?: string; success?: string };
}) {
  const action = searchParams.action;
  const error = searchParams.error;
  const success = searchParams.success === 'true';

  if (!action || (action !== 'accept' && action !== 'decline')) {
    redirect('/');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="p-8 max-w-md w-full mx-4">
        <div className="text-center">
          {error ? (
            <>
              <h1 className="text-2xl font-bold text-red-600 mb-4">Error Processing Invitation</h1>
              <p className="text-gray-600 mb-6">
                {error}
              </p>
              <p className="text-sm text-gray-500">
                Please contact the team owner for assistance.
              </p>
            </>
          ) : success ? (
            action === 'accept' ? (
              <>
                <h1 className="text-2xl font-bold text-green-600 mb-4">Thank You for Accepting!</h1>
                <p className="text-gray-600 mb-6">
                  You have successfully accepted the team invitation.
                </p>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-gray-600 mb-4">Invitation Declined</h1>
                <p className="text-gray-600 mb-6">
                  You have declined the team invitation. If you change your mind, you can request a new invitation from the team owner.
                </p>
              </>
            )
          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-600 mb-4">Processing Invitation</h1>
              <p className="text-gray-600 mb-6">
                Please wait while we process your request...
              </p>
            </>
          )}
        </div>
      </Card>
    </div>
  );
} 