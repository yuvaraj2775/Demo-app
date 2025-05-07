export interface UserData {
  plan: string;
  storage_used: number;
  storage_total: number;
  tokens_used: number;
  tokens_total: number;
  prompts_used: number;
  prompts_total: number;
}

export interface TeamMember {
  id: string;
  member_email: string;
  member_name?: string;
  role: string;
  status: 'active' | 'pending';
  created_at: string;
}

export interface PendingInvite {
  id: string;
  member_email: string;
  member_name?: string;
  role: string;
  created_at: string;
  expires_at: string;
}

export interface Account {
  id: string;
  email: string;
  name?: string;
  role?: string;
} 