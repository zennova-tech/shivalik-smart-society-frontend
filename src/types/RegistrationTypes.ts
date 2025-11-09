import { FamilyMember } from './MemberTypes';

export type RegistrationType = 'Owner' | 'Tenant';

export interface RegistrationState {
  type: RegistrationType | null;
  societyId: string | null;
  societyName: string | null;
  blockId: string | null;
  blockName: string | null;
  unitId: string | null;
  unitNumber: string | null;
  // Form data
  firstName: string;
  lastName: string;
  email: string;
  countryCode: string;
  mobileNumber: string;
  gender: string;
  dateOfBirth: string;
  occupation: string;
  address: string;
  aadharNumber: string;
  panNumber: string;
  profilePicture: File | null;
  ownershipProof: File | null;
  familyMembers: FamilyMember[];
}

export interface SocietyOption {
  _id: string;
  name: string;
  location: string;
  membersCount?: number;
  blocksCount?: number;
}

export interface BlockOption {
  _id: string;
  name: string;
  building?: string;
  status?: string;
}

export interface UnitOption {
  _id: string;
  unitNumber: string;
  floor?: {
    _id: string;
    name: string;
    number: number;
  };
  status: 'available' | 'occupied';
  unitType?: string;
  areaSqFt?: number;
}

export interface FloorGroup {
  floorId: string;
  floorName: string;
  floorNumber: number;
  units: UnitOption[];
}

