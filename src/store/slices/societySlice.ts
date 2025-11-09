import { createSlice } from '@reduxjs/toolkit';
import { Society, GetSocietiesPayload, AddSocietyPayload, UpdateSocietyPayload, DeleteSocietyPayload } from '@/types/SocietyTypes';

interface SocietyState {
    societies: Society[];
    selectedSociety: Society | null;
    error: string | null;
    status: 'idle' | 'loading' | 'complete' | 'failed';
    total?: number;
    page?: number;
    limit?: number;
}

const initialState: SocietyState = {
    societies: [],
    selectedSociety: null,
    error: null,
    status: 'idle',
    total: 0,
    page: 1,
    limit: 10,
};

const societySlice = createSlice({
    name: 'society',
    initialState,
    reducers: {
        // Get Societies Actions
        getSocieties(state, action: { payload?: GetSocietiesPayload }) {
            state.status = 'loading';
            state.error = null;
        },
        getSocietiesSuccess(state, action: { payload: { data: Society[]; total?: number; page?: number; limit?: number } }) {
            state.societies = action.payload.data;
            state.total = action.payload.total;
            state.page = action.payload.page;
            state.limit = action.payload.limit;
            state.error = null;
            state.status = 'complete';
        },
        getSocietiesFailure(state, action: { payload: string }) {
            state.societies = [];
            state.error = action.payload;
            state.status = 'failed';
        },
        resetGetSocieties(state) {
            state.status = 'idle';
            state.error = null;
        },

        // Get Society By ID Actions
        getSocietyById(state, action: { payload: string }) {
            state.status = 'loading';
            state.error = null;
        },
        getSocietyByIdSuccess(state, action: { payload: Society }) {
            state.selectedSociety = action.payload;
            state.error = null;
            state.status = 'complete';
        },
        getSocietyByIdFailure(state, action: { payload: string }) {
            state.selectedSociety = null;
            state.error = action.payload;
            state.status = 'failed';
        },
        resetGetSocietyById(state) {
            state.selectedSociety = null;
            state.status = 'idle';
            state.error = null;
        },

        // Add Society Actions
        addSociety(state, action: { payload: AddSocietyPayload }) {
            state.status = 'loading';
            state.error = null;
        },
        addSocietySuccess(state, action: { payload: Society }) {
            state.societies = [action.payload, ...state.societies];
            state.error = null;
            state.status = 'complete';
        },
        addSocietyFailure(state, action: { payload: string }) {
            state.error = action.payload;
            state.status = 'failed';
        },
        resetAddSociety(state) {
            state.status = 'idle';
            state.error = null;
        },

        // Update Society Actions
        updateSociety(state, action: { payload: UpdateSocietyPayload }) {
            state.status = 'loading';
            state.error = null;
        },
        updateSocietySuccess(state, action: { payload: Society }) {
            const index = state.societies.findIndex((society) => society.id === action.payload.id);
            if (index !== -1) {
                state.societies[index] = action.payload;
            }
            if (state.selectedSociety?.id === action.payload.id) {
                state.selectedSociety = action.payload;
            }
            state.error = null;
            state.status = 'complete';
        },
        updateSocietyFailure(state, action: { payload: string }) {
            state.error = action.payload;
            state.status = 'failed';
        },
        resetUpdateSociety(state) {
            state.status = 'idle';
            state.error = null;
        },

        // Delete Society Actions
        deleteSociety(state, action: { payload: DeleteSocietyPayload }) {
            state.status = 'loading';
            state.error = null;
        },
        deleteSocietySuccess(state, action: { payload: string }) {
            state.societies = state.societies.filter((society) => society.id !== action.payload);
            if (state.selectedSociety?.id === action.payload) {
                state.selectedSociety = null;
            }
            state.error = null;
            state.status = 'complete';
        },
        deleteSocietyFailure(state, action: { payload: string }) {
            state.error = action.payload;
            state.status = 'failed';
        },
        resetDeleteSociety(state) {
            state.status = 'idle';
            state.error = null;
        },

        // Reset all state
        resetSocietyState(state) {
            state.societies = [];
            state.selectedSociety = null;
            state.error = null;
            state.status = 'idle';
            state.total = 0;
            state.page = 1;
            state.limit = 10;
        },
    },
});

export const {
    getSocieties,
    getSocietiesSuccess,
    getSocietiesFailure,
    resetGetSocieties,
    getSocietyById,
    getSocietyByIdSuccess,
    getSocietyByIdFailure,
    resetGetSocietyById,
    addSociety,
    addSocietySuccess,
    addSocietyFailure,
    resetAddSociety,
    updateSociety,
    updateSocietySuccess,
    updateSocietyFailure,
    resetUpdateSociety,
    deleteSociety,
    deleteSocietySuccess,
    deleteSocietyFailure,
    resetDeleteSociety,
    resetSocietyState,
} = societySlice.actions;

export default societySlice.reducer;

