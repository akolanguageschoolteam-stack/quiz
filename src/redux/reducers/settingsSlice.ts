'use client';
import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { WebSettingsResponse } from '@/types/GlobalTypes';
import { RootState } from '../store/index';

interface SettingsState {
    webSettings: WebSettingsResponse | null;
}

const initialState: SettingsState = {
    webSettings: null,
};

export const settingsSlice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        setWebSettings: (state, action: PayloadAction<WebSettingsResponse>) => {
            state.webSettings = action.payload;
        },
    },
});

export const { setWebSettings } = settingsSlice.actions;

export default settingsSlice.reducer;

const settingsDataSelector = (state: RootState) => state.settings;

export const webSettingsSelector = createSelector(settingsDataSelector, (state) => state.webSettings);
