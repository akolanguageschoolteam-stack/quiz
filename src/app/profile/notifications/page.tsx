import Notifications from '@/components/pagesComponent/profile/Notifications'
import type { Metadata } from "next"
import { getMetadata } from "@/components/SEO/Meta"

export const metadata: Metadata = getMetadata({ pathName: "/profile/notifications" })
const Page = () => {
    return (
        <Notifications />
    )
}

export default Page