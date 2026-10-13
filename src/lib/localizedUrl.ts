export const withLang = (path: string, lang: string): string => {
    const [base, query = ''] = path.split('?');
    const params = new URLSearchParams(query);
    params.set('lang', lang);
    return `${base}?${params.toString()}`;
};
