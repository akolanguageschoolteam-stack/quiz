'use client';
import React from 'react';
import { Typography } from '../../atoms/Typography';
import ImagePreview from '../../atoms/ImagePreview';
import { PlayerCardProps } from './PlayerCard.type';

const PlayerCard: React.FC<PlayerCardProps> = ({ avatar, name, role, muted = false, className, horizontalCard, attendQuestions = 0, totalQuestions = 0, bubble }) => {
    return (
        <div className={`surfaceContainerLowestBg rounded-2xl py-4 px-6 ${horizontalCard ? 'flex items-center' : 'flexColCenter text-center'} gap-2 ${className ?? ''}`}>
            <div className={`relative w-16 h-16 md:w-20 md:h-20 rounded-full overflow-visible ${muted ? 'surfaceContainerLowBg' : ''}`}>
                {bubble && (
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full z-20 max-w-40 px-3 py-1.5 rounded-2xl commonBg shadow-[0px_8px_32px_0px_rgba(0,0,0,0.15)] whitespace-nowrap">
                        <Typography as="span" variant="h6" weight="semibold" className="font-nunito! onSurfaceColor!">
                            {bubble}
                        </Typography>
                    </div>
                )}
                <div className="w-full h-full rounded-full overflow-hidden">
                    <ImagePreview src={avatar} alt={name} rounded="full" />
                </div>
            </div>
            <div className='flexCol'>
                <Typography variant="h5" weight="semibold">
                    {name}
                </Typography>
                {
                    role ?
                        <Typography variant="h6" weight="medium" className="onSurfaceVarColor! font-nunito!">
                            {role}
                        </Typography>
                        :
                        <Typography variant="h6" weight="medium" className="onSurfaceVarColor! font-nunito!">
                            {attendQuestions}/{totalQuestions}
                        </Typography>
                }
            </div>
        </div>
    );
};

export default PlayerCard;
