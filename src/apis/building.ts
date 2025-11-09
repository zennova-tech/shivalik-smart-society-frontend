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

