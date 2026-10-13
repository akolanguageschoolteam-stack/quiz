'use client';
import React from 'react';
import { Typography } from '../../atoms/Typography';
import { SectionInfoProps } from './SectionInfo.type';
import RichTextContent from '@/components/common/RichText';

const SectionInfo: React.FC<SectionInfoProps> = ({
    title,
    titleVariant = 'h2',
    titleWeight = 'medium',
    desc,
    descVariant = 'desc1',
    isCenter = true,
    className = '',
    isTextWhite = false,
    showInRichText = false,
    blogsDetailsPage = false
}) => {
    const wrapperClasses = [
        'flex flex-col gap-6',
        isCenter
            ? 'md:items-center md:justify-center sm:w-[80%] md:w-[60%] lg:w-[70%] min-1800:w-[50%]! mx-auto text-center'
            : '',
        className,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <div className={wrapperClasses}>

            <div className="space-y-2">
                <Typography variant={titleVariant} weight={titleWeight} className={`text-2xl! md:text-4xl! lg:text-6xl! ${isTextWhite && 'text-white!'}`}>
                    {title}
                </Typography>
                {
                    showInRichText ?
                        <RichTextContent content={desc || ''} className="font-medium! textSecondaryColor!" />
                        :
                        <Typography variant={descVariant} className={`${blogsDetailsPage ? '' : 'hidden'} md:block m-0 textSecondaryColor font-medium ${isTextWhite && 'text-[#BFBFBF]!'}`}>
                            {desc}
                        </Typography>
                }
            </div>
        </div>
    );
};

export default SectionInfo;
