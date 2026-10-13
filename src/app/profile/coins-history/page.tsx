import CoinHistory from '@/components/pagesComponent/profile/CoinHistory'
import type { Metadata } from "next"
import { getMetadata } from "@/components/SEO/Meta"

export const metadata: Metadata = getMetadata({ pathName: "/profile/coins-history" })
const Page = () => {
    return (
        <CoinHistory />
    )
}

export default Page