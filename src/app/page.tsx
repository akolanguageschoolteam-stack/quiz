import HomePage from '@/components/homePage/HomePage'
import type { Metadata } from "next"
import { getMetadata } from "@/components/SEO/Meta"

export const metadata: Metadata = getMetadata({ pathName: "/" })
const Page = () => {
    return (
        <HomePage />
    )
}

export default Page
