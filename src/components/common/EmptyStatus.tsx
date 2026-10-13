'use client'
import NoDataFoundImg from '@/assets/emptyStates/noDataFound.png'
import maintenanceModeImg from '@/assets/emptyStates/maintenance.png'
import somethingWentWrongImg from '@/assets/emptyStates/somethingWentWrong.png'
import pageNotFoundImg from '@/assets/emptyStates/pageNotFound.png'
import { Typography } from '../storybook/atoms/Typography'
import { Button } from '../storybook/atoms/Button'
import { useTranslation } from '@/hooks/useTranslation'
import { useLocalizedRouter } from '@/hooks/useLocalizedRouter'
import ImagePreview from '../storybook/atoms/ImagePreview'
import { StaticImageData } from 'next/image'

interface EmptyStatusProps {
    title?: string
    description?: string
    image?: StaticImageData
    className?: string
    type?: "noDataFound" | "maintenanceMode" | "noNotification" | "somethingWentWrong" | "pageNotFound"
}

const TYPE_LABEL_KEYS: Record<NonNullable<EmptyStatusProps['type']>, { titleKey: string; descKey: string }> = {
    noDataFound: { titleKey: 'noDataFoundTitle', descKey: 'noDataFoundDesc' },
    maintenanceMode: { titleKey: 'maintenanceModeTitle', descKey: 'maintenanceModeDesc' },
    noNotification: { titleKey: 'noNotificationTitle', descKey: 'noNotificationDesc' },
    somethingWentWrong: { titleKey: 'somethingWentWrong', descKey: 'somethingWentWrongDesc' },
    pageNotFound: { titleKey: 'pageNotFoundTitle', descKey: 'pageNotFoundDesc' },
}

const EmptyStatus = ({
    title,
    description,
    image = somethingWentWrongImg,
    className = '',
    type = "noDataFound",
}: EmptyStatusProps) => {
    const { t } = useTranslation();
    const router = useLocalizedRouter();
    const { titleKey, descKey } = TYPE_LABEL_KEYS[type];
    const resolvedTitle = title ?? t(titleKey);
    const resolvedDescription = description ?? t(descKey);
    const isPageNotFound = type === 'pageNotFound';

    const getImage = () => {
        switch (type) {
            case "noDataFound":
                return NoDataFoundImg;
            case "maintenanceMode":
                return maintenanceModeImg;
            case "somethingWentWrong":
                return somethingWentWrongImg;
            case "pageNotFound":
                return pageNotFoundImg;
            default:
                return NoDataFoundImg;
        }
    }

    return (
        <div className={`flexColCenter ${type === 'noNotification' ? 'h-full' : type === 'noDataFound' ? 'h-150' : 'h-screen'} py-12 px-4 text-center ${className} `}>
            <div className={`w-64 h-64 sm:w-lg sm:h-100  flexCenter mb- bg-transparent`}>
                <ImagePreview
                    src={getImage()}
                    alt={resolvedTitle}
                    className="object-contain!"
                />
            </div>

            <Typography variant='h3' weight='semibold' className='mb-2'>
                {resolvedTitle}
            </Typography>

            <Typography variant='caption' color='textSecondaryColor!' weight='medium' className="max-w-xs sm:max-w-sm lg:max-w-lg leading-relaxed">
                {resolvedDescription}
            </Typography>

            {isPageNotFound && (
                <Button variant='primary' className='mt-6' onClick={() => router.push('/')}>
                    {t('home')}
                </Button>
            )}
        </div>
    )
}

export default EmptyStatus
