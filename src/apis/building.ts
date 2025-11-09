import { apiRequest } from './apiRequest';

// Building update payload type
export interface UpdateBuildingPayload {
    societyId?: string; // Society ID for update/create operation
    society?: {
        name?: string;
        logo?: string;
        ref?: string;
    };
    buildingName?: string;
    address?: string;
    territory?: string;
    city?: string;
    state?: string;
    pinCode?: string;
    totalBlocks?: number;
    totalUnits?: number;
    buildingType?: string;
    createdBy?: string;
}

// Building API Response interface
export interface BuildingApiResponse {
    item?: any; // Singular item (when API returns single building)
    items?: any[]; // Plural items (when API returns array)
    total?: number;
    page?: number;
    limit?: number;
    _id?: string; // Direct building object
}

/**
 * Normalizes building API response to always return an array of buildings
 * Handles both 'item' (singular) and 'items' (plural) response formats
 * Also handles responses wrapped in 'data' property
 * @param buildingResponse - The raw API response (may be wrapped in 'data' or direct)
 * @returns Array of building objects
 */
export const normalizeBuildingResponse = (buildingResponse: any): any[] => {
    if (!buildingResponse || typeof buildingResponse !== 'object') {
        return [];
    }

    // Handle response wrapped in 'data' property - e.g., { data: { item: {...} } }
    let response = buildingResponse;
    if (buildingResponse.data && typeof buildingResponse.data === 'object') {
        response = buildingResponse.data;
    }

    // Handle response with 'item' (singular) - e.g., { item: {...}, total: 1, page: 1, limit: 20 }
    if (response.item && typeof response.item === 'object') {
        return [response.item];
    }

    // Handle response with 'items' (plural) - e.g., { items: [...], total: 1, page: 1, limit: 20 }
    if (Array.isArray(response.items)) {
        return response.items;
    }

    // Handle direct building object with _id
    if (response._id && !Array.isArray(response)) {
        return [response];
    }

    // Handle direct array response
    if (Array.isArray(response)) {
        return response;
    }

    return [];
};

// API function to get building details by society ID
export const getBuildingApi = async (societyId: string): Promise<any> => {
    return await apiRequest<any>({
        method: 'GET',
        url: `building-details/${societyId}`,
    });
};

export const updateBuildingApi = async (data: UpdateBuildingPayload): Promise<any> => {
    return await apiRequest<any>({
        method: 'PUT',
        url: `building-details/${data?.societyId}`,
        data: data,
    });
};

