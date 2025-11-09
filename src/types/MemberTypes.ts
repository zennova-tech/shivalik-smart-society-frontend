export interface FamilyMember {
  firstName: string;
  lastName?: string;
  relationship: string;
  age?: number;
  gender?: string;
  email?: string;
  mobileNumber?: string;
  countryCode?: string;
}

export interface OwnerDetails {
  firstName: string;
  lastName?: string;
  email: string;
  countryCode: string;
  mobileNumber: string;
  dateOfBirth?: string;
  gender?: string;
  occupation?: string;
  address?: string;
  aadharNumber?: string;
  panNumber?: string;
  unitId?: string;
  blockId?: string;
  buildingId?: string;
}

export interface VehicleDetails {
  vehicleNumber: string;
  vehicleType: string; // car, bike, scooter, etc.
  manufacturer?: string;
  model?: string;
  color?: string;
  registrationDate?: string;
  insuranceExpiryDate?: string;
  parkingSlotNumber?: string;
}

export interface Member {
  id?: string;
  // Owner details
  owner: OwnerDetails;
  // Family members
  familyMembers?: FamilyMember[];
  // Vehicles
  vehicles?: VehicleDetails[];
  // Additional fields
  society?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AddMemberPayload {
  owner: OwnerDetails;
  familyMembers?: FamilyMember[];
  vehicles?: VehicleDetails[];
  society?: string;
  [key: string]: any;
}

export interface UpdateMemberPayload {
  id: string;
  owner?: Partial<OwnerDetails>;
  familyMembers?: FamilyMember[];
  vehicles?: VehicleDetails[];
  [key: string]: any;
}

export interface GetMembersPayload {
  page?: number;
  limit?: number;
  search?: string;
  society?: string;
  unitId?: string;
  [key: string]: any;
}

export interface MemberResponse {
  data: Member[];
  total?: number;
  page?: number;
  limit?: number;
}

export interface DeleteMemberPayload {
  id: string;
}

