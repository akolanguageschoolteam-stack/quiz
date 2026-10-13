'use client'
import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Layout from '../layout/Layout'
import CircleSect from './sections/CircleSect'
import HeroSect from './sections/HeroSect'
import HomeCommonSect from './sections/HomeCommonSect'
import NeverEnding from './sections/NeverEnding'
import StartQuiz from './sections/StartQuiz'
import { homeSettingsQueryOptions } from '@/api/queries/homeSettings'
import { webSlidersQueryOptions } from '@/api/queries/webSliders'
import { getGalleryHomeSections, getGridHomeSections, getTriptychHomeSections, toHomeFeatureItems } from '@/utils/homeSettings'

const NEVER_ENDING_IMAGE_COUNT = 4

const HomePage = () => {

    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true)
    }, [])

    const { data: homeSettings } = useQuery(homeSettingsQueryOptions())
    const { data: sliders, isLoading: slidersLoading } = useQuery(webSlidersQueryOptions())
    const showHeroSection = slidersLoading || !!sliders?.length

    const triptychSections = getTriptychHomeSections(homeSettings?.sections)
    const gridSections = getGridHomeSections(homeSettings?.sections)
    const gallerySections = getGalleryHomeSections(homeSettings?.sections, NEVER_ENDING_IMAGE_COUNT)

    return (
        isClient &&
        <Layout>
            {showHeroSection && <>
                <HeroSect />
                <CircleSect />
            </>}
            {triptychSections.map((section) => (
                <HomeCommonSect key={section.section} heading={section.heading} items={toHomeFeatureItems(section)} />
            ))}
            {gridSections.map((section) => (
                <HomeCommonSect key={section.section} variant="grid" heading={section.heading} items={toHomeFeatureItems(section)} />
            ))}
            {gallerySections.map((section) => (
                <NeverEnding key={section.section} heading={section.heading} images={section.images} />
            ))}
            <StartQuiz />
        </Layout>
    )
}

export default HomePage