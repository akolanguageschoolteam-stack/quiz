import ResultScreen from "@/components/storybook/organisms/resultScreen"
import type { Metadata } from "next"
import { getMetadata } from "@/components/SEO/Meta"

export const metadata: Metadata = getMetadata({ pathName: "/play-area/exams/result" })

const Page = () => {
    return (
        <ResultScreen />
    )
}

export default Page
