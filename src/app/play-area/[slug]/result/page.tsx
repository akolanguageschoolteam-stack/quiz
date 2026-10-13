import type { Metadata } from "next"
import ResultScreen from "@/components/storybook/organisms/resultScreen"
import { getMetadata } from "@/components/SEO/Meta"
import { PLAY_AREA_SLUGS } from "@/lib/constants"

export const generateStaticParams = async () => {
    return PLAY_AREA_SLUGS.map((slug) => ({ slug }))
}

export const generateMetadata = async ({
    params,
}: {
    params: Promise<{ slug: string }>
}): Promise<Metadata> => {
    const { slug } = await params;
    return getMetadata({ pathName: `/play-area/${slug}/result` });
}

const Page = () => {
    return (
        <ResultScreen />
    )
}

export default Page
