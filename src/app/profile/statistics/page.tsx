import Staticstics from "@/components/pagesComponent/profile/Staticstics"
import type { Metadata } from "next"
import { getMetadata } from "@/components/SEO/Meta"

export const metadata: Metadata = getMetadata({ pathName: "/profile/statistics" })

const Page = () => {
    return (
        <Staticstics />
    )
}

export default Page