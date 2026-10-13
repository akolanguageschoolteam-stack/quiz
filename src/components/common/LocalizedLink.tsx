'use client';
import Link from 'next/link';
import { ComponentProps } from 'react';
import { useLangCode } from '@/hooks/useLangCode';
import { withLang } from '@/lib/localizedUrl';

type LocalizedLinkProps = Omit<ComponentProps<typeof Link>, 'href'> & { href: string };

const LocalizedLink = ({ href, ...rest }: LocalizedLinkProps) => {
    const lang = useLangCode();
    return <Link href={withLang(href, lang)} {...rest} />;
};

export default LocalizedLink;
