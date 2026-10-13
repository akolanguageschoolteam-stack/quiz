'use client';
import { createSelector, createSlice } from '@reduxjs/toolkit';
import { RootState } from '../store/index';

interface ThemeState {
    isDark: boolean;
}

const initialState: ThemeState = {
    isDark: false,
};

export const themeSlice = createSlice({
    name: 'theme',
    initialState,
    reducers: {
        setLightTheme: (state) => {
            state.isDark = false;
        },
        setDarkTheme: (state) => {
            state.isDark = true;
        },
        toggleTheme: (state) => {
            state.isDark = !state.isDark;
        },
    },
});

export const { setLightTheme, setDarkTheme, toggleTheme } = themeSlice.actions;

export default themeSlice.reducer;

const themeDataSelector = (state: RootState) => state.theme;

export const isDarkThemeSelector = createSelector(themeDataSelector, (state) => state.isDark);
