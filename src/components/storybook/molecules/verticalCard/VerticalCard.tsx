'use client';
import React from 'react';
import { Typography } from '../../atoms/Typography';
import ImagePreview from '../../atoms/ImagePreview';
import { VerticalCardProps } from './VerticalCard.type';
import { Button } from '../../atoms/Button';
import { useIsMobile } from '@/hooks/useMobile';

const VerticalCard: React.FC<VerticalCardProps> = ({ title, desc, img, imgAlt = 'playWin', className = '', onClick, size = 'small', btnLabel, showBtn = true, smallDesc = false, loading = false, disabled = false }) => {

    const isMobile = useIsMobile();


    return (
        size === 'small' ?
            <div className={`${className} surfaceContainerLowestBg flexCol gap-6 rounded-2xl lg:rounded-[42px] commonBorderB border border-[2px] lg:border p-4 lg:p-6 h-full pb-0 lg:pb-0`}>
                <div className='w-20 lg:w-25 h-20 lg:h-25 aspect-100/100'>
                    <ImagePreview src={img} alt={imgAlt} className='object-contain!' />
                </div>
                <div className='flexCol gap-2 sm:gap-4 pb-4 lg:pb-6'>
                    <Typography variant='h3' weight='regular' className="line-clamp-1">
                        {title}
                    </Typography>
                    <Typography variant='h5' weight='medium' className='font-nunito! onSurfaceVarColor! line-clamp-2'>
                        {desc}
                    </Typography>

                    {
                        showBtn &&
                        <Button variant='primary' size={isMobile ? 'sm' : 'md'} glareEffect onClick={onClick} loading={loading} disabled={disabled}>
                            {btnLabel}
                        </Button>
                    }

                </div>
            </div>

            :
            <div className={`${className} surfaceContainerLowestBg flexCol gap-6 rounded-2xl lg:rounded-[42px] commonBorderB border border-[2px] lg:border p-4 lg:p-6 h-full pb-0 lg:pb-0`}>
                <div className='w-37.5 h-37.5 aspect-100/100 md:aspect-150/150'>
                    <ImagePreview src={img} alt={imgAlt} className='object-contain!' />
                </div>
                <div className='flexCol gap-2 sm:gap-4 pb-4 lg:pb-6'>
                    <Typography variant='h2' weight='regular' className="line-clamp-1">
                        {title}
                    </Typography>
                    <Typography variant={smallDesc ? 'subtitle2' : 'h4'} weight='regular' className='font-nunito! onSurfaceVarColor! line-clamp-2'>
                        {desc}
                    </Typography>

                    {
                        showBtn &&
                        <Button variant='primary' size={isMobile ? 'sm' : 'md'} glareEffect onClick={onClick} loading={loading} disabled={disabled}>
                            {btnLabel}
                        </Button>
                    }

                </div>
            </div>
    );
};

export default VerticalCard;
