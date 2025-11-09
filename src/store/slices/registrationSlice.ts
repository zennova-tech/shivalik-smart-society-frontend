import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RegistrationState, RegistrationType, SocietyOption, BlockOption, UnitOption } from '@/types/RegistrationTypes';
import { FamilyMember } from '@/types/MemberTypes';

const initialState = {
  // Registration flow state
  registrationData: {
    type: null as RegistrationType | null,
    societyId: null as string | null,
    societyName: null as string | null,
    blockId: null as string | null,
    blockName: null as string | null,
    unitId: null as string | null,
    unitNumber: null as string | null,
    firstName: '',
    lastName: '',
    email: '',
    countryCode: '+91',
    mobileNumber: '',
    gender: '',
    dateOfBirth: '',
    occupation: '',
    address: '',
    aadharNumber: '',
    panNumber: '',
    profilePicture: null as File | null,
    ownershipProof: null as File | null,
    familyMembers: [] as FamilyMember[],
  },
  // API data
  societies: [] as SocietyOption[],
  blocks: [] as BlockOption[],
  units: [] as UnitOption[],
  // UI state
  status: 'idle' as 'idle' | 'loading' | 'success' | 'failed',
  error: null as string | null,
};

const registrationSlice = createSlice({
  name: 'registration',
  initialState,
  reducers: {
    // Set registration type (Owner/Tenant)
    setRegistrationType(state, action: PayloadAction<RegistrationType>) {
      state.registrationData.type = action.payload;
    },
    // Set selected society
    setSelectedSociety(state, action: PayloadAction<{ id: string; name: string }>) {
      state.registrationData.societyId = action.payload.id;
      state.registrationData.societyName = action.payload.name;
      // Clear block and unit when society changes
      state.registrationData.blockId = null;
      state.registrationData.blockName = null;
      state.registrationData.unitId = null;
      state.registrationData.unitNumber = null;
      state.blocks = [];
      state.units = [];
    },
    // Set selected block
    setSelectedBlock(state, action: PayloadAction<{ id: string; name: string }>) {
      state.registrationData.blockId = action.payload.id;
      state.registrationData.blockName = action.payload.name;
      // Clear unit when block changes
      state.registrationData.unitId = null;
      state.registrationData.unitNumber = null;
      state.units = [];
    },
    // Set selected unit
    setSelectedUnit(state, action: PayloadAction<{ id: string; number: string }>) {
      state.registrationData.unitId = action.payload.id;
      state.registrationData.unitNumber = action.payload.number;
    },
    // Update form data
    updateRegistrationFormData(state, action: PayloadAction<Partial<RegistrationState>>) {
      state.registrationData = { ...state.registrationData, ...action.payload };
    },
    // Reset registration data
    resetRegistrationData(state) {
      state.registrationData = initialState.registrationData;
      state.societies = [];
      state.blocks = [];
      state.units = [];
      state.status = 'idle';
      state.error = null;
    },
    // Fetch societies
    fetchSocieties(state) {
      state.status = 'loading';
    },
    fetchSocietiesSuccess(state, action: PayloadAction<SocietyOption[]>) {
      state.societies = action.payload;
      state.status = 'idle';
    },
    fetchSocietiesFailure(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.status = 'failed';
    },
    // Fetch blocks
    fetchBlocks(state, action: PayloadAction<{ societyId: string }>) {
      state.status = 'loading';
    },
    fetchBlocksSuccess(state, action: PayloadAction<BlockOption[]>) {
      state.blocks = action.payload;
      state.status = 'idle';
    },
    fetchBlocksFailure(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.status = 'failed';
    },
    // Fetch units
    fetchUnits(state, action: PayloadAction<{ societyId: string; blockId: string }>) {
      state.status = 'loading';
    },
    fetchUnitsSuccess(state, action: PayloadAction<UnitOption[]>) {
      state.units = action.payload;
      state.status = 'idle';
    },
    fetchUnitsFailure(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.status = 'failed';
    },
    // Register user
    registerUser(state) {
      state.status = 'loading';
      state.error = null;
    },
    registerUserSuccess(state) {
      state.status = 'success';
      state.error = null;
    },
    registerUserFailure(state, action: PayloadAction<string>) {
      state.status = 'failed';
      state.error = action.payload;
    },
    resetRegistrationStatus(state) {
      state.status = 'idle';
      state.error = null;
    },
    // Add family member
    addFamilyMember(state, action: PayloadAction<FamilyMember>) {
      state.registrationData.familyMembers = [
        ...state.registrationData.familyMembers,
        action.payload,
      ];
    },
    // Remove family member
    removeFamilyMember(state, action: PayloadAction<number>) {
      state.registrationData.familyMembers = state.registrationData.familyMembers.filter(
        (_, index) => index !== action.payload
      );
    },
    // Update family member
    updateFamilyMember(state, action: PayloadAction<{ index: number; member: FamilyMember }>) {
      const { index, member } = action.payload;
      if (state.registrationData.familyMembers[index]) {
        state.registrationData.familyMembers[index] = member;
      }
    },
  },
});

export const {
  setRegistrationType,
  setSelectedSociety,
  setSelectedBlock,
  setSelectedUnit,
  updateRegistrationFormData,
  resetRegistrationData,
  fetchSocieties,
  fetchSocietiesSuccess,
  fetchSocietiesFailure,
  fetchBlocks,
  fetchBlocksSuccess,
  fetchBlocksFailure,
  fetchUnits,
  fetchUnitsSuccess,
  fetchUnitsFailure,
  registerUser,
  registerUserSuccess,
  registerUserFailure,
  resetRegistrationStatus,
  addFamilyMember,
  removeFamilyMember,
  updateFamilyMember,
} = registrationSlice.actions;

export default registrationSlice.reducer;

