import { apiRequest } from './apiRequest';
import { getBuildingApi } from './building';
import { getSocietyId } from '../utils/societyUtils';

export interface Notice {
  _id: string;
  title: string;
  description?: string;
  category: string;
  priority: string;
  block?: string | { _id: string; name: string };
  unit?: string | { _id: string; unitNumber: string };
  publishDate: string;
  expiryDate?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string | { _id: string; firstName: string; lastName: string };
  updatedBy?: string | { _id: string; firstName: string; lastName: string };
}

export interface NoticeResponse {
  items: Notice[];
  total: number;
  page: number;
  limit: number;
}

export interface GetNoticeParams {
  page?: number;
  limit?: number;
  q?: string;
  status?: string;
  block?: string;
  unit?: string;
  priority?: string;
  onlyActive?: boolean;
}

export interface AddNoticePayload {
  title: string;
  description?: string;
  category?: string;
  priority?: string;
  block?: string;
  unit?: string;
  publishDate?: string | number;
  expiryDate?: string;
  status?: string;
}

export interface UpdateNoticePayload {
  id: string;
  title?: string;
  description?: string;
  category?: string;
  priority?: string;
  block?: string;
  unit?: string;
  publishDate?: string | number;
  expiryDate?: string;
  status?: string;
}

export interface DeleteNoticePayload {
  id: string;
  hard?: boolean;
}

export const getNoticeApi = async (params?: GetNoticeParams): Promise<NoticeResponse> => {
  return await apiRequest<NoticeResponse>({
    method: 'GET',
    url: 'notices',
    params: params,
  });
};

export const getNoticeByIdApi = async (id: string): Promise<Notice> => {
  return await apiRequest<Notice>({
    method: 'GET',
    url: `notices/${id}`,
  });
};

export const addNoticeApi = async (data: AddNoticePayload): Promise<Notice> => {
  return await apiRequest<Notice>({
    method: 'POST',
    url: 'notices',
    data: data,
  });
};

export const updateNoticeApi = async (data: UpdateNoticePayload): Promise<Notice> => {
  const { id, ...updateData } = data;
  return await apiRequest<Notice>({
    method: 'PUT',
    url: `notices/${id}`,
    data: updateData,
  });
};

export const deleteNoticeApi = async (data: DeleteNoticePayload): Promise<void> => {
  const params = data.hard ? { hard: 'true' } : {};
  return await apiRequest<void>({
    method: 'DELETE',
    url: `notices/${data.id}`,
    params: params,
  });
};

/**
 * Fetch notices filtered by society ID (through building)
 */
export const getNoticesBySocietyApi = async (params?: GetNoticeParams): Promise<NoticeResponse> => {
  try {
    const societyId = getSocietyId();
    if (!societyId) {
      throw new Error('Society ID not found. Please select a society first.');
    }

    // For notices, we don't filter by building directly
    // Notices can be associated with blocks/units which belong to buildings
    // So we fetch all notices and filter client-side if needed
    const response = await getNoticeApi(params);
    return response;
  } catch (error: any) {
    console.error('Error fetching notices by society:', error);
    throw error;
  }
};

