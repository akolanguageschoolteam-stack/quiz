import type { Metadata } from "next"
import QuizZone from "@/components/pagesComponent/playArea/quizPages/QuizZone"
import FunLearn from "@/components/pagesComponent/playArea/quizPages/funLearn/FunLearn"
import { getMetadata } from "@/components/SEO/Meta"
import { PLAY_AREA_SLUGS } from "@/lib/constants"


const SLUG_COMPONENT_MAP: Record<string, () => React.JSX.Element> = {
    "fun-and-learn": FunLearn,
    "true-or-false": QuizZone,
}

export const generateStaticParams = async () => {
    return PLAY_AREA_SLUGS.map((slug) => ({ slug }))
}

export const generateMetadata = async ({
    params,
}: {
    params: Promise<{ slug: string }>
}): Promise<Metadata> => {
    const { slug } = await params;
    return getMetadata({ pathName: `/play-area/${slug}` });
}

const Page = async ({ params }: { params: Promise<{ slug: string }> }) => {
    const { slug } = await params;
    const Component = SLUG_COMPONENT_MAP[slug] ?? QuizZone;
    return <Component />
}

export default Page