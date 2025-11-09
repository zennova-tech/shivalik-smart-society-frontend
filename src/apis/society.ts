import { apiRequest } from './apiRequest';
import { Society, GetSocietiesPayload, AddSocietyPayload, UpdateSocietyPayload, DeleteSocietyPayload, SocietyResponse } from '@/types/SocietyTypes';

// Backend response format for /list endpoint
interface BackendSocietyResponse {
    status: boolean;
    message: string;
    data: BackendSociety[];
}

// Backend society format
interface BackendSociety {
    id: string;
    code?: string | null;
    name: string;
    territory?: string | null;
    address?: string | null;
    status?: string;
    estbYear?: number | null;
    admin?: {
        name?: string;
        email?: string | null;
        mobile?: string | null;
        countryCode?: string | null;
    } | null;
    blocks?: {
        count: number;
        names?: string[];
    };
    units?: {
        count: number;
    };
    residents?: {
        count: number;
    };
    parking?: {
        totalConfigured: number;
    };
    amenitiesCount?: number;
}

// Map backend society to frontend Society type
const mapBackendSocietyToFrontend = (backendSociety: BackendSociety): Society => {
    // Combine countryCode and mobile for contactNumber
    let contactNumber = '';
    if (backendSociety.admin?.countryCode && backendSociety.admin?.mobile) {
        contactNumber = `${backendSociety.admin.countryCode} ${backendSociety.admin.mobile}`;
    } else if (backendSociety.admin?.mobile) {
        contactNumber = backendSociety.admin.mobile;
    }

    // Extract city, state, pincode from address or territory if possible
    // For now, we'll leave them empty since backend doesn't provide them separately
    // If address contains this info, it can be parsed here in the future
    
    return {
        id: backendSociety.id,
        name: backendSociety.name,
        address: backendSociety.address || '',
        territory: backendSociety.territory || '',
        city: '', // Not provided by backend, can be extracted from address if needed
        state: '', // Not provided by backend, can be extracted from address if needed
        pincode: '', // Not provided by backend, can be extracted from address if needed
        country: 'India', // Default or can be extracted from territory
        contactNumber: contactNumber || undefined,
        email: backendSociety.admin?.email || undefined,
        // Additional fields from backend
        code: backendSociety.code,
        status: backendSociety.status,
        estbYear: backendSociety.estbYear,
        blocksCount: backendSociety.blocks?.count,
        unitsCount: backendSociety.units?.count,
        residentsCount: backendSociety.residents?.count,
        parkingSpaces: backendSociety.parking?.totalConfigured,
        amenitiesCount: backendSociety.amenitiesCount,
    };
};

export const getSocietiesApi = async (params?: GetSocietiesPayload): Promise<SocietyResponse> => {
    // Call the /list endpoint
    const response = await apiRequest<BackendSocietyResponse>({
        method: 'GET',
        url: 'societies/list',
        params: params,
    });
    
    // Backend returns { status: true, message: "...", data: [...] }
    // Map backend societies to frontend format
    const societies: Society[] = (response.data || []).map(mapBackendSocietyToFrontend);
    
    return {
        data: societies,
        total: societies.length,
    };
};

export const getSocietyByIdApi = async (id: string): Promise<Society> => {
    return await apiRequest<Society>({
        method: 'GET',
        url: `societies/${id}`,
    });
};

export const addSocietyApi = async (data: AddSocietyPayload): Promise<Society> => {
    const response = await apiRequest<{ status: boolean; message: string; data: { society: Society; manager: { id: string; email: string }; inviteSent: boolean } }>({
        method: 'POST',
        url: 'societies',
        data: data,
    });
    // Backend returns { status: true, message: "...", data: { society, manager, inviteSent } }
    // Extract society from response.data.society
    if (response && response.data && response.data.society) {
        return response.data.society;
    }
    // Fallback: if response structure is different, return the data directly
    return (response as any).data || response as any;
};

export const updateSocietyApi = async (data: UpdateSocietyPayload): Promise<Society> => {
    const { id, ...updateData } = data;
    return await apiRequest<Society>({
        method: 'PUT',
        url: `societies/${id}`,
        data: updateData,
    });
};

export const deleteSocietyApi = async (data: DeleteSocietyPayload): Promise<void> => {
    return await apiRequest<void>({
        method: 'DELETE',
        url: `societies/${data.id}`,
    });
};

