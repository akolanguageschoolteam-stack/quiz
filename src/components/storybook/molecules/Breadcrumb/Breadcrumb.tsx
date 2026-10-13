'use client';
import React from 'react';
import { Typography } from '../../atoms/Typography';
import { BreadcrumbProps } from './Breadcrumb.type';
import { useRouter } from 'next/navigation';
import { Coin, NewArrow, Rank } from '@/components/common/Icons';
import { useTranslation } from '@/hooks/useTranslation';
import LocalizedLink from '@/components/common/LocalizedLink';
import { useIsMobile } from '@/hooks/useMobile';
import { useSelector } from 'react-redux';
import { profileSelector } from '@/redux/reducers/userSlice';

const getOrdinalSuffix = (value: number) => {
    const remainder100 = value % 100;
    if (remainder100 >= 11 && remainder100 <= 13) return 'th';
    switch (value % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
    }
};

const Breadcrumb: React.FC<BreadcrumbProps> = ({ firstElement, secondElement, thirdElement, className }) => {

    const router = useRouter();
    const { t } = useTranslation();
    const isMobile = useIsMobile();
    const profile = useSelector(profileSelector);

    const coins = typeof profile?.total_coins === 'number' ? profile.total_coins : 0;
    const rankValue = typeof profile?.all_time_rank === 'number'
        ? profile.all_time_rank
        : typeof profile?.all_time_rank === 'string' && profile.all_time_rank !== '' && !Number.isNaN(Number(profile.all_time_rank))
            ? Number(profile.all_time_rank)
            : null;
    const rankLabel = rankValue != null ? `${rankValue}${getOrdinalSuffix(rankValue)}` : '-';

    return (
        <nav className="primaryContainerBg border-b flex items-center p-3 sm:p-6 max-375:py-6">
            <div className="container flex items-center justify-between gap-3 sm:gap-4 px-4 max-375:flex-wrap">

                {/* Left — back + breadcrumb path */}
                <div className="flex items-center gap-1 sm:gap-3 min-w-0">
                    <button
                        aria-label="Go back"
                        onClick={() => router.back()}
                        className="w-7 h-7 sm:w-11 sm:h-11 rounded-2xl flexCenter surfaceContainerLowestBg border"
                    >
                        <NewArrow className="rotate-180 fill-black! dark:fill-white!" width={16} height={16} />
                    </button>

                    <div className="flex items-center gap-3 min-w-0">
                        {
                            firstElement === t('playArea') ?
                                <LocalizedLink href="/play-area" className='no-underline hover:underline transition-all duration-500'>
                                    <Typography variant={isMobile ? 'caption' : 'h4'} weight="medium" className="font-nunito! hidden md:block">
                                        {firstElement}
                                    </Typography>
                                </LocalizedLink>
                                :
                                <Typography variant={isMobile ? 'caption' : 'h4'} weight="medium" className="font-nunito! hidden md:block">
                                    {firstElement}
                                </Typography>
                        }
                        <Typography variant={isMobile ? 'caption' : 'h4'} weight="medium" className="font-nunito! hidden md:block">
                            /
                        </Typography>
                        <Typography variant={isMobile ? 'caption' : 'h4'} weight="medium" className={`font-nunito! ${thirdElement ? 'hidden md:block' : 'primaryColor'}`}>
                            {secondElement}
                        </Typography>
                        {thirdElement && (
                            <>
                                <Typography variant={isMobile ? 'caption' : 'h4'} weight="medium" className="font-nunito! hidden md:block">
                                    /
                                </Typography>
                                <Typography variant={isMobile ? 'caption' : 'h4'} weight="medium" className="font-nunito! primaryColor">
                                    {thirdElement}
                                </Typography>
                            </>
                        )}
                    </div>
                </div>

                {/* Right — rank + coins + coin icon */}
                <div className="flexCenter gap-3 sm:gap-6">

                    {/* Rank */}
                    <LocalizedLink href="/leaderboard">
                        <div className="flexCenter gap-2 sm:gap-3 primaryBg border max-sm:px-2 max-sm:py-1 py-2 px-3 rounded-xl">
                            <Rank className='[&_path]:fill-(--neutral-200)' width={isMobile ? 20 : 28} />
                            <Typography variant={isMobile ? 'caption' : 'h4'} weight="medium" className="font-nunito! text-white">
                                {rankLabel}
                            </Typography>
                            <NewArrow className={`fill-white! ml-2`} height={14} width={14}/>
                        </div>
                    </LocalizedLink>

                    {/* Coins badge */}
                    <div className="primaryBg rounded-full py-1 px-3 pr-8">
                        <Typography variant={isMobile ? 'caption' : 'h4'} weight="medium" className="font-nunito! text-white">
                            {coins}
                        </Typography>
                    </div>
                    <Coin className='max-md:-ml-8 -ml-12' width={isMobile ? 32 : 54} />
                </div>

            </div>
        </nav>
    );
};

export default Breadcrumb;