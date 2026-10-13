'use client';
import React from 'react';
import { Typography } from '../../atoms/Typography';
import ImagePreview from '../../atoms/ImagePreview';
import { HorizontalCardProps } from './HorizontalCard.type';
import { Button } from '../../atoms/Button';
import { useIsMobile } from '@/hooks/useMobile';

const HorizontalCard: React.FC<HorizontalCardProps> = ({ title, desc, img, imgAlt = 'playWin', className = '', onClick, size = 'small', btnLabel, loading = false, disabled = false }) => {

    const isMobile = useIsMobile();
    
    return (
        size === 'small' ?
            <div onClick={onClick} className={`surfaceContainerLowestBg flex flex-wrap md:flex-nowrap items-center justify-between gap-5.5 rounded-3xl commonBorderB border border-[2px]! lg:border p-4 lg:p-6 h-full ${onClick ? 'cursor-pointer' : ''} ${className}`}>
                <div className='flexCol gap-2 sm:gap-4'>
                    <Typography variant='h3' weight='regular' className="line-clamp-1">
                        {title}
                    </Typography>
                    <Typography variant='h5' weight='medium' className='font-nunito! onSurfaceVarColor! line-clamp-2'>
                        {desc}
                    </Typography>
                </div>
                <div className='max-375:justify-end max-375:flex max-375:w-full'>
                    <div className='w-20 lg:w-25 h-20 lg:h-25 aspect-100/100'>
                        <ImagePreview src={img} alt={imgAlt} />
                    </div>
                </div>
            </div>
            :
            <div className={`${className} surfaceContainerLowestBg grid grid-cols-12 gap-6 rounded-2xl lg:rounded-[42px] commonBorderB border border-[2px] lg:border p-4 lg:p-6 h-full pb-0 lg:pb-0`}>

                <div className='col-span-8 flexCol gap-2 sm:gap-4 pb-4 lg:pb-6'>
                    <Typography variant='h2' weight='regular' className="line-clamp-1">
                        {title}
                    </Typography>
                    <Typography variant='h4' weight='regular' className='font-nunito! onSurfaceVarColor! line-clamp-2'>
                        {desc}
                    </Typography>

                    <Button variant='primary' size={isMobile ? 'sm' : 'md'} glareEffect onClick={onClick} loading={loading} disabled={disabled}>
                        {btnLabel}
                    </Button>

                </div>
                <div className='col-span-4 w-20 h-20  lg:w-42.25 lg:h-42.25  aspect-100/100 md:aspect-169/169'>
                    <ImagePreview src={img} alt={imgAlt} className='object-contain!' />
                </div>
            </div>
    );
};

export default HorizontalCard;
