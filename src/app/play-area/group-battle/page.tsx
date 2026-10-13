import GroupBattle from '@/components/pagesComponent/playArea/groupBattle/GorupBattle'
import type { Metadata } from "next"
import { getMetadata } from "@/components/SEO/Meta"

export const metadata: Metadata = getMetadata({ pathName: "/play-area/group-battle" })
const Page = () => {
    return (
    <GroupBattle />
    )
}

export default Page