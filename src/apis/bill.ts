import { apiRequest } from './apiRequest';
import {
  Bill,
  BillResponse,
  CreateBillPayload,
  GetBillsParams,
  UpdateBillPayload,
} from '@/types/BillTypes';

export const createBillApi = async (data: CreateBillPayload): Promise<Bill[]> => {
  const response = await apiRequest<{ data: Bill[] }>({
    method: 'POST',
    url: 'manager/bills',
    data: data,
  });
  return response.data;
};

export const getBillsApi = async (params?: GetBillsParams): Promise<BillResponse> => {
  const response = await apiRequest<{ data: BillResponse }>({
    method: 'GET',
    url: 'manager/bills',
    params: params,
  });
  return response.data;
};

export const getBillByIdApi = async (id: string): Promise<Bill> => {
  const response = await apiRequest<{ data: Bill }>({
    method: 'GET',
    url: `manager/bills/${id}`,
  });
  return response.data;
};

export const updateBillApi = async (data: UpdateBillPayload): Promise<Bill> => {
  const { id, ...updateData } = data;
  const response = await apiRequest<{ data: Bill }>({
    method: 'PUT',
    url: `manager/bills/${id}`,
    data: updateData,
  });
  return response.data;
};

export const publishBillApi = async (id: string): Promise<Bill> => {
  const response = await apiRequest<{ data: Bill }>({
    method: 'POST',
    url: `manager/bills/${id}/publish`,
  });
  return response.data;
};

export const deleteBillApi = async (id: string): Promise<void> => {
  await apiRequest<void>({
    method: 'DELETE',
    url: `manager/bills/${id}`,
  });
};

