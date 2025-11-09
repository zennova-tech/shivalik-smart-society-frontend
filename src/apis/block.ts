import { apiRequest } from './apiRequest';

export interface Block {
  _id: string;
  name: string;
  building?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string | { _id: string; firstName: string; lastName: string; email: string };
  updatedBy?: string | { _id: string; firstName: string; lastName: string; email: string };
}

export interface BlockResponse {
  items: Block[];
  total: number;
  page: number;
  limit: number;
}

export interface GetBlocksParams {
  page?: number;
  limit?: number;
  q?: string;
  status?: string;
  building?: string;
}

export interface AddBlockPayload {
  name: string;
  building?: string;
  status?: string;
}

export interface UpdateBlockPayload {
  id: string;
  name?: string;
  building?: string;
  status?: string;
}

export interface DeleteBlockPayload {
  id: string;
  hard?: boolean;
}

export const getBlocksApi = async (params?: GetBlocksParams): Promise<BlockResponse> => {
  return await apiRequest<BlockResponse>({
    method: 'GET',
    url: 'blocks',
    params: params,
  });
};

export const getBlockByIdApi = async (id: string): Promise<Block> => {
  return await apiRequest<Block>({
    method: 'GET',
    url: `blocks/${id}`,
  });
};

export const addBlockApi = async (data: AddBlockPayload): Promise<Block> => {
  return await apiRequest<Block>({
    method: 'POST',
    url: 'blocks',
    data: data,
  });
};

export const updateBlockApi = async (data: UpdateBlockPayload): Promise<Block> => {
  const { id, ...updateData } = data;
  return await apiRequest<Block>({
    method: 'PUT',
    url: `blocks/${id}`,
    data: updateData,
  });
};

export const deleteBlockApi = async (data: DeleteBlockPayload): Promise<void> => {
  const params = data.hard ? { hard: 'true' } : {};
  return await apiRequest<void>({
    method: 'DELETE',
    url: `blocks/${data.id}`,
    params: params,
  });
};

