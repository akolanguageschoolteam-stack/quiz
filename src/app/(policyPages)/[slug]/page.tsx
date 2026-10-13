import type { Metadata } from "next"
import { notFound } from "next/navigation"
import PolicyPage from "@/components/pagesComponent/PolicyPages/PolicyPage"
import { getMetadata } from "@/components/SEO/Meta"

const SLUG_MAP: Record<string, string> = {
    "about-us": "about_us",
    "contact-us": "contact_us",
    "how-to-play": "how_to_play",
    "privacy-policy": "privacy_policy",
    "terms-conditions": "terms_conditions",
}

interface PageApiResponse {
    success: boolean
    code: number
    message: string | string[]
    data: {
        title: string
        slug: string
        page_content: string | null
    }
}

const getPageData = async (apiSlug: string) => {
    const BASE_URL = process.env.NEXT_PUBLIC_API_URL
    const ENDPOINT = process.env.NEXT_PUBLIC_END_POINT

    const res = await fetch(`${BASE_URL}/${ENDPOINT}/pages/${apiSlug}`, {
        next: { revalidate: 3600 },
    })

    if (!res.ok) {
        return null
    }

    const json: PageApiResponse = await res.json()

    if (!json.success) {
        return null
    }

    return json.data
}

export const generateStaticParams = async () => {
    return Object.keys(SLUG_MAP).map((slug) => ({ slug }))
}

export const generateMetadata = async ({
    params,
}: {
    params: Promise<{ slug: string }>
}): Promise<Metadata> => {
    const { slug } = await params;
    const data = await getPageData(SLUG_MAP[slug]);

    return getMetadata({
        title: data?.title,
        pathName: `/${slug}`,
    });
}

const Page = async ({ params }: { params: Promise<{ slug: string }> }) => {
    const { slug } = await params;

    const apiSlug = SLUG_MAP[slug];

    if (!apiSlug) {
        notFound();
    }

    return (
        <PolicyPage apiSlug={apiSlug} />
    )
}

export default Page