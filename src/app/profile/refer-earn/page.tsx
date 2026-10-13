import ReferEarn from '@/components/pagesComponent/profile/ReferEarn'
import type { Metadata } from "next"
import { getMetadata } from "@/components/SEO/Meta"

export const metadata: Metadata = getMetadata({ pathName: "/profile/refer-earn" })
const Page = () => {
    return (
        <ReferEarn />
    )
}

export default Page