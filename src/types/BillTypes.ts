export interface Bill {
  _id: string;
  society: string;
  building?: string | {
    _id: string;
    buildingName?: string;
    name?: string;
  };
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
  block?: string | {
    _id: string;
    name: string;
  };
  floor?: string | {
    _id: string;
    name: string;
    number: number;
  };
  title: string;
  description?: string;
  billDate: string;
  dueDate: string;
  forMonth?: number;
  year?: number;
  amount: number;
  lateFee?: number;
  isForOwner?: boolean;
  status: "pending" | "paid" | "due" | "cancelled";
  isPublished?: boolean;
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
  building?: string;
  block?: string;
  floor?: string;
  units: string[];
  amount: number;
  lateFee?: number;
  isForOwner?: boolean;
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
  lateFee?: number;
  isForOwner?: boolean;
  status?: "pending" | "paid" | "due" | "cancelled";
  paidDate?: string;
  paymentRef?: string;
}

