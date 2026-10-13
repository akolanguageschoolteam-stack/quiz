import Settings from '@/components/pagesComponent/profile/Settings'
import type { Metadata } from "next"
import { getMetadata } from "@/components/SEO/Meta"

export const metadata: Metadata = getMetadata({ pathName: "/profile/settings" })
const Page = () => {
    return (
        <Settings />
    )
}

export default Page