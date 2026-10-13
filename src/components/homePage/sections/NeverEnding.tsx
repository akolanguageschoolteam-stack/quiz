'use client'
import ImagePreview from "@/components/storybook/atoms/ImagePreview"
import SectionInfo from "@/components/storybook/molecules/SectionInfo"
import { motion } from 'motion/react'
import { itemVariants, listVariants } from '@/lib/motionVariants'

interface NeverEndingProps {
    heading: string
    images: string[]
}

const NeverEnding = ({ heading, images }: NeverEndingProps) => {

    const displayImages = images.length === 4
        ? [images[0], images[2], images[1], images[3]]
        : images

    return (
        <section className="container commonMT commonTextContentGap mb-24">
            <motion.div
                variants={itemVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.2 }}
            >
                <SectionInfo title={heading} />
            </motion.div>
            <motion.div
                className="grid grid-cols-2 gap-2 md:gap-6"
                variants={listVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.2 }}
            >
                <div className="flexColCenter gap-2 md:gap-6 overflow-hidden">
                    <motion.div variants={itemVariants} className="h-full w-full aspect-656/416">
                        <ImagePreview src={displayImages[0]} alt="image1" className="rounded-[12px]! md:rounded-3xl! lg:rounded-[42px]!" />
                    </motion.div>
                    <motion.div variants={itemVariants} className="w-full h-full aspect-648/648">
                        <ImagePreview src={displayImages[1]} alt="image1" className="rounded-[12px]! md:rounded-3xl! lg:rounded-[42px]!" />
                    </motion.div>
                </div>
                <div className="flexColCenter gap-2 md:gap-6 overflow-hidden">
                    <motion.div variants={itemVariants} className="w-full h-full aspect-656/656">
                        <ImagePreview src={displayImages[2]} alt="image1" className="rounded-[12px]! md:rounded-3xl! lg:rounded-[42px]!" />
                    </motion.div>
                    <motion.div variants={itemVariants} className="h-full w-full aspect-656/416">
                        <ImagePreview src={displayImages[3]} alt="image1" className="rounded-[12px]! md:rounded-3xl! lg:rounded-[42px]!" />
                    </motion.div>
                </div>
            </motion.div>
        </section>
    )
}

export default NeverEnding