import Rewards from '@/components/pagesComponent/profile/Rewards'
import type { Metadata } from "next"
import { getMetadata } from "@/components/SEO/Meta"

export const metadata: Metadata = getMetadata({ pathName: "/profile/rewards" })
const Page = () => {
    return (
        <Rewards />
    )
}

export default Page