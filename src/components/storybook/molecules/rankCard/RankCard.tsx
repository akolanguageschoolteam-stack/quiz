'use client';
import React from 'react';
import { Zap } from 'lucide-react';
import { Typography } from '../../atoms/Typography';
import ImagePreview from '../../atoms/ImagePreview';
import { RankCardProps } from './RankCard.type';
import CoinBadge from '../../atoms/coinBadge';

const getOrdinalSuffix = (rank: number) => {
    const remainder100 = rank % 100;
    if (remainder100 >= 11 && remainder100 <= 13) return 'th';

    switch (rank % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
    }
};

const RankCard: React.FC<RankCardProps> = ({ avatar, name, streak, rank, className, contestModal = false, coins = 0, leaderboard = false }) => {
    return (
        <div className={`surfaceContainerLowestBg  ${contestModal || leaderboard ? 'border-b last:border-b-0' : 'rounded-3xl shadow-[0px_8px_32px_0px_#0000000A]'} p-3 md:p-6 flex items-center justify-between gap-3 ${className ?? ''}`}>
            <div className="flex items-center gap-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden shrink-0">
                    <ImagePreview src={avatar} alt={name} rounded="full" />
                </div>
                <div className="flexCol gap-0.5 min-w-0">
                    <Typography variant="h6" weight="semibold" className="line-clamp-1 dark:text-white">
                        {name}
                    </Typography>
                    <div className="flex items-center gap-1">
                        {
                            contestModal &&
                            <Typography as="span" variant="caption" weight="semibold" className="font-nunito! mr-2">
                                {rank}{getOrdinalSuffix(rank)}
                            </Typography>
                        }
                        <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 blueColor fill-current shrink-0" />
                        <Typography as="span" variant="caption" weight="semibold" className="blueColor! font-nunito!">
                            {streak}
                        </Typography>
                    </div>
                </div>
            </div>
            {
                contestModal ?
                    <CoinBadge coins={coins} />
                    :
                    <div className="surfaceContainerLowBg rounded-full py-1.5 px-3 sm:py-2 sm:px-4 shrink-0">
                        <Typography as="span" variant="h6" weight="bold" className="whitespace-nowrap dark:text-white">
                            {rank}{getOrdinalSuffix(rank)}
                        </Typography>
                    </div>
            }
        </div>
    );
};

export default RankCard;
