import Profile from '@/components/pagesComponent/profile/Profile'
import type { Metadata } from "next"
import { getMetadata } from "@/components/SEO/Meta"

export const metadata: Metadata = getMetadata({ pathName: "/profile" })
const Page = () => {
    return (
        <Profile />
    )
}

export default Page