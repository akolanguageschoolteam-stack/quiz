import { Suspense } from "react"
import PlayScreen from '@/components/storybook/organisms/playSreen'
import type { Metadata } from "next"
import { getMetadata } from "@/components/SEO/Meta"

export const metadata: Metadata = getMetadata({ pathName: "/play-area/contest-play/play" })
const Page = async () => {
    return (
        <Suspense fallback={null}>
            <PlayScreen />
        </Suspense>
    )
}

export default Page
