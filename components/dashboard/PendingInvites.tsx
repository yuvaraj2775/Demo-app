import { Card, CardHeader, CardTitle, CardContent,  } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function PendingInvites({ pendingInvites, onResendInvite }: { pendingInvites: any[], onResendInvite: (invite: any) => void }) {
  if (!pendingInvites.length) return null;
  return (
    <div className="mt-8">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Pending Invites</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pendingInvites.map((invite) => (
          <Card key={invite.id}>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                {invite.member_name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">{invite.member_email}</p>
                <p className="text-sm text-gray-500">Role: {invite.role}</p>
                <p className="text-sm text-gray-500">
                  Expires: {new Date(invite.expires_at).toLocaleDateString()}
                </p>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onResendInvite(invite)}
                  >
                    Resend
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 