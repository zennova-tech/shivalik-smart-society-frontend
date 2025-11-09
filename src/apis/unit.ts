import { apiRequest } from './apiRequest';

export interface UnitOwner {
  _id: string;
  firstName: string;
  lastName?: string;
  email?: string;
  countryCode?: string;
  mobileNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  occupation?: string;
  address?: string;
  aadharNumber?: string;
  panNumber?: string;
  [key: string]: any;
}

export interface Unit {
  _id: string;
  unitNumber: string;
  unitType?: string;
  areaSqFt?: number;
  status?: string;
  block?: string | { _id: string; name: string };
  floor?: string | { _id: string; name: string; number: number };
  owner?: string | UnitOwner;
  createdBy?: string | { _id: string; firstName: string; lastName: string };
  updatedBy?: string | { _id: string; firstName: string; lastName: string };
  createdAt?: string;
  updatedAt?: string;
}

export interface UnitResponse {
  items: Unit[];
  total: number;
  page: number;
  limit: number;
}

export interface GetUnitsParams {
  page?: number;
  limit?: number;
  q?: string;
  block?: string;
  floor?: string;
  status?: string;
}

export interface AddUnitPayload {
  block: string;
  floor: string;
  unitNumber: string;
  unitType?: string;
  areaSqFt?: number;
  status?: string;
  owner?: string;
}

export interface UpdateUnitPayload {
  id: string;
  block?: string;
  floor?: string;
  unitNumber?: string;
  unitType?: string;
  areaSqFt?: number;
  status?: string;
  owner?: string;
}

export interface DeleteUnitPayload {
  id: string;
  hard?: boolean;
}

export const getUnitsApi = async (params?: GetUnitsParams): Promise<UnitResponse> => {
  return await apiRequest<UnitResponse>({
    method: 'GET',
    url: 'units',
    params: params,
  });
};

export const getUnitByIdApi = async (id: string): Promise<Unit> => {
  return await apiRequest<Unit>({
    method: 'GET',
    url: `units/${id}`,
  });
};

export const addUnitApi = async (data: AddUnitPayload): Promise<Unit> => {
  return await apiRequest<Unit>({
    method: 'POST',
    url: 'units',
    data: data,
  });
};

export const updateUnitApi = async (data: UpdateUnitPayload): Promise<Unit> => {
  const { id, ...updateData } = data;
  return await apiRequest<Unit>({
    method: 'PUT',
    url: `units/${id}`,
    data: updateData,
  });
};

export const deleteUnitApi = async (data: DeleteUnitPayload): Promise<void> => {
  const params = data.hard ? { hard: 'true' } : {};
  return await apiRequest<void>({
    method: 'DELETE',
    url: `units/${data.id}`,
    params: params,
  });
};

