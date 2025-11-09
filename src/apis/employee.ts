import { apiRequest } from './apiRequest';
import {
  Employee,
  GetEmployeesParams,
  AddEmployeePayload,
  UpdateEmployeePayload,
  DeleteEmployeePayload,
  EmployeeResponse,
} from '@/types/EmployeeTypes';

export const getEmployeesApi = async (params?: GetEmployeesParams): Promise<EmployeeResponse> => {
  return await apiRequest<EmployeeResponse>({
    method: 'GET',
    url: 'employees',
    params: params,
  });
};

export const getEmployeeByIdApi = async (id: string): Promise<Employee> => {
  return await apiRequest<Employee>({
    method: 'GET',
    url: `employees/${id}`,
  });
};

export const addEmployeeApi = async (data: AddEmployeePayload): Promise<Employee> => {
  return await apiRequest<Employee>({
    method: 'POST',
    url: 'employees',
    data: data,
  });
};

export const updateEmployeeApi = async (data: UpdateEmployeePayload): Promise<Employee> => {
  const { id, ...updateData } = data;
  return await apiRequest<Employee>({
    method: 'PUT',
    url: `employees/${id}`,
    data: updateData,
  });
};

export const deleteEmployeeApi = async (data: DeleteEmployeePayload): Promise<void> => {
  const params = data.hard ? { hard: 'true' } : {};
  return await apiRequest<void>({
    method: 'DELETE',
    url: `employees/${data.id}`,
    params: params,
  });
};

