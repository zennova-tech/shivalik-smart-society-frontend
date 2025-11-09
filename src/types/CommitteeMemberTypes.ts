export interface CommitteeMember {
  _id: string;
  firstName: string;
  lastName?: string;
  countryCode: string;
  mobileNumber: string;
  email: string;
  memberType: 'chairman' | 'secretary' | 'treasurer' | 'member' | 'other';
  society?: string;
  building?: string | { _id: string; buildingName: string };
  block?: string | { _id: string; name: string };
  status: 'active' | 'inactive' | 'resigned' | 'archived';
  createdBy?: string | { _id: string; firstName: string; lastName: string };
  updatedBy?: string | { _id: string; firstName: string; lastName: string };
  createdAt?: string;
  updatedAt?: string;
}

export interface CommitteeMemberResponse {
  items: CommitteeMember[];
  total: number;
  page: number;
  limit: number;
}

export interface GetCommitteeMembersParams {
  page?: number;
  limit?: number;
  q?: string;
  society?: string;
  status?: string;
  memberType?: string;
}

export interface AddCommitteeMemberPayload {
  firstName: string;
  lastName?: string;
  countryCode?: string;
  mobileNumber: string;
  email: string;
  memberType?: 'chairman' | 'secretary' | 'treasurer' | 'member' | 'other';
  society?: string;
  building?: string;
  block?: string;
  status?: 'active' | 'inactive' | 'resigned' | 'archived';
}

export interface UpdateCommitteeMemberPayload {
  id: string;
  firstName?: string;
  lastName?: string;
  countryCode?: string;
  mobileNumber?: string;
  email?: string;
  memberType?: 'chairman' | 'secretary' | 'treasurer' | 'member' | 'other';
  society?: string;
  building?: string;
  block?: string;
  status?: 'active' | 'inactive' | 'resigned' | 'archived';
}

export interface DeleteCommitteeMemberPayload {
  id: string;
  hard?: boolean;
}

