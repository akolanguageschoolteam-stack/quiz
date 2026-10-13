import MyBadges from '@/components/pagesComponent/profile/MyBadges'
import type { Metadata } from "next"
import { getMetadata } from "@/components/SEO/Meta"

export const metadata: Metadata = getMetadata({ pathName: "/profile/my-badges" })
const Page = () => {
    return (
        <MyBadges />
    )
}

export default Page