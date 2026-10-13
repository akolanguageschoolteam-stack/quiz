'use client'
import ImagePreview from '@/components/storybook/atoms/ImagePreview'
import { Typography } from '@/components/storybook/atoms/Typography'
import SectionInfo from '@/components/storybook/molecules/SectionInfo'
import { useIsDark } from '@/hooks/useIsDark'
import { motion } from 'motion/react'
import { itemVariants, listVariants } from '@/lib/motionVariants'
import { VerticalCard } from '@/components/storybook/molecules/verticalCard'
import { HomeFeatureItem } from '@/utils/homeSettings'
import { AdZone, useAdGridColumns } from '@/components/ads/AdZone'

interface HomeCommonSectProps {
    variant?: 'triptych' | 'grid'
    heading: string
    items: HomeFeatureItem[]
}

const HomeCommonSect = ({ variant = 'triptych', heading, items }: HomeCommonSectProps) => {

    const isDark = useIsDark();
    const adColumns = useAdGridColumns([{ minWidthPx: 0, columns: 1 }, { minWidthPx: 376, columns: 2 }, { minWidthPx: 1024, columns: 4 }]);
    const gridRemainder = items.length > 0 ? items.length % adColumns : 0;

    if (variant === 'grid') {
        return (
            <section className='primaryFixedBg commonPT'>
                <div className='container commonTextContentGap commonPY'>
                    <motion.div
                        variants={itemVariants}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, amount: 0.2 }}
                    >
                        <SectionInfo title={heading} />
                    </motion.div>

                    <motion.div
                        className='grid max-375:grid-cols-1 grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6'
                        variants={listVariants}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, amount: 0.2 }}
                    >
                        {items.map((feature) => (
                            <motion.div key={feature.title} variants={itemVariants}>
                                <VerticalCard title={feature.title} desc={feature.description} img={feature.image} imgAlt={feature.title} showBtn={false} size='lg' smallDesc={true} className='surfaceContainerLowestBg overflow-hidden p-4 md:p-10 rounded-[32px] flexColCenter shadow-[0px_20px_48px_0px_#0000000F] border-none text-center'/>
                            </motion.div>
                        ))}
                        {gridRemainder !== 0 && <AdZone style={{ gridColumn: 'auto / -1' }} minWidth={160} minHeight={160} />}
                    </motion.div>
                </div>
            </section>
        )
    }

    return (
        <section
            className={`${isDark
                ? 'bg-linear-to-b from-(--neutral-950) to-(--neutral-950)'
                : 'bg-linear-to-b from-(--neutral-50) to-(--primary-100)'
                } commonMT`}
        >
            <div className='container commonTextContentGap'>

                <motion.div
                    variants={itemVariants}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.2 }}
                >
                    <SectionInfo title={heading} />
                </motion.div>

                <motion.div
                    className='grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-1 md:pt-20'
                    variants={listVariants}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.2 }}
                >
                    {/* Middle grid slot is the enlarged/elevated "hero" card, so the first data
                        item (meant to read as the centerpiece) is displayed there, not on the left. */}
                    {(items.length === 3 ? [items[1], items[0], items[2]] : items).map((feature, index) => {
                        const cardStyle =
                            index === 0
                                ? 'md:-rotate-2 md:translate-y-4'
                                : index === 1
                                    ? 'md:-translate-y-6'
                                    : 'md:rotate-2 md:translate-y-4'

                        return (
                            <motion.div
                                key={feature.title}
                                variants={itemVariants}
                                className={`surfaceContainerLowestBg rounded-[32px] px-6 py-8 flexColCenter gap-6 transition-all duration-300 max-md:border ${cardStyle}`} >
                                <div
                                    className={`relative shrink-0 ${index === 1
                                        ? 'w-60 h-60'
                                        : 'w-44 h-44'
                                        }`}
                                >
                                    <ImagePreview
                                        src={feature.image}
                                        alt={feature.title}
                                        className="object-contain"
                                    />
                                </div>

                                <div className="flex flex-col gap-3 text-center">
                                    <Typography
                                        variant="h2"
                                        weight="regular"
                                        className="line-clamp-1"
                                    >
                                        {feature.title}
                                    </Typography>

                                    <Typography
                                        variant="subtitle2"
                                        weight="regular"
                                        className="onSurfaceVarColor! font-nunito!"
                                    >
                                        {feature.description}
                                    </Typography>
                                </div>
                            </motion.div>
                        )
                    })}
                </motion.div>
            </div>
        </section>
    )
}

export default HomeCommonSect
