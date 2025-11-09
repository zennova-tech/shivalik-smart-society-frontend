import { createSlice } from '@reduxjs/toolkit';
import {
  Member,
  GetMembersPayload,
  AddMemberPayload,
  UpdateMemberPayload,
  DeleteMemberPayload,
} from '@/types/MemberTypes';

interface MemberState {
  members: Member[];
  selectedMember: Member | null;
  error: string | null;
  status: 'idle' | 'loading' | 'complete' | 'failed';
  total?: number;
  page?: number;
  limit?: number;
}

const initialState: MemberState = {
  members: [],
  selectedMember: null,
  error: null,
  status: 'idle',
  total: 0,
  page: 1,
  limit: 10,
};

const memberSlice = createSlice({
  name: 'member',
  initialState,
  reducers: {
    // Get Members Actions
    getMembers(state, action: { payload?: GetMembersPayload }) {
      state.status = 'loading';
      state.error = null;
    },
    getMembersSuccess(
      state,
      action: { payload: { data: Member[]; total?: number; page?: number; limit?: number } }
    ) {
      state.members = action.payload.data;
      state.total = action.payload.total;
      state.page = action.payload.page;
      state.limit = action.payload.limit;
      state.error = null;
      state.status = 'complete';
    },
    getMembersFailure(state, action: { payload: string }) {
      state.members = [];
      state.error = action.payload;
      state.status = 'failed';
    },
    resetGetMembers(state) {
      state.status = 'idle';
      state.error = null;
    },

    // Get Member By ID Actions
    getMemberById(state, action: { payload: string }) {
      state.status = 'loading';
      state.error = null;
    },
    getMemberByIdSuccess(state, action: { payload: Member }) {
      state.selectedMember = action.payload;
      state.error = null;
      state.status = 'complete';
    },
    getMemberByIdFailure(state, action: { payload: string }) {
      state.selectedMember = null;
      state.error = action.payload;
      state.status = 'failed';
    },
    resetGetMemberById(state) {
      state.selectedMember = null;
      state.status = 'idle';
      state.error = null;
    },

    // Add Member Actions
    addMember(state, action: { payload: AddMemberPayload }) {
      state.status = 'loading';
      state.error = null;
    },
    addMemberSuccess(state, action: { payload: Member }) {
      state.members = [action.payload, ...state.members];
      state.error = null;
      state.status = 'complete';
    },
    addMemberFailure(state, action: { payload: string }) {
      state.error = action.payload;
      state.status = 'failed';
    },
    resetAddMember(state) {
      state.status = 'idle';
      state.error = null;
    },

    // Update Member Actions
    updateMember(state, action: { payload: UpdateMemberPayload }) {
      state.status = 'loading';
      state.error = null;
    },
    updateMemberSuccess(state, action: { payload: Member }) {
      const index = state.members.findIndex((member) => member.id === action.payload.id);
      if (index !== -1) {
        state.members[index] = action.payload;
      }
      if (state.selectedMember?.id === action.payload.id) {
        state.selectedMember = action.payload;
      }
      state.error = null;
      state.status = 'complete';
    },
    updateMemberFailure(state, action: { payload: string }) {
      state.error = action.payload;
      state.status = 'failed';
    },
    resetUpdateMember(state) {
      state.status = 'idle';
      state.error = null;
    },

    // Delete Member Actions
    deleteMember(state, action: { payload: DeleteMemberPayload }) {
      state.status = 'loading';
      state.error = null;
    },
    deleteMemberSuccess(state, action: { payload: string }) {
      state.members = state.members.filter((member) => member.id !== action.payload);
      if (state.selectedMember?.id === action.payload) {
        state.selectedMember = null;
      }
      state.error = null;
      state.status = 'complete';
    },
    deleteMemberFailure(state, action: { payload: string }) {
      state.error = action.payload;
      state.status = 'failed';
    },
    resetDeleteMember(state) {
      state.status = 'idle';
      state.error = null;
    },

    // Reset all state
    resetMemberState(state) {
      state.members = [];
      state.selectedMember = null;
      state.error = null;
      state.status = 'idle';
      state.total = 0;
      state.page = 1;
      state.limit = 10;
    },
  },
});

export const {
  getMembers,
  getMembersSuccess,
  getMembersFailure,
  resetGetMembers,
  getMemberById,
  getMemberByIdSuccess,
  getMemberByIdFailure,
  resetGetMemberById,
  addMember,
  addMemberSuccess,
  addMemberFailure,
  resetAddMember,
  updateMember,
  updateMemberSuccess,
  updateMemberFailure,
  resetUpdateMember,
  deleteMember,
  deleteMemberSuccess,
  deleteMemberFailure,
  resetDeleteMember,
  resetMemberState,
} = memberSlice.actions;

export default memberSlice.reducer;

