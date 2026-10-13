'use client'
import heroBg from '@/assets/homePage/heroBg.svg'
import Stack from '@/components/react-bits/Stack'
import { Button } from '@/components/storybook/atoms/Button'
import { Typography } from '@/components/storybook/atoms/Typography'
import { useTranslation } from '@/hooks/useTranslation'
import { AnimatePresence, motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { useQuery } from '@tanstack/react-query'
import { tokenSelector } from '@/redux/reducers/userSlice'
import AuthModal from '@/components/auth/AuthModal'
import { webSlidersQueryOptions } from '@/api/queries/webSliders'
import ImagePreview from '@/components/storybook/atoms/ImagePreview'

const HeroSect = () => {

    const { t } = useTranslation();

    const token = useSelector(tokenSelector);
    const isLoggedIn = !!token

    const { data: sliders, isLoading: slidersLoading } = useQuery(webSlidersQueryOptions())

    const heroCards = useMemo(
        () => (sliders ?? []).map((slider) => ({
            image: slider.image,
            badge: slider.title,
            title: slider.description,
        })),
        [sliders]
    )

    const [activeIndex, setActiveIndex] = useState(0);
    const activeCard = heroCards[activeIndex] ?? heroCards[0];
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    const heroCardImages = useMemo(
        () => heroCards.map((item, i) => (
            <ImagePreview
                key={i}
                src={item.image}
                alt={`card-${i + 1}`}
                className="w-full h-full object-cover rounded-[32px] pointer-events-none!"
            />
        )),
        [heroCards]
    )

    if (!slidersLoading && !heroCards.length) {
        return null;
    }

    return (
        <section className="primaryBg overflow-hidden -mt-36 max-479:rounded-b-0 sm:rounded-b-[50px] h-250 lg:h-236 relative">
            <div
                style={{
                    backgroundImage: `url(${heroBg.src})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
                className="absolute inset-0 h-full w-full z-3"
            >
            </div>

            <div className="relative z-10  flex items-center justify-between pt-52 md:pt-48 lg:pt-52 pb-50 container flex-col-reverse lg:flex-row gap-10">

                {/* Left: text content */}
                <div className="flex flex-col gap-8 lg:max-w-[52%] items-center text-center lg:items-start lg:text-start">

                    {/* Badge */}

                    {activeCard &&
                        <Typography variant='h3' weight='regular' className="w-fit px-4 py-4 rounded-[30px] bg-(--primary-400) text-white text-sm font-medium tracking-wide shadow-[0px_4px_0px_0px_var(--primary)] overflow-hidden">
                            <AnimatePresence mode="wait">
                                <motion.span
                                    key={activeIndex}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.35, ease: 'easeInOut' }}
                                    className="block"
                                >
                                    {activeCard.badge}
                                </motion.span>
                            </AnimatePresence>
                        </Typography>
                    }

                    {/* Heading */}
                    {activeCard &&
                        <h1
                            className="text-5xl between-768-991:text-6xl between-992-1199:text-[82px] lg:text-8xl text-white font-extrabold leading-tight otto"
                        >
                            <AnimatePresence mode="wait">
                                <motion.span
                                    key={activeIndex}
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -16 }}
                                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                                    className="block line-clamp-3! pb-3 md:pb-6 between-768-991:pb-2"
                                >
                                    {activeCard.title}
                                </motion.span>
                            </AnimatePresence>
                        </h1>
                    }

                    {/* CTA Button */}
                    {!isLoggedIn &&
                        <Button variant='secondary' className='mt-6' onClick={() => setIsAuthModalOpen(true)}>
                            {t('signUpNow')}
                        </Button>
                    }
                </div>

                {/* Right: stacked cards */}
                <div className="h-51.75 w-51.75 sm:h-73.75 sm:w-73.75 lg:w-93.5 lg:h-93.5 mr-[10%]">
                    <Stack
                        randomRotation
                        sensitivity={200}
                        autoplay
                        autoplayDelay={3000}
                        pauseOnHover={true}
                        sendToBackOnClick={true}
                        onTopCardChange={setActiveIndex}
                        cards={heroCardImages}
                        isLoading={slidersLoading}
                    />
                </div>

            </div>

            <AuthModal open={isAuthModalOpen} onClose={setIsAuthModalOpen} initialView='register' />
        </section>
    )
}

export default HeroSect
