import LeaderBoard from "@/components/pagesComponent/playArea/Leaderboard"
import type { Metadata } from "next"
import { getMetadata } from "@/components/SEO/Meta"

export const metadata: Metadata = getMetadata({ pathName: "/play-area/contest-play/leaderboard" })
const Page = () => {
    return (
        <LeaderBoard />
    )
}

export default Page
