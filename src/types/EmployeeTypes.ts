export interface Employee {
  _id: string;
  firstName: string;
  lastName?: string;
  countryCode: string;
  mobileNumber: string;
  email: string;
  employeeType: 'security' | 'gardener' | 'electrician' | 'cleaning' | 'admin' | 'other';
  idProofUrl?: string;
  policeVerificationUrl?: string;
  society?: string;
  building?: string | { _id: string; buildingName: string };
  block?: string | { _id: string; name: string };
  status: 'active' | 'inactive' | 'terminated';
  createdBy?: string | { _id: string; firstName: string; lastName: string };
  updatedBy?: string | { _id: string; firstName: string; lastName: string };
  createdAt?: string;
  updatedAt?: string;
}

export interface EmployeeResponse {
  items: Employee[];
  total: number;
  page: number;
  limit: number;
}

export interface GetEmployeesParams {
  page?: number;
  limit?: number;
  q?: string;
  society?: string;
  status?: string;
  employeeType?: string;
}

export interface AddEmployeePayload {
  firstName?: string;
  lastName?: string;
  countryCode?: string;
  mobileNumber?: string;
  email?: string;
  employeeType?: 'security' | 'gardener' | 'electrician' | 'cleaning' | 'admin' | 'other' | string;
  idProofUrl?: string;
  policeVerificationUrl?: string;
  society?: string;
  building?: string;
  block?: string;
  status?: 'active' | 'inactive' | 'terminated';
}

export interface UpdateEmployeePayload {
  id: string;
  firstName?: string;
  lastName?: string;
  countryCode?: string;
  mobileNumber?: string;
  email?: string;
  employeeType?: 'security' | 'gardener' | 'electrician' | 'cleaning' | 'admin' | 'other' | string;
  idProofUrl?: string;
  policeVerificationUrl?: string;
  society?: string;
  building?: string;
  block?: string;
  status?: 'active' | 'inactive' | 'terminated';
}

export interface DeleteEmployeePayload {
  id: string;
  hard?: boolean;
}

