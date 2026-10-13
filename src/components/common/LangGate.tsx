'use client';
import { useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { setSystemLanguage, systemLanguageCodeSelector } from '@/redux/reducers/languageSlice';

const LangGate = () => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const dispatch = useDispatch();
    const systemLanguageCode = useSelector(systemLanguageCodeSelector);

    useEffect(() => {
        const urlLang = searchParams.get('lang');

        if (urlLang) {
            if (urlLang !== systemLanguageCode) dispatch(setSystemLanguage(urlLang));
            return;
        }

        const fallback = systemLanguageCode || navigator.language?.split('-')[0] || 'en';
        const params = new URLSearchParams(searchParams.toString());
        params.set('lang', fallback);
        router.replace(`${pathname}?${params.toString()}`);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname, searchParams]);

    return null;
};

export default LangGate;
