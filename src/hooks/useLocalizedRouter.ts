'use client';
import { useRouter } from 'next/navigation';
import { useLangCode } from './useLangCode';
import { withLang } from '@/lib/localizedUrl';

export const useLocalizedRouter = () => {
    const router = useRouter();
    const lang = useLangCode();

    return {
        ...router,
        push: (href: string, options?: Parameters<typeof router.push>[1]) => router.push(withLang(href, lang), options),
        replace: (href: string, options?: Parameters<typeof router.replace>[1]) => router.replace(withLang(href, lang), options),
    };
};
