export interface UtilityBill {
  _id: string;
  society: string;
  unit: {
    _id: string;
    unitNumber: string;
    unitType?: string;
  };
  user?: {
    _id: string;
    firstName: string;
    lastName?: string;
    email?: string;
  };
  customerId: string;
  utilityType: "electricity" | "water" | "gas" | "internet" | "other";
  billPeriod: {
    month: number;
    year: number;
  };
  billNumber?: string;
  billDate?: string;
  dueDate?: string;
  amount: number;
  consumption?: {
    units?: number;
    previousReading?: number;
    currentReading?: number;
    readingDate?: string;
  };
  status: "pending" | "paid" | "overdue" | "cancelled";
  paidDate?: string;
  paymentRef?: string;
  dataSource: {
    provider?: string;
    lastFetchedAt?: string;
    fetchStatus: "success" | "failed" | "pending";
    fetchError?: string;
  };
  rawData?: any;
  createdAt?: string;
  updatedAt?: string;
}

export interface UnitCustomerMapping {
  _id: string;
  society: string;
  unit: {
    _id: string;
    unitNumber: string;
    unitType?: string;
  };
  customerIds: {
    electricity?: string;
    water?: string;
    gas?: string;
    internet?: string;
    other?: string;
  };
  provider?: {
    electricity?: string;
    water?: string;
    gas?: string;
    internet?: string;
  };
  autoFetchEnabled: {
    electricity: boolean;
    water: boolean;
    gas: boolean;
    internet: boolean;
  };
  lastFetchedAt?: {
    electricity?: string;
    water?: string;
    gas?: string;
    internet?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface UtilityBillResponse {
  items: UtilityBill[];
  total: number;
  page: number;
  limit: number;
}

export interface CustomerMappingResponse {
  items: UnitCustomerMapping[];
  total: number;
  page: number;
  limit: number;
}

export interface GetUtilityBillsParams {
  page?: number;
  limit?: number;
  utilityType?: "electricity" | "water" | "gas" | "internet" | "other";
  status?: "pending" | "paid" | "overdue" | "cancelled";
  month?: number;
  year?: number;
  unitId?: string;
}

export interface GetCustomerMappingsParams {
  page?: number;
  limit?: number;
  unitId?: string;
}

export interface FetchUtilityBillsPayload {
  month: number;
  year: number;
  utilityType?: "electricity" | "water" | "gas";
}

export interface UpdateUtilityBillPayload {
  id: string;
  status?: "pending" | "paid" | "overdue" | "cancelled";
  paidDate?: string;
  paymentRef?: string;
}

export interface UpdateCustomerMappingPayload {
  id: string;
  customerIds?: {
    electricity?: string;
    water?: string;
    gas?: string;
    internet?: string;
    other?: string;
  };
  autoFetchEnabled?: {
    electricity?: boolean;
    water?: boolean;
    gas?: boolean;
    internet?: boolean;
  };
  provider?: {
    electricity?: string;
    water?: string;
    gas?: string;
    internet?: string;
  };
}

export interface UploadCustomerIdsResponse {
  success: Array<{
    row: number;
    unitNumber: string;
    unitId: string;
    customerIds: {
      electricity?: string;
      water?: string;
      gas?: string;
      internet?: string;
    };
  }>;
  errors: Array<{
    row: number;
    unitNumber?: string;
    error: string;
  }>;
  total: number;
}

export interface FetchBillsResponse {
  fetched: number;
  errors: number;
  bills: UtilityBill[];
  errorsList: Array<{
    unit: string;
    customerId: string;
    error: string;
  }>;
}

