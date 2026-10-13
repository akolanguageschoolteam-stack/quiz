import { Variants } from 'motion/react'

export const listVariants: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } },
}

export const itemVariants: Variants = {
    hidden: { opacity: 0, y: 32 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}
