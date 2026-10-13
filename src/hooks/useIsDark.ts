'use client';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { isDarkThemeSelector } from '@/redux/reducers/themeSlice';

export const useIsDark = (): boolean => {
    const isDark = useSelector(isDarkThemeSelector);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return mounted ? isDark : false;
};
