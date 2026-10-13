import GroupBattleResult from "@/components/pagesComponent/playArea/groupBattle/GroupBattleResult"
import type { Metadata } from "next"
import { getMetadata } from "@/components/SEO/Meta"

export const metadata: Metadata = getMetadata({ pathName: "/play-area/group-battle/result" })

const Page = () => {
    return (
        <GroupBattleResult />
    )
}

export default Page
