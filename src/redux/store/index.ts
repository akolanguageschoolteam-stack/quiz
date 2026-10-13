"use client";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import themeReducer from "../reducers/themeSlice";
import userReducer from "../reducers/userSlice";
import quizReducer from "../reducers/quizSlice";
import settingsReducer from "../reducers/settingsSlice";
import languageReducer from "../reducers/languageSlice";
import preferencesReducer from "../reducers/preferencesSlice";

const persistConfig = {
  key: "e-stay",
  storage,
};

const rootReducer = combineReducers({
  theme: themeReducer,
  user: userReducer,
  quiz: quizReducer,
  settings: settingsReducer,
  language: languageReducer,
  preferences: preferencesReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

export const persistor = persistStore(store);

export type AppStore = typeof store;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
