import LeaderBoard from '@/components/pagesComponent/playArea/Leaderboard'
import type { Metadata } from "next"
import { getMetadata } from "@/components/SEO/Meta"

export const metadata: Metadata = getMetadata({ pathName: "/leaderboard" })
const Index = () => {
    return (
        <LeaderBoard />
    )
}

export default Index