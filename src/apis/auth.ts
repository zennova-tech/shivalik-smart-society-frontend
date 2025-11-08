import { LoginPayload } from '@/types/LoginTypes';
import { apiRequest } from './apiRequest';

// API function to authenticate user
export const authenticateUserApi = async (data: LoginPayload): Promise<any> => {
    return await apiRequest<any>({
        method: 'POST',
        url: 'auth/login',
        data: data,
    });
};

// API function to verify OTP
export const verifyOTPApi = async (data: any): Promise<LoginPayload> => {
    return await apiRequest<LoginPayload>({
        method: 'POST',
        url: 'auth/verify-otp',
        data: data,
    });
};