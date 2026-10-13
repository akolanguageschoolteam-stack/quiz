import OneVsOne from '@/components/pagesComponent/playArea/oneVsOne/OneVsOne'
import type { Metadata } from "next"
import { getMetadata } from "@/components/SEO/Meta"

export const metadata: Metadata = getMetadata({ pathName: "/play-area/1-vs-1-battle" })
const Page = () => {
    return (
        <OneVsOne />
    )
}

export default Page