'use client';
import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ContentTypeItem, LanguageItem } from '@/types/GlobalTypes';
import { RootState } from '../store/index';

interface LanguageState {
    languages: LanguageItem[];
    contentTypes: ContentTypeItem[];
    systemLanguageCode: string;
    quizLanguageSlug: string;
    translations: Record<string, string>;
    // Set right after a fresh signup completes (CompleteProfileModal) to ask for a system
    // language. CompleteProfileModal is nested inside AuthModal's Dialog, which unmounts
    // its whole subtree as soon as the signup flow closes it — a LanguageModal rendered
    // there would never get a chance to show. Layout.tsx (always mounted, outside the auth
    // modal tree) watches this flag and opens its own LanguageModal instance instead.
    promptSystemLanguage: boolean;
}

const initialState: LanguageState = {
    languages: [],
    contentTypes: [],
    systemLanguageCode: 'en',
    quizLanguageSlug: 'english-medium',
    translations: {},
    promptSystemLanguage: false,
};

export const languageSlice = createSlice({
    name: 'language',
    initialState,
    reducers: {
        setLanguages: (state, action: PayloadAction<LanguageItem[]>) => {
            state.languages = action.payload;
        },
        setContentTypes: (state, action: PayloadAction<ContentTypeItem[]>) => {
            state.contentTypes = action.payload;
        },
        setSystemLanguage: (state, action: PayloadAction<string>) => {
            state.systemLanguageCode = action.payload;
        },
        setQuizLanguage: (state, action: PayloadAction<string>) => {
            state.quizLanguageSlug = action.payload;
        },
        setTranslations: (state, action: PayloadAction<Record<string, string>>) => {
            state.translations = action.payload;
        },
        setPromptSystemLanguage: (state, action: PayloadAction<boolean>) => {
            state.promptSystemLanguage = action.payload;
        },
    },
});

export const { setLanguages, setContentTypes, setSystemLanguage, setQuizLanguage, setTranslations, setPromptSystemLanguage } = languageSlice.actions;

export default languageSlice.reducer;

const languageDataSelector = (state: RootState) => state.language;

export const languagesSelector = createSelector(languageDataSelector, (state) => state.languages ?? initialState.languages);
export const contentTypesSelector = createSelector(languageDataSelector, (state) => state.contentTypes ?? initialState.contentTypes);
export const systemLanguageCodeSelector = createSelector(languageDataSelector, (state) => state.systemLanguageCode ?? initialState.systemLanguageCode);
export const quizLanguageSlugSelector = createSelector(languageDataSelector, (state) => state.quizLanguageSlug ?? initialState.quizLanguageSlug);
export const currentTranslationsSelector = createSelector(languageDataSelector, (state) => state.translations ?? initialState.translations);
export const promptSystemLanguageSelector = createSelector(languageDataSelector, (state) => state.promptSystemLanguage ?? initialState.promptSystemLanguage);
