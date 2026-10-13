import { Suspense } from "react"
import type { Metadata } from "next"
import PlayScreen from '@/components/storybook/organisms/playSreen'
import FunLearnPlay from '@/components/pagesComponent/playArea/quizPages/funLearn/FunLearnPlay'
import { SLUG_MODULE_TYPE_MAP, QuizType, PLAY_AREA_SLUGS } from '@/lib/constants'
import { getMetadata } from "@/components/SEO/Meta"

export const generateStaticParams = async () => {
    return PLAY_AREA_SLUGS.map((slug) => ({ slug }))
}

export const generateMetadata = async ({
    params,
}: {
    params: Promise<{ slug: string }>
}): Promise<Metadata> => {
    const { slug } = await params;
    return getMetadata({ pathName: `/play-area/${slug}/play` });
}

const Page = async ({ params }: { params: Promise<{ slug: string }> }) => {
    const { slug } = await params;

    if (slug === 'fun-and-learn') {
        return (
            <Suspense fallback={null}>
                <FunLearnPlay />
            </Suspense>
        )
    }

    return (
        <Suspense fallback={null}>
            <PlayScreen />
        </Suspense>
    )
}

export default Page
