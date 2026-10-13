import Exams from '@/components/pagesComponent/playArea/exams/Exams'
import type { Metadata } from "next"
import { getMetadata } from "@/components/SEO/Meta"

export const metadata: Metadata = getMetadata({ pathName: "/play-area/exams" })
const Page = () => {
  return (
    <Exams />
  )
}

export default Page