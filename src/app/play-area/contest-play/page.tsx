import ContestPlay from '@/components/pagesComponent/playArea/contestPlay/ContestPlay'
import type { Metadata } from "next"
import { getMetadata } from "@/components/SEO/Meta"

export const metadata: Metadata = getMetadata({ pathName: "/play-area/contest-play" })
const Page = () => {
  return (
    <ContestPlay />
  )
}

export default Page