import { apiRequest } from './apiRequest';

import { FamilyMember } from '../types/MemberTypes';

export interface RegisterUserPayload {
  type: 'Owner' | 'Tenant';
  societyId: string;
  blockId: string;
  unitId: string;
  firstName: string;
  lastName?: string;
  email?: string;
  countryCode: string;
  mobileNumber: string;
  gender?: string;
  dateOfBirth?: string;
  occupation?: string;
  address?: string;
  aadharNumber?: string;
  panNumber?: string;
  profilePicture?: File | string;
  ownershipProof?: File | string;
  familyMembers?: FamilyMember[];
  [key: string]: any;
}

export interface RegisterUserResponse {
  status: boolean;
  message: string;
  data: {
    user?: any;
    member?: any;
  };
}

// API function to register a new user
export const registerUserApi = async (data: RegisterUserPayload): Promise<RegisterUserResponse> => {
  // Always use FormData to handle files and ensure consistent data format
  const formData = new FormData();
  
  // Add all fields to FormData
  Object.keys(data).forEach((key) => {
    if (key === 'profilePicture' || key === 'ownershipProof') {
      // Handle file uploads
      if (data[key] instanceof File) {
        formData.append(key, data[key]);
      }
    } else if (key === 'familyMembers') {
      // Handle familyMembers array - always include, even if empty
      // Convert to JSON string for FormData
      if (Array.isArray(data[key])) {
        formData.append(key, JSON.stringify(data[key]));
      } else {
        formData.append(key, JSON.stringify([]));
      }
    } else if (data[key] !== undefined && data[key] !== null && data[key] !== '') {
      // Handle all other fields
      formData.append(key, String(data[key]));
    }
  });

  // Always use FormData for consistency (backend should handle it)
  // If no files, FormData will still work fine with text fields
  return await apiRequest<RegisterUserResponse>({
    method: 'POST',
    url: 'user/register',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// API function to get available societies for registration
// TODO: Update URL to match your backend endpoint
// This can use the existing societies endpoint if it's public, or a separate registration endpoint
export const getAvailableSocietiesApi = async (params?: { search?: string }): Promise<any> => {
  return await apiRequest<any>({
    method: 'GET',
    url: 'user/register/societies', // Update this URL to match your backend
    params: params,
  });
};

// API function to get blocks for a society
// TODO: Update URL to match your backend endpoint
// This can use the existing blocks endpoint if it's public, or a separate registration endpoint
export const getSocietyBlocksApi = async (societyId: string): Promise<any> => {
  return await apiRequest<any>({
    method: 'GET',
    url: `user/register/societies/${societyId}/blocks`, // Update this URL to match your backend
    params: { building: societyId }, // Adjust params based on your backend structure
  });
};

// API function to get units for a block
// TODO: Update URL to match your backend endpoint
// This can use the existing units endpoint if it's public, or a separate registration endpoint
export const getBlockUnitsApi = async (societyId: string, blockId: string): Promise<any> => {
  return await apiRequest<any>({
    method: 'GET',
    url: `user/register/societies/${societyId}/blocks/${blockId}/units`, // Update this URL to match your backend
    params: { block: blockId }, // Adjust params based on your backend structure
  });
};

// Guest/User Request Interfaces
export interface GuestUser {
  unitId: string;
  unitNumber: string;
  unitType: string;
  blockId: string;
  blockName: string;
  floor: {
    id: string;
    name: string;
    number: number;
  };
  firstName: string;
  lastName?: string;
  mobileNumber: string;
  countryCode: string;
  email?: string;
  userId: string;
}

export interface GetGuestsResponse {
  status: boolean;
  message: string;
  data: {
    items: GuestUser[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface GetGuestsParams {
  page?: number;
  limit?: number;
}

// API function to get guest users (user requests)
export const getGuestsApi = async (params?: GetGuestsParams): Promise<GetGuestsResponse> => {
  return await apiRequest<GetGuestsResponse>({
    method: 'GET',
    url: 'user/register/guests',
    params: params,
  });
};

// API function to approve a guest user request
export const approveGuestApi = async (userId: string): Promise<{ status: boolean; message: string; data?: any }> => {
  return await apiRequest<{ status: boolean; message: string; data?: any }>({
    method: 'POST',
    url: `user/register/guests/${userId}/approve`, // Update if endpoint is different
  });
};

// API function to decline a guest user request
export const declineGuestApi = async (userId: string): Promise<{ status: boolean; message: string; data?: any }> => {
  return await apiRequest<{ status: boolean; message: string; data?: any }>({
    method: 'POST',
    url: `user/register/guests/${userId}/decline`, // Update if endpoint is different
  });
};

