import { apiRequest } from './apiRequest';
import apiClient from './apiService';
import {
  UtilityBill,
  UtilityBillResponse,
  UnitCustomerMapping,
  CustomerMappingResponse,
  GetUtilityBillsParams,
  GetCustomerMappingsParams,
  FetchUtilityBillsPayload,
  UpdateUtilityBillPayload,
  UpdateCustomerMappingPayload,
  UploadCustomerIdsResponse,
  FetchBillsResponse,
} from '@/types/BillingTypes';

/**
 * Upload Excel file with customer IDs
 */
export const uploadCustomerIdsApi = async (file: File): Promise<UploadCustomerIdsResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post('billing/upload-customer-ids', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.data;
};

/**
 * Fetch utility bills from government API
 */
export const fetchUtilityBillsApi = async (data: FetchUtilityBillsPayload): Promise<FetchBillsResponse> => {
  const response = await apiRequest<{ data: FetchBillsResponse }>({
    method: 'POST',
    url: 'billing/fetch-bills',
    data: data,
  });
  return response.data;
};

/**
 * Get utility bills list
 */
export const getUtilityBillsApi = async (params?: GetUtilityBillsParams): Promise<UtilityBillResponse> => {
  return await apiRequest<UtilityBillResponse>({
    method: 'GET',
    url: 'billing/utility-bills',
    params: params,
  });
};

/**
 * Get utility bill by ID
 */
export const getUtilityBillByIdApi = async (id: string): Promise<UtilityBill> => {
  return await apiRequest<UtilityBill>({
    method: 'GET',
    url: `billing/utility-bills/${id}`,
  });
};

/**
 * Update utility bill
 */
export const updateUtilityBillApi = async (data: UpdateUtilityBillPayload): Promise<UtilityBill> => {
  const { id, ...updateData } = data;
  return await apiRequest<UtilityBill>({
    method: 'PUT',
    url: `billing/utility-bills/${id}`,
    data: updateData,
  });
};

/**
 * Get customer mappings list
 */
export const getCustomerMappingsApi = async (params?: GetCustomerMappingsParams): Promise<CustomerMappingResponse> => {
  return await apiRequest<CustomerMappingResponse>({
    method: 'GET',
    url: 'billing/customer-mappings',
    params: params,
  });
};

/**
 * Update customer mapping
 */
export const updateCustomerMappingApi = async (data: UpdateCustomerMappingPayload): Promise<UnitCustomerMapping> => {
  const { id, ...updateData } = data;
  return await apiRequest<UnitCustomerMapping>({
    method: 'PUT',
    url: `billing/customer-mappings/${id}`,
    data: updateData,
  });
};

