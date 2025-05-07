"use client"
import { createContext, useContext, useState } from "react";
import { TeamMember, PendingInvite } from "@/types/dashboard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Trash2, Mail, User, Pencil } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useDashboard } from "./Dashboard";
import { EditMemberDialog } from "./EditMemberDialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface TeamMembersContextType {
  teamMembers: TeamMember[];
  pendingInvites: PendingInvite[];
  handleRemoveMember: (memberId: string) => void;
  handleResendInvite: (invite: PendingInvite) => void;
  handleCancelInvite: (inviteId: string) => void;
  handleRoleChange: (memberId: string, newRole: string) => void;
  handleNameChange: (memberId: string, newName: string) => void;
  userData: {
    plan: string;
  };
}

const TeamMembersContext = createContext<TeamMembersContextType | null>(null);

export function TeamMembers({ children }: { children: React.ReactNode }) {
  const {
    teamMembers,
    pendingInvites,
    handleRemoveMember,
    handleResendInvite,
    handleCancelInvite,
    handleRoleChange,
    handleNameChange,
    userData,
  } = useDashboard();

  return (
    <TeamMembersContext.Provider
      value={{
        teamMembers,
        pendingInvites,
        handleRemoveMember,
        handleResendInvite,
        handleCancelInvite,
        handleRoleChange,
        handleNameChange,
        userData: userData!,
      }}
    >
      <Card className="border-none shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
          <div>
            <CardTitle className="text-lg font-semibold">Team Members</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {teamMembers.length} of {userData!.plan === 'Basic' ? 5 : userData!.plan === 'Pro' ? 10 : 15} seats used ({pendingInvites.length} pending)
            </p>
          </div>
          <Link href="/dashboard/invite">
            <Button size="sm" className="gap-2">
              <Users className="h-4 w-4" />
              Invite Member
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {children}
          </div>
        </CardContent>
      </Card>
    </TeamMembersContext.Provider>
  );
}

function useTeamMembers() {
  const context = useContext(TeamMembersContext);
  if (!context) {
    throw new Error("useTeamMembers must be used within a TeamMembers component");
  }
  return context;
}

export function TeamMembersList() {
  const { teamMembers, handleRemoveMember, handleRoleChange, handleNameChange } = useTeamMembers();
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: 'delete' | 'cancel' | 'resend';
    member?: TeamMember;
    invite?: PendingInvite;
    message: string;
  } | null>(null);

  const handleConfirmAction = async () => {
    if (!confirmDialog) return;

    try {
      switch (confirmDialog.type) {
        case 'delete':
          if (confirmDialog.member) {
            await handleRemoveMember(confirmDialog.member.id);
          }
          break;
        case 'cancel':
          if (confirmDialog.invite) {
            await handleCancelInvite(confirmDialog.invite.id);
          }
          break;
        case 'resend':
          if (confirmDialog.invite) {
            await handleResendInvite(confirmDialog.invite);
          }
          break;
      }
    } catch (error) {
      console.error('Error performing action:', error);
    } finally {
      setConfirmDialog(null);
    }
  };

  if (teamMembers.length === 0) {
    return (
      <div className="text-center py-8">
        <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-sm text-muted-foreground">No team members.</p>
      </div>
    );
  }

  const handleEditSave = (memberId: string, newName: string, newRole: string) => {
    handleNameChange(memberId, newName);
    handleRoleChange(memberId, newRole);
  };

  return (
    <div className="space-y-4">
      {teamMembers.map((member, idx) => (
        <div
          key={member.id}
          className="flex items-center justify-between p-4 bg-muted/80 rounded-lg"
        >
          <div className="flex items-center gap-4">
            {/* <Avatar>
              <AvatarFallback>
                {member.member_name?.charAt(0) || member.member_email?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar> */}
            <div>

            </div>
            <div>
              <p className="font-medium capitalize">{member.member_name || member.member_email}</p>
              <div className="flex items-center gap-2 mt-1">
                {idx === 0 ? (
                  <Badge variant="secondary" className="bg-primary/10 text-primary capitalize">
                    {member.role}
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-primary/10 text-primary capitalize">
                    {member.role}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          {idx !== 0 && (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setEditingMember(member)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive"
                onClick={() => setConfirmDialog({
                  isOpen: true,
                  type: 'delete',
                  member,
                  message: `Are you sure you want to remove ${member.member_name || member.member_email} from the team?`
                })}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            </div>
          )}
        </div>
      ))}
      {editingMember && (
        <EditMemberDialog
          member={editingMember}
          isOpen={!!editingMember}
          onClose={() => setEditingMember(null)}
          onSave={handleEditSave}
        />
      )}
      <Dialog open={!!confirmDialog} onOpenChange={(open) => {
        if (!open) {
          return;
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Action</DialogTitle>
            <DialogDescription>
              {confirmDialog?.message}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialog(null)}>
              Cancel
            </Button>
            <Button
              variant={confirmDialog?.type === 'delete' ? 'destructive' : 'default'}
              onClick={handleConfirmAction}
            >
              {confirmDialog?.type === 'delete' ? 'Delete' : 
               confirmDialog?.type === 'cancel' ? 'Cancel Invite' : 'Resend Invite'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function PendingInvitesList() {
  const { pendingInvites, handleResendInvite, handleCancelInvite } = useTeamMembers();
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: 'cancel' | 'resend';
    invite: PendingInvite;
    message: string;
  } | null>(null);

  const handleConfirmAction = async () => {
    if (!confirmDialog) return;

    try {
      if (confirmDialog.type === 'cancel') {
        await handleCancelInvite(confirmDialog.invite.id);
      } else {
        await handleResendInvite(confirmDialog.invite);
      }
    } catch (error) {
      console.error('Error performing action:', error);
    } finally {
      setConfirmDialog(null);
    }
  };

  if (pendingInvites.length === 0) return null;

  return (
    <div className="mt-6">
      <h3 className="text-sm font-medium mb-4">Pending Invites</h3>
      <div className="space-y-4">
        {pendingInvites.map((invite) => (
          <div
            key={invite.id}
            className="flex items-center justify-between p-4 bg-muted/90 rounded-lg"
          >
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                <Mail className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium capitalize">{invite.member_name || invite.member_email}</p>
                <Badge variant="secondary" className="bg-primary/10 text-primary capitalize">
                  {invite.role}
                </Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmDialog({
                  isOpen: true,
                  type: 'resend',
                  invite,
                  message: `Are you sure you want to resend the invitation to ${invite.member_email}?`
                })}
              >
                Resend
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => setConfirmDialog({
                  isOpen: true,
                  type: 'cancel',
                  invite,
                  message: `Are you sure you want to cancel the invitation to ${invite.member_email}?`
                })}
              >
                Cancel
              </Button>
            </div>
          </div>
        ))}
      </div>
      <Dialog open={!!confirmDialog} onOpenChange={(open) => {
        if (!open) {
          return;
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Action</DialogTitle>
            <DialogDescription>
              {confirmDialog?.message}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialog(null)}>
              Cancel
            </Button>
            <Button
              variant={confirmDialog?.type === 'cancel' ? 'destructive' : 'default'}
              onClick={handleConfirmAction}
            >
              {confirmDialog?.type === 'cancel' ? 'Cancel Invite' : 'Resend Invite'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Compound component subcomponents
TeamMembers.List = TeamMembersList;
TeamMembers.PendingInvites = PendingInvitesList; 