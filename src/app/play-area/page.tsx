import PlayArea from '@/components/pagesComponent/playArea/quizPages/PlayArea'
import type { Metadata } from "next"
import { getMetadata } from "@/components/SEO/Meta"

export const metadata: Metadata = getMetadata({ pathName: "/play-area" })
const Page = () => {
    return (
        <PlayArea />
    )
}

export default Page