'use client'

import PolicyPage from "@/components/pagesComponent/PolicyPages/PolicyPage";
import { useTranslation } from "@/hooks/useTranslation"

const Page = () => {

    const { t } = useTranslation();

    return (
        <PolicyPage apiSlug="how_to_play" title={t('instruction')} desc={t('instructionDesc')} />
    )
}

export default Page