import { apiRequest } from './apiRequest';

export interface Complaint {
  _id: string;
  category: string;
  location?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  description: string;
  images?: string[];
  audioUrl?: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed' | 'archived';
  assignedTo?: string | {
    _id: string;
    firstName: string;
    lastName?: string;
  };
  comments?: Array<{
    comment: string;
    commentedBy: string | {
      _id: string;
      firstName: string;
      lastName?: string;
    };
    createdAt: string;
  }>;
  createdBy?: string | {
    _id: string;
    firstName: string;
    lastName?: string;
    email?: string;
  };
  resolvedAt?: string;
  society?: string;
  raisedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ComplaintResponse {
  items: Complaint[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateComplaintPayload {
  category: string;
  location?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  description: string;
}

export interface UpdateComplaintPayload {
  id: string;
  category?: string;
  location?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  description?: string;
  status?: 'open' | 'in_progress' | 'resolved' | 'closed' | 'archived';
  assignedTo?: string;
  resolvedAt?: string;
}

export interface GetComplaintsParams {
  page?: number;
  limit?: number;
  status?: 'open' | 'in_progress' | 'resolved' | 'closed' | 'archived';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  q?: string;
}

export const createComplaintApi = async (data: CreateComplaintPayload): Promise<Complaint> => {
  // For now, manager/complaints endpoint doesn't support file uploads
  // We'll send basic fields only. File uploads can be added later if needed
  const payload: any = {
    category: data.category,
    description: data.description,
  };
  
  if (data.location) payload.location = data.location;
  if (data.priority) payload.priority = data.priority;

  const response = await apiRequest<{ data: Complaint }>({
    method: 'POST',
    url: 'manager/complaints',
    data: payload,
  });
  return response.data;
};

export const getComplaintsApi = async (params?: GetComplaintsParams): Promise<ComplaintResponse> => {
  const response = await apiRequest<{ data: ComplaintResponse }>({
    method: 'GET',
    url: 'manager/complaints',
    params: params,
  });
  return response.data;
};

export const getComplaintByIdApi = async (id: string): Promise<Complaint> => {
  const response = await apiRequest<{ data: Complaint }>({
    method: 'GET',
    url: `complaints/${id}`,
  });
  return response.data;
};

export const updateComplaintApi = async (data: UpdateComplaintPayload): Promise<Complaint> => {
  const { id, ...updateData } = data;
  const response = await apiRequest<{ data: Complaint }>({
    method: 'PUT',
    url: `complaints/${id}`,
    data: updateData,
  });
  return response.data;
};

export const deleteComplaintApi = async (id: string): Promise<void> => {
  await apiRequest<void>({
    method: 'DELETE',
    url: `complaints/${id}`,
  });
};

export const addCommentApi = async (id: string, comment: string): Promise<Complaint> => {
  const response = await apiRequest<{ data: Complaint }>({
    method: 'POST',
    url: `complaints/${id}/comments`,
    data: { comment },
  });
  return response.data;
};

