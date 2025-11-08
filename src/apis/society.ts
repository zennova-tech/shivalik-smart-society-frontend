import { apiRequest } from './apiRequest';
import { Society, GetSocietiesPayload, AddSocietyPayload, UpdateSocietyPayload, DeleteSocietyPayload, SocietyResponse } from '@/types/SocietyTypes';

export const getSocietiesApi = async (params?: GetSocietiesPayload): Promise<SocietyResponse> => {
    return await apiRequest<SocietyResponse>({
        method: 'GET',
        url: 'society',
        params: params,
    });
};

export const getSocietyByIdApi = async (id: string): Promise<Society> => {
    return await apiRequest<Society>({
        method: 'GET',
        url: `society/${id}`,
    });
};

export const addSocietyApi = async (data: AddSocietyPayload): Promise<Society> => {
    return await apiRequest<Society>({
        method: 'POST',
        url: 'society',
        data: data,
    });
};

export const updateSocietyApi = async (data: UpdateSocietyPayload): Promise<Society> => {
    const { id, ...updateData } = data;
    return await apiRequest<Society>({
        method: 'PUT',
        url: `society/${id}`,
        data: updateData,
    });
};

export const deleteSocietyApi = async (data: DeleteSocietyPayload): Promise<void> => {
    return await apiRequest<void>({
        method: 'DELETE',
        url: `society/${data.id}`,
    });
};

