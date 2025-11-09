import { takeLatest, put, call } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import {
    getSocieties,
    getSocietiesSuccess,
    getSocietiesFailure,
    getSocietyById,
    getSocietyByIdSuccess,
    getSocietyByIdFailure,
    addSociety,
    addSocietySuccess,
    addSocietyFailure,
    updateSociety,
    updateSocietySuccess,
    updateSocietyFailure,
    deleteSociety,
    deleteSocietySuccess,
    deleteSocietyFailure,
} from '../slices/societySlice';
import {
    getSocietiesApi,
    getSocietyByIdApi,
    addSocietyApi,
    updateSocietyApi,
    deleteSocietyApi,
} from '../../apis/society';
import { GetSocietiesPayload, AddSocietyPayload, UpdateSocietyPayload, DeleteSocietyPayload } from '@/types/SocietyTypes';

// Saga to handle get societies
function* handleGetSocieties(action: PayloadAction<GetSocietiesPayload | undefined>) {
    try {
        const response = yield call(getSocietiesApi, action.payload);
        yield put(getSocietiesSuccess(response));
    } catch (error: any) {
        yield put(getSocietiesFailure(error.message || 'Failed to fetch societies'));
    }
}

// Saga to handle get society by ID
function* handleGetSocietyById(action: PayloadAction<string>) {
    try {
        const society = yield call(getSocietyByIdApi, action.payload);
        yield put(getSocietyByIdSuccess(society));
    } catch (error: any) {
        yield put(getSocietyByIdFailure(error.message || 'Failed to fetch society'));
    }
}

// Saga to handle add society
function* handleAddSociety(action: PayloadAction<AddSocietyPayload>) {
    try {
        const society = yield call(addSocietyApi, action.payload);
        yield put(addSocietySuccess(society));
    } catch (error: any) {
        yield put(addSocietyFailure(error.message || 'Failed to add society'));
    }
}

// Saga to handle update society
function* handleUpdateSociety(action: PayloadAction<UpdateSocietyPayload>) {
    try {
        const society = yield call(updateSocietyApi, action.payload);
        yield put(updateSocietySuccess(society));
    } catch (error: any) {
        yield put(updateSocietyFailure(error.message || 'Failed to update society'));
    }
}

// Saga to handle delete society
function* handleDeleteSociety(action: PayloadAction<DeleteSocietyPayload>) {
    try {
        yield call(deleteSocietyApi, action.payload);
        yield put(deleteSocietySuccess(action.payload.id));
    } catch (error: any) {
        yield put(deleteSocietyFailure(error.message || 'Failed to delete society'));
    }
}

function* societySaga() {
    // Listen for society actions and call the respective saga handlers
    yield takeLatest(getSocieties.type, handleGetSocieties);
    yield takeLatest(getSocietyById.type, handleGetSocietyById);
    yield takeLatest(addSociety.type, handleAddSociety);
    yield takeLatest(updateSociety.type, handleUpdateSociety);
    yield takeLatest(deleteSociety.type, handleDeleteSociety);
}

export default societySaga;

