import { apiRequest } from './apiRequest';
import { getBuildingApi, normalizeBuildingResponse } from './building';
import { getSocietyId } from '../utils/societyUtils';

export interface Parking {
  _id: string;
  name: string;
  memberCarSlots: number;
  memberBikeSlots: number;
  visitorCarSlots: number;
  visitorBikeSlots: number;
  block?: string | { _id: string; name: string };
  building?: string | { _id: string; buildingName: string };
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string | { _id: string; firstName: string; lastName: string };
  updatedBy?: string | { _id: string; firstName: string; lastName: string };
}

export interface ParkingResponse {
  items: Parking[];
  total: number;
  page: number;
  limit: number;
}

export interface GetParkingParams {
  page?: number;
  limit?: number;
  q?: string;
  building?: string;
  block?: string;
  status?: string;
}

export interface AddParkingPayload {
  name: string;
  memberCarSlots: number;
  memberBikeSlots: number;
  visitorCarSlots: number;
  visitorBikeSlots: number;
  block?: string;
  building?: string;
  status?: string;
}

export interface UpdateParkingPayload {
  id: string;
  name?: string;
  memberCarSlots?: number;
  memberBikeSlots?: number;
  visitorCarSlots?: number;
  visitorBikeSlots?: number;
  block?: string;
  building?: string;
  status?: string;
}

export interface DeleteParkingPayload {
  id: string;
  hard?: boolean;
}

export const getParkingApi = async (params?: GetParkingParams): Promise<ParkingResponse> => {
  return await apiRequest<ParkingResponse>({
    method: 'GET',
    url: 'parkings',
    params: params,
  });
};

export const getParkingByIdApi = async (id: string): Promise<Parking> => {
  return await apiRequest<Parking>({
    method: 'GET',
    url: `parkings/${id}`,
  });
};

export const addParkingApi = async (data: AddParkingPayload): Promise<Parking> => {
  return await apiRequest<Parking>({
    method: 'POST',
    url: 'parkings',
    data: data,
  });
};

export const updateParkingApi = async (data: UpdateParkingPayload): Promise<Parking> => {
  const { id, ...updateData } = data;
  return await apiRequest<Parking>({
    method: 'PUT',
    url: `parkings/${id}`,
    data: updateData,
  });
};

export const deleteParkingApi = async (data: DeleteParkingPayload): Promise<void> => {
  const params = data.hard ? { hard: 'true' } : {};
  return await apiRequest<void>({
    method: 'DELETE',
    url: `parkings/${data.id}`,
    params: params,
  });
};

/**
 * Fetch parking filtered by society ID (through building)
 */
export const getParkingBySocietyApi = async (params?: Omit<GetParkingParams, 'building'>): Promise<ParkingResponse> => {
  try {
    const societyId = getSocietyId();
    if (!societyId) {
      throw new Error('Society ID not found. Please select a society first.');
    }

    const buildingResponse = await getBuildingApi(societyId);
    
    // Normalize building response to handle both 'item' (singular) and 'items' (plural) formats
    const buildings = normalizeBuildingResponse(buildingResponse);

    if (buildings.length === 0) {
      return {
        items: [],
        total: 0,
        page: params?.page || 1,
        limit: params?.limit || 500,
      };
    }

    const buildingIds = buildings.map((b: any) => b._id || b.id).filter(Boolean);
    if (buildingIds.length === 0) {
      return {
        items: [],
        total: 0,
        page: params?.page || 1,
        limit: params?.limit || 500,
      };
    }

    const maxLimit = Math.min(params?.limit || 500, 500);
    const parkingPromises = buildingIds.map((buildingId: string) =>
      getParkingApi({
        ...params,
        building: buildingId,
        limit: maxLimit,
      }).catch((error) => {
        console.error(`Error fetching parking for building ${buildingId}:`, error);
        return { items: [], total: 0, page: 1, limit: maxLimit };
      })
    );

    const parkingResponses = await Promise.all(parkingPromises);
    const allParking: Parking[] = [];
    parkingResponses.forEach((response) => {
      if (response.items && response.items.length > 0) {
        allParking.push(...response.items);
      }
    });

    const uniqueParking = Array.from(
      new Map(allParking.map((parking) => [parking._id, parking])).values()
    );

    let filteredParking = uniqueParking;
    if (params?.status) {
      filteredParking = uniqueParking.filter((parking) => parking.status === params.status);
    }

    if (params?.q) {
      const searchTerm = params.q.toLowerCase();
      filteredParking = filteredParking.filter(
        (parking) => parking.name?.toLowerCase().includes(searchTerm)
      );
    }

    return {
      items: filteredParking,
      total: filteredParking.length,
      page: params?.page || 1,
      limit: maxLimit,
    };
  } catch (error: any) {
    console.error('Error fetching parking by society:', error);
    throw error;
  }
};

