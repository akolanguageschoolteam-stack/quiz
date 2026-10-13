'use client';
import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserProfileResponse } from '@/types/GlobalTypes';
import { RootState } from '../store/index';

interface UserState {
    token: string | null;
    profile: UserProfileResponse | null;
}

const initialState: UserState = {
    token: null,
    profile: null,
};

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        loginSuccess: (state, action: PayloadAction<string>) => {
            state.token = action.payload;
        },
        setProfile: (state, action: PayloadAction<UserProfileResponse>) => {
            state.profile = action.payload;
        },
        decrementCoins: (state, action: PayloadAction<number>) => {
            if (!state.profile) return;
            const currentCoins = typeof state.profile.total_coins === 'number' ? state.profile.total_coins : 0;
            state.profile = { ...state.profile, total_coins: currentCoins - action.payload };
        },
        setCoins: (state, action: PayloadAction<number>) => {
            if (!state.profile) return;
            state.profile = { ...state.profile, total_coins: action.payload };
        },
        logoutSuccess: (state) => {
            state.token = null;
            state.profile = null;
        },
    },
});

export const { loginSuccess, setProfile, decrementCoins, setCoins, logoutSuccess } = userSlice.actions;

export default userSlice.reducer;

const userDataSelector = (state: RootState) => state.user;

export const tokenSelector = createSelector(userDataSelector, (state) => state.token);
export const profileSelector = createSelector(userDataSelector, (state) => state.profile);
