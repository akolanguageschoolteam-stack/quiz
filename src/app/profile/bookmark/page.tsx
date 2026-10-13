import Bookmark from '@/components/pagesComponent/profile/Bookmark'
import type { Metadata } from "next"
import { getMetadata } from "@/components/SEO/Meta"

export const metadata: Metadata = getMetadata({ pathName: "/profile/bookmark" })
const Page = () => {
    return (
        <Bookmark />
    )
}

export default Page