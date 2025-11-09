import { apiRequest } from './apiRequest';

export interface Floor {
  _id: string;
  name: string;
  number: number;
  block?: string | { _id: string; name: string; [key: string]: any };
  building?: string | { _id: string; id?: string; [key: string]: any };
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string | { _id: string; firstName: string; lastName: string };
  updatedBy?: string | { _id: string; firstName: string; lastName: string };
}

export interface FloorResponse {
  items: Floor[];
  total: number;
  page: number;
  limit: number;
}

export interface GetFloorsParams {
  page?: number;
  limit?: number;
  q?: string;
  block?: string;
  building?: string;
  status?: string;
}

export interface AddFloorPayload {
  name: string;
  number: number;
  block: string;
  building?: string;
  status?: string;
  societyId?: string; // Optional: backend can auto-get building from society
}

export interface UpdateFloorPayload {
  id: string;
  name?: string;
  number?: number;
  block?: string;
  building?: string;
  status?: string;
}

export interface DeleteFloorPayload {
  id: string;
  hard?: boolean;
}

export interface BatchCreateFloorPayload {
  block: string;
  building?: string;
  prefix: string;
  startNumber: number;
  endNumber: number;
}

export interface BatchCreateFloorResponse {
  message: string;
  requested: number;
  existingCount: number;
  createdCount: number;
  existingNumbers: number[];
}

export const getFloorsApi = async (params?: GetFloorsParams): Promise<FloorResponse> => {
  return await apiRequest<FloorResponse>({
    method: 'GET',
    url: 'floors',
    params: params,
  });
};

export const getFloorByIdApi = async (id: string): Promise<Floor> => {
  return await apiRequest<Floor>({
    method: 'GET',
    url: `floors/${id}`,
  });
};

export const addFloorApi = async (data: AddFloorPayload): Promise<Floor> => {
  return await apiRequest<Floor>({
    method: 'POST',
    url: 'floors',
    data: data,
  });
};

export const updateFloorApi = async (data: UpdateFloorPayload): Promise<Floor> => {
  const { id, ...updateData } = data;
  return await apiRequest<Floor>({
    method: 'PUT',
    url: `floors/${id}`,
    data: updateData,
  });
};

export const deleteFloorApi = async (data: DeleteFloorPayload): Promise<void> => {
  const params = data.hard ? { hard: 'true' } : {};
  return await apiRequest<void>({
    method: 'DELETE',
    url: `floors/${data.id}`,
    params: params,
  });
};

export const batchCreateFloorsApi = async (data: BatchCreateFloorPayload): Promise<BatchCreateFloorResponse> => {
  return await apiRequest<BatchCreateFloorResponse>({
    method: 'POST',
    url: 'floors/batch',
    data: data,
  });
};

