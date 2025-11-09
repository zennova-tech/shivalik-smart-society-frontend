export interface Bill {
  _id: string;
  society: string;
  unit?: {
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
  block?: {
    _id: string;
    name: string;
  };
  floor?: {
    _id: string;
    name: string;
    number: number;
  };
  title: string;
  description?: string;
  billDate: string;
  dueDate: string;
  forMonth?: number;
  year: number;
  amount: number;
  amountForOwner: number;
  amountForTenant: number;
  lateFee: number;
  status: "pending" | "paid" | "due" | "cancelled";
  isPublished: boolean;
  publishedAt?: string;
  paidDate?: string;
  paymentRef?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BillResponse {
  items: Bill[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateBillPayload {
  title: string;
  description?: string;
  billDate: string;
  dueDate: string;
  forMonth?: number;
  year: number;
  block?: string;
  floor?: string;
  units: string[];
  amount?: number;
  amountForOwner?: number;
  amountForTenant?: number;
  lateFee?: number;
  isPublished?: boolean;
}

export interface GetBillsParams {
  page?: number;
  limit?: number;
  status?: "pending" | "paid" | "due" | "cancelled";
  block?: string;
  floor?: string;
  unit?: string;
  search?: string;
  fromDate?: string;
  toDate?: string;
}

export interface UpdateBillPayload {
  id: string;
  title?: string;
  description?: string;
  billDate?: string;
  dueDate?: string;
  amount?: number;
  amountForOwner?: number;
  amountForTenant?: number;
  lateFee?: number;
  status?: "pending" | "paid" | "due" | "cancelled";
  paidDate?: string;
  paymentRef?: string;
}

