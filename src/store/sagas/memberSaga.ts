import { takeLatest, put, call } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import {
  getMembers,
  getMembersSuccess,
  getMembersFailure,
  getMemberById,
  getMemberByIdSuccess,
  getMemberByIdFailure,
  addMember,
  addMemberSuccess,
  addMemberFailure,
  updateMember,
  updateMemberSuccess,
  updateMemberFailure,
  deleteMember,
  deleteMemberSuccess,
  deleteMemberFailure,
} from '../slices/memberSlice';
import {
  getMembersApi,
  getMemberByIdApi,
  addMemberApi,
  updateMemberApi,
  deleteMemberApi,
} from '../../apis/member';
import {
  GetMembersPayload,
  AddMemberPayload,
  UpdateMemberPayload,
  DeleteMemberPayload,
} from '@/types/MemberTypes';

// Saga to handle get members
function* handleGetMembers(action: PayloadAction<GetMembersPayload | undefined>) {
  try {
    const response = yield call(getMembersApi, action.payload);
    yield put(getMembersSuccess(response));
  } catch (error: any) {
    yield put(getMembersFailure(error.message || 'Failed to fetch members'));
  }
}

// Saga to handle get member by ID
function* handleGetMemberById(action: PayloadAction<string>) {
  try {
    const member = yield call(getMemberByIdApi, action.payload);
    yield put(getMemberByIdSuccess(member));
  } catch (error: any) {
    yield put(getMemberByIdFailure(error.message || 'Failed to fetch member'));
  }
}

// Saga to handle add member
function* handleAddMember(action: PayloadAction<AddMemberPayload>) {
  try {
    const member = yield call(addMemberApi, action.payload);
    yield put(addMemberSuccess(member));
  } catch (error: any) {
    yield put(addMemberFailure(error.message || 'Failed to add member'));
  }
}

// Saga to handle update member
function* handleUpdateMember(action: PayloadAction<UpdateMemberPayload>) {
  try {
    const member = yield call(updateMemberApi, action.payload);
    yield put(updateMemberSuccess(member));
  } catch (error: any) {
    yield put(updateMemberFailure(error.message || 'Failed to update member'));
  }
}

// Saga to handle delete member
function* handleDeleteMember(action: PayloadAction<DeleteMemberPayload>) {
  try {
    yield call(deleteMemberApi, action.payload);
    yield put(deleteMemberSuccess(action.payload.id));
  } catch (error: any) {
    yield put(deleteMemberFailure(error.message || 'Failed to delete member'));
  }
}

function* memberSaga() {
  // Listen for member actions and call the respective saga handlers
  yield takeLatest(getMembers.type, handleGetMembers);
  yield takeLatest(getMemberById.type, handleGetMemberById);
  yield takeLatest(addMember.type, handleAddMember);
  yield takeLatest(updateMember.type, handleUpdateMember);
  yield takeLatest(deleteMember.type, handleDeleteMember);
}

export default memberSaga;

