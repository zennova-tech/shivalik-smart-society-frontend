import { apiRequest } from './apiRequest';
import { getBuildingApi, normalizeBuildingResponse } from './building';
import { getSocietyId } from '../utils/societyUtils';

export interface BookingSlot {
  startTime: string;
  endTime: string;
  capacity?: number;
  _id?: string;
}

export interface Amenity {
  _id: string;
  name: string;
  description: string;
  capacity: number;
  amenityType: string;
  photoUrl?: string;
  bookingType: string;
  slots: BookingSlot[];
  advanceBookingDays: number;
  block?: string | { _id: string; name: string };
  building?: string | { _id: string; buildingName: string };
  status: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string | { _id: string; firstName: string; lastName: string };
  updatedBy?: string | { _id: string; firstName: string; lastName: string };
}

export interface AmenityResponse {
  items: Amenity[];
  total: number;
  page: number;
  limit: number;
}

export interface GetAmenityParams {
  page?: number;
  limit?: number;
  q?: string;
  building?: string;
  block?: string;
  status?: string;
}

export interface AddAmenityPayload {
  name: string;
  description: string;
  capacity: number;
  amenityType?: string;
  photoUrl?: string;
  bookingType?: string;
  slots?: BookingSlot[];
  advanceBookingDays?: number;
  block?: string;
  building?: string;
  status?: string;
}

export interface UpdateAmenityPayload {
  id: string;
  name?: string;
  description?: string;
  capacity?: number;
  amenityType?: string;
  photoUrl?: string;
  bookingType?: string;
  slots?: BookingSlot[];
  advanceBookingDays?: number;
  block?: string;
  building?: string;
  status?: string;
}

export interface DeleteAmenityPayload {
  id: string;
  hard?: boolean;
}

export const getAmenityApi = async (params?: GetAmenityParams): Promise<AmenityResponse> => {
  return await apiRequest<AmenityResponse>({
    method: 'GET',
    url: 'amenities',
    params: params,
  });
};

export const getAmenityByIdApi = async (id: string): Promise<Amenity> => {
  return await apiRequest<Amenity>({
    method: 'GET',
    url: `amenities/${id}`,
  });
};

export const addAmenityApi = async (data: AddAmenityPayload): Promise<Amenity> => {
  return await apiRequest<Amenity>({
    method: 'POST',
    url: 'amenities',
    data: data,
  });
};

export const updateAmenityApi = async (data: UpdateAmenityPayload): Promise<Amenity> => {
  const { id, ...updateData } = data;
  return await apiRequest<Amenity>({
    method: 'PUT',
    url: `amenities/${id}`,
    data: updateData,
  });
};

export const deleteAmenityApi = async (data: DeleteAmenityPayload): Promise<void> => {
  const params = data.hard ? { hard: 'true' } : {};
  return await apiRequest<void>({
    method: 'DELETE',
    url: `amenities/${data.id}`,
    params: params,
  });
};

/**
 * Fetch amenities filtered by society ID (through building)
 */
export const getAmenitiesBySocietyApi = async (params?: Omit<GetAmenityParams, 'building'>): Promise<AmenityResponse> => {
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
    const amenityPromises = buildingIds.map((buildingId: string) =>
      getAmenityApi({
        ...params,
        building: buildingId,
        limit: maxLimit,
      }).catch((error) => {
        console.error(`Error fetching amenities for building ${buildingId}:`, error);
        return { items: [], total: 0, page: 1, limit: maxLimit };
      })
    );

    const amenityResponses = await Promise.all(amenityPromises);
    const allAmenities: Amenity[] = [];
    amenityResponses.forEach((response) => {
      if (response.items && response.items.length > 0) {
        allAmenities.push(...response.items);
      }
    });

    const uniqueAmenities = Array.from(
      new Map(allAmenities.map((amenity) => [amenity._id, amenity])).values()
    );

    let filteredAmenities = uniqueAmenities;
    if (params?.status) {
      filteredAmenities = uniqueAmenities.filter((amenity) => amenity.status === params.status);
    }

    if (params?.q) {
      const searchTerm = params.q.toLowerCase();
      filteredAmenities = filteredAmenities.filter(
        (amenity) => 
          amenity.name?.toLowerCase().includes(searchTerm) ||
          amenity.description?.toLowerCase().includes(searchTerm)
      );
    }

    return {
      items: filteredAmenities,
      total: filteredAmenities.length,
      page: params?.page || 1,
      limit: maxLimit,
    };
  } catch (error: any) {
    console.error('Error fetching amenities by society:', error);
    throw error;
  }
};

