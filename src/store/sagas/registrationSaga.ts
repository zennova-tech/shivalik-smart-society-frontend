import { takeLatest, put, call, select } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import {
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
} from '../slices/registrationSlice';
import {
  getAvailableSocietiesApi,
  getSocietyBlocksApi,
  getBlockUnitsApi,
  registerUserApi,
} from '../../apis/userRegistration';

// Saga to fetch available societies
function* handleFetchSocieties(action: any) {
  try {
    const payload = action.payload || {};
    const response = yield call(getAvailableSocietiesApi, payload);
    // Transform response to match SocietyOption format
    const societies = response.data || response.items || response || [];
    yield put(fetchSocietiesSuccess(societies));
  } catch (error: any) {
    yield put(fetchSocietiesFailure(error.message || 'Failed to fetch societies'));
  }
}

// Saga to fetch blocks for a society
function* handleFetchBlocks(action: any) {
  try {
    const societyId = action.payload?.societyId || action.payload;
    const response = yield call(getSocietyBlocksApi, societyId);
    // Transform response to match BlockOption format
    const blocks = response.data || response.items || response || [];
    yield put(fetchBlocksSuccess(blocks));
  } catch (error: any) {
    yield put(fetchBlocksFailure(error.message || 'Failed to fetch blocks'));
  }
}

// Saga to fetch units for a block
function* handleFetchUnits(action: any) {
  try {
    const societyId = action.payload?.societyId;
    const blockId = action.payload?.blockId;
    const response = yield call(getBlockUnitsApi, societyId, blockId);
    // Transform response to match UnitOption format
    const units = response.data || response.items || response || [];
    yield put(fetchUnitsSuccess(units));
  } catch (error: any) {
    yield put(fetchUnitsFailure(error.message || 'Failed to fetch units'));
  }
}

// Saga to register user
function* handleRegisterUser() {
  try {
    // Get registration data from state
    const state: any = yield select();
    const registrationData = state.registration.registrationData;

    // Prepare payload
    const payload = {
      type: registrationData.type,
      societyId: registrationData.societyId,
      blockId: registrationData.blockId,
      unitId: registrationData.unitId,
      firstName: registrationData.firstName,
      lastName: registrationData.lastName || '',
      email: registrationData.email || '',
      countryCode: registrationData.countryCode,
      mobileNumber: registrationData.mobileNumber,
      gender: registrationData.gender || '',
      dateOfBirth: registrationData.dateOfBirth || '',
      occupation: registrationData.occupation || '',
      address: registrationData.address || '',
      aadharNumber: registrationData.aadharNumber || '',
      panNumber: registrationData.panNumber || '',
      profilePicture: registrationData.profilePicture,
      ownershipProof: registrationData.ownershipProof,
      familyMembers: registrationData.familyMembers || [],
    };

    const response = yield call(registerUserApi, payload);
    yield put(registerUserSuccess());
  } catch (error: any) {
    yield put(registerUserFailure(error.message || 'Registration failed'));
  }
}

function* registrationSaga() {
  yield takeLatest(fetchSocieties.type, handleFetchSocieties);
  yield takeLatest(fetchBlocks.type, handleFetchBlocks);
  yield takeLatest(fetchUnits.type, handleFetchUnits);
  yield takeLatest(registerUser.type, handleRegisterUser);
}

export default registrationSaga;

