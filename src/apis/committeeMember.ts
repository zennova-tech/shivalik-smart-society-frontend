import { apiRequest } from './apiRequest';
import {
  CommitteeMember,
  GetCommitteeMembersParams,
  AddCommitteeMemberPayload,
  UpdateCommitteeMemberPayload,
  DeleteCommitteeMemberPayload,
  CommitteeMemberResponse,
} from '@/types/CommitteeMemberTypes';

export const getCommitteeMembersApi = async (
  params?: GetCommitteeMembersParams
): Promise<CommitteeMemberResponse> => {
  return await apiRequest<CommitteeMemberResponse>({
    method: 'GET',
    url: 'committee',
    params: params,
  });
};

export const getCommitteeMemberByIdApi = async (id: string): Promise<CommitteeMember> => {
  return await apiRequest<CommitteeMember>({
    method: 'GET',
    url: `committee/${id}`,
  });
};

export const addCommitteeMemberApi = async (
  data: AddCommitteeMemberPayload
): Promise<CommitteeMember> => {
  return await apiRequest<CommitteeMember>({
    method: 'POST',
    url: 'committee',
    data: data,
  });
};

export const updateCommitteeMemberApi = async (
  data: UpdateCommitteeMemberPayload
): Promise<CommitteeMember> => {
  const { id, ...updateData } = data;
  return await apiRequest<CommitteeMember>({
    method: 'PUT',
    url: `committee/${id}`,
    data: updateData,
  });
};

export const deleteCommitteeMemberApi = async (
  data: DeleteCommitteeMemberPayload
): Promise<void> => {
  const params = data.hard ? { hard: 'true' } : {};
  return await apiRequest<void>({
    method: 'DELETE',
    url: `committee/${data.id}`,
    params: params,
  });
};

