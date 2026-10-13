import RandomBattle from '@/components/pagesComponent/playArea/randomBattle/RandomBattle'
import type { Metadata } from "next"
import { getMetadata } from "@/components/SEO/Meta"

export const metadata: Metadata = getMetadata({ pathName: "/play-area/random-battle" })
const Page = () => {
    return (
        <RandomBattle />
    )
}

export default Page