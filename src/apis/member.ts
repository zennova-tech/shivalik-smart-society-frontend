import { apiRequest } from './apiRequest';
import {
  Member,
  GetMembersPayload,
  AddMemberPayload,
  UpdateMemberPayload,
  DeleteMemberPayload,
  MemberResponse,
} from '@/types/MemberTypes';

export const getMembersApi = async (params?: GetMembersPayload): Promise<MemberResponse> => {
  return await apiRequest<MemberResponse>({
    method: 'GET',
    url: 'members',
    params: params,
  });
};

export const getMemberByIdApi = async (id: string): Promise<Member> => {
  return await apiRequest<Member>({
    method: 'GET',
    url: `members/${id}`,
  });
};

export const addMemberApi = async (data: AddMemberPayload): Promise<Member> => {
  const response = await apiRequest<{
    status: boolean;
    message: string;
    data: { member: Member };
  }>({
    method: 'POST',
    url: 'members',
    data: data,
  });
  // Backend returns { status: true, message: "...", data: { member } }
  // Extract member from response.data.member
  if (response && response.data && response.data.member) {
    return response.data.member;
  }
  // Fallback: if response structure is different, return the data directly
  return (response as any).data || response as any;
};

export const updateMemberApi = async (data: UpdateMemberPayload): Promise<Member> => {
  const { id, ...updateData } = data;
  return await apiRequest<Member>({
    method: 'PUT',
    url: `members/${id}`,
    data: updateData,
  });
};

export const deleteMemberApi = async (data: DeleteMemberPayload): Promise<void> => {
  return await apiRequest<void>({
    method: 'DELETE',
    url: `members/${data.id}`,
  });
};

