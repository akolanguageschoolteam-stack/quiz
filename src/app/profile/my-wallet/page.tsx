import MyWallet from '@/components/pagesComponent/profile/MyWallet'
import type { Metadata } from "next"
import { getMetadata } from "@/components/SEO/Meta"

export const metadata: Metadata = getMetadata({ pathName: "/profile/my-wallet" })
const Page = () => {
    return (
        <MyWallet />
    )
}

export default Page