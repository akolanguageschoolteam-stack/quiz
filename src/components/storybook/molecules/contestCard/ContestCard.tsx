'use client';
import React from 'react';
import { Timer } from 'lucide-react';
import { Typography } from '../../atoms/Typography';
import { Button } from '../../atoms/Button';
import ImagePreview from '../../atoms/ImagePreview';
import { PremiumCoin, User } from '@/components/common/Icons';
import { ContestCardProps } from './ContestCard.type';

const ContestCard: React.FC<ContestCardProps> = ({
    contest,
    badgeLabel,
    entryFeeLabel,
    playersLabel,
    joinNowLabel,
    checkResultLabel,
    viewLeaderboardLabel,
    isCompleted = false,
    isUpcoming = false,
    isJoining = false,
    joinedSuccessfullyLabel,
    onJoin,
    onCheckResult,
    onCardClick,
    className = '',
}) => {
    const showLeaderboard = isCompleted || contest.hasPlayed;
    const isJoinedUpcoming = isUpcoming && contest.hasJoined;
    const isJoinedLive = !isUpcoming && !isCompleted && contest.hasJoined && !contest.hasPlayed;
    const buttonLabel = isJoinedUpcoming || isJoinedLive
        ? joinedSuccessfullyLabel
        : isCompleted ? viewLeaderboardLabel : contest.hasPlayed ? checkResultLabel : `${contest.joinFee} - ${joinNowLabel}`;
    return (
        <div
            onClick={onCardClick}
            className={`surfaceContainerLowestBg rounded-3xl overflow-hidden shadow-[0px_8px_32px_0px_#0000000A] flexCol border ${onCardClick ? 'cursor-pointer' : ''} ${className}`}
        >
            <div className="relative aspect-16/10 w-full shrink-0 overflow-hidden">
                <ImagePreview src={contest.img} alt={contest.title} objectFit="cover" containerClassName="absolute inset-0 w-full h-full" className="absolute inset-0 w-full h-full" />
                {badgeLabel && (
                    <div className="absolute top-0 left-0">
                        <div className="bg-black/45 backdrop-blur-sm rounded-br-xl py-1.5 px-3 flexCenter gap-1.5">
                            <Timer className="w-4 h-4 text-white shrink-0" />
                            <Typography as="span" variant="caption" weight="semibold" className="text-white! font-nunito! whitespace-nowrap">
                                {badgeLabel}
                            </Typography>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 md:p-5 flexCol gap-4">
                <div>
                    <Typography variant="h4" weight="extrabold" className="line-clamp-1">
                        {contest.title}
                    </Typography>
                    <Typography variant="h6" weight="medium" className="onSurfaceVarColor! font-nunito! line-clamp-1">
                        {contest.description}
                    </Typography>
                </div>

                <div className="flex items-center gap-3 justify-between">
                    <div className="flex items-center gap-1.5 min-w-0">
                        <PremiumCoin width={20} height={20} className="shrink-0" />
                        <Typography as="span" variant="h6" weight="semibold" className="font-nunito! whitespace-nowrap truncate">
                            {contest.entryFee} - {entryFeeLabel}
                        </Typography>
                    </div>
                    <div className="w-0.5 h-6 bg-(--neutral-200) shrink-0" />
                    <div className="flex items-center gap-1.5 min-w-0">
                        <User width={18} height={18} className="shrink-0" />
                        <Typography as="span" variant="h6" weight="semibold" className="font-nunito! whitespace-nowrap truncate">
                            {contest.players} - {playersLabel}
                        </Typography>
                    </div>
                </div>

                <Button
                    variant={isJoinedUpcoming || showLeaderboard || isJoinedLive ? 'shade' : 'primary'}
                    fullWidth
                    loading={isJoining}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (isJoinedUpcoming || isJoining) return;
                        (showLeaderboard ? onCheckResult : onJoin)?.();
                    }}
                    disabled={isJoinedUpcoming || isJoining || (showLeaderboard && !onCheckResult)}
                    leftIcon={isJoinedUpcoming || showLeaderboard || isJoinedLive ? undefined : <PremiumCoin width={18} height={18} className='mt-2' />}
                >
                    {buttonLabel}
                </Button>
            </div>
            
        </div>
    );
};

export default ContestCard;
