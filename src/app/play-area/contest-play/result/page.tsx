import ResultScreen from "@/components/storybook/organisms/resultScreen"
import type { Metadata } from "next"
import { getMetadata } from "@/components/SEO/Meta"

export const metadata: Metadata = getMetadata({ pathName: "/play-area/contest-play/result" })
const Page = () => {
    return (
        <ResultScreen />
    )
}

export default Page
