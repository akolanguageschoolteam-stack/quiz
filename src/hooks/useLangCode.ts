'use client';
import { useSelector } from 'react-redux';
import { systemLanguageCodeSelector } from '@/redux/reducers/languageSlice';

export const useLangCode = (): string => useSelector(systemLanguageCodeSelector);
