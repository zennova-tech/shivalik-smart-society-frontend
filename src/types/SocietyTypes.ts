export interface Society {
    id?: string;
    name: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
    contactNumber?: string;
    email?: string;
    [key: string]: any; // Allow additional fields
}

export interface GetSocietiesPayload {
    page?: number;
    limit?: number;
    search?: string;
    [key: string]: any;
}

export interface AddSocietyPayload {
    name: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
    contactNumber?: string;
    email?: string;
    [key: string]: any;
}

export interface UpdateSocietyPayload {
    id: string;
    name?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
    contactNumber?: string;
    email?: string;
    [key: string]: any;
}

export interface DeleteSocietyPayload {
    id: string;
}

export interface SocietyResponse {
    data: Society[];
    total?: number;
    page?: number;
    limit?: number;
}

