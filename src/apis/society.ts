import { apiRequest } from './apiRequest';
import { Society, GetSocietiesPayload, AddSocietyPayload, UpdateSocietyPayload, DeleteSocietyPayload, SocietyResponse } from '@/types/SocietyTypes';

export const getSocietiesApi = async (params?: GetSocietiesPayload): Promise<SocietyResponse> => {
    return await apiRequest<SocietyResponse>({
        method: 'GET',
        url: 'societies',
        params: params,
    });
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

