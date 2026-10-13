import { Suspense } from "react"
import PlayScreen from '@/components/storybook/organisms/playSreen'
import { SLUG_MODULE_TYPE_MAP, QuizType } from '@/lib/constants'
import type { Metadata } from "next"
import { getMetadata } from "@/components/SEO/Meta"

export const metadata: Metadata = getMetadata({ pathName: "/play-area/1-vs-1-battle/play" })
const Page = async () => {

    return (
        <Suspense fallback={null}>
            <PlayScreen />
        </Suspense>
    )
}

export default Page
