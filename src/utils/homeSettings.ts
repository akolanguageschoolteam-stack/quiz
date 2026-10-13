import { HomeSettingsSection } from '@/types/GlobalTypes'

export interface HomeFeatureItem {
    image: string
    title: string
    description: string
}

const isFeatureSection = (section: HomeSettingsSection): boolean =>
    !!section.titles?.length && !!section.descriptions?.length

export const toHomeFeatureItems = (section: HomeSettingsSection): HomeFeatureItem[] => {
    const count = Math.min(section.images.length, section.titles!.length, section.descriptions!.length)

    return Array.from({ length: count }, (_, index) => ({
        image: section.images[index],
        title: section.titles![index],
        description: section.descriptions![index],
    }))
}

// Feature sections (heading + image/title/description tuples) render in the order the API
// returns them — the API's array order is the source of truth for on-page ordering. A section
// with exactly 3 items uses the triptych (hero + two side cards) layout; any other count uses
// the flexible grid layout — the item count in the data determines the presentation, not the
// section number.
export const getTriptychHomeSections = (
    sections: HomeSettingsSection[] | undefined
): HomeSettingsSection[] =>
    (sections ?? []).filter(
        (section) => section.is_active === true && isFeatureSection(section) && section.titles!.length === 3
    )

export const getGridHomeSections = (
    sections: HomeSettingsSection[] | undefined
): HomeSettingsSection[] =>
    (sections ?? []).filter(
        (section) => section.is_active === true && isFeatureSection(section) && section.titles!.length !== 3
    )

// Gallery sections (heading + images only, no titles/descriptions) always render with exactly
// `expectedImageCount` images since the layout has a fixed number of image slots.
export const getGalleryHomeSections = (
    sections: HomeSettingsSection[] | undefined,
    expectedImageCount: number
): HomeSettingsSection[] =>
    (sections ?? []).filter(
        (section) => !isFeatureSection(section) && section.images.length === expectedImageCount
    )
