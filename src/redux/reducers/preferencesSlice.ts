'use client';
import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store/index';

interface PreferencesState {
    soundEffectsEnabled: boolean;
}

const initialState: PreferencesState = {
    soundEffectsEnabled: true,
};

export const preferencesSlice = createSlice({
    name: 'preferences',
    initialState,
    reducers: {
        setSoundEffectsEnabled: (state, action: PayloadAction<boolean>) => {
            state.soundEffectsEnabled = action.payload;
        },
    },
});

export const { setSoundEffectsEnabled } = preferencesSlice.actions;

export default preferencesSlice.reducer;

const preferencesDataSelector = (state: RootState) => state.preferences;

export const soundEffectsEnabledSelector = createSelector(preferencesDataSelector, (state) => state.soundEffectsEnabled);
