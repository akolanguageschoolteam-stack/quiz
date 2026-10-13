'use client';
import React, { useState } from 'react';
import { useLocalizedRouter } from '@/hooks/useLocalizedRouter';
import { useQueryClient } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import { Typography } from '../../atoms/Typography';
import { CategoryCardProps } from './CategoryCard.type';
import CoinBadge from '../../atoms/coinBadge';
import ImagePreview from '../../atoms/ImagePreview';
import UnlockModal from '@/components/pagesComponent/playArea/quizPages/UnlockModal';
import AuthModal from '@/components/auth/AuthModal';
import LoginRequiredModal from '@/components/auth/LoginRequiredModal';
import { useAuthGate } from '@/hooks/useAuthGate';
import { useTranslation } from '@/hooks/useTranslation';
import { profileSelector, decrementCoins, tokenSelector } from '@/redux/reducers/userSlice';
import { unlockCategory } from '@/api/apiRoutes';
import { toast } from '@/lib/toast';
import { getErrorMessage } from '@/utils/errorMessages';

const CategoryCard: React.FC<CategoryCardProps> = ({ category, className, onClick, horizontalCard, isSelected, guestModeKey = 'quiz_zone_guest_mode' }) => {

    const { t } = useTranslation();
    const router = useLocalizedRouter();
    const dispatch = useDispatch();
    const queryClient = useQueryClient();
    const userData = useSelector(profileSelector);
    const isLoggedIn = !!useSelector(tokenSelector);

    const [showUnlockModal, setShowUnlockModal] = useState(false);
    const [hasEnoughCoins, setHasEnoughCoins] = useState(true);
    const [unlocking, setUnlocking] = useState(false);
    const { authModalOpen, setAuthModalOpen, loginRequiredOpen, setLoginRequiredOpen, openAuthGate } = useAuthGate();

    const isLocked = !!category?.coins && !category?.has_unlocked;

    const handleCardClick = () => {
        if (!isLocked) {
            onClick?.();
            return;
        }

        if (!isLoggedIn) {
            openAuthGate(guestModeKey);
            return;
        }

        const userCoins = Number(userData?.total_coins ?? 0);
        setHasEnoughCoins(userCoins >= (category?.coins ?? 0));
        setShowUnlockModal(true);
    };

    const handleConfirmUnlock = async () => {
        if (!category?.id) return;

        try {
            setUnlocking(true);
            await unlockCategory(category.id);
            dispatch(decrementCoins(category.coins ?? 0));
            category.has_unlocked = true;
            queryClient.invalidateQueries({ queryKey: ["categories"] });
            setShowUnlockModal(false);
            onClick?.();
        } catch (error) {
            toast.error(getErrorMessage(error, t('somethingWentWrong')));
        } finally {
            setUnlocking(false);
        }
    };

    return (
        <>
            <div key={category?.title} onClick={handleCardClick} className={`group relative surfaceContainerLowestBg rounded-3xl border p-4 lg:py-4 lg:px-6 ${horizontalCard ? 'flex items-center w-max shadow-none!' : 'flexCol'} gap-3 md:gap-4 shadow-[0px_8px_32px_0px_#0000000A] transition-all duration-300 hover:primaryBorder cursor-pointer ${isSelected ? 'primaryBorder primaryContainerBg' : ''} ${className}`}>
                {category?.coins && !category?.has_unlocked && !horizontalCard && (
                    <div className="absolute top-4 ltr:right-4 rtl:left-4">
                        <CoinBadge coins={category?.coins} />
                    </div>
                )}
                <div className={`${horizontalCard ? 'w-8 h-8 md:w-13 md:h-13 aspect-52/52' : 'w-11 h-11 md:w-16 md:h-16 aspect-64/64'}`}>
                    <ImagePreview src={category?.img} alt='playWin' className='rounded-[32px]' />
                </div>
                <div className='flexCol gap-1'>
                    <Typography variant={horizontalCard ? 'h4' : 'h3'} weight='medium' className="line-clamp-1 break-all">
                        {category?.title}
                    </Typography>
                    <Typography variant={horizontalCard ? 'h6' : 'h5'} weight='medium' className='font-nunito! onSurfaceVarColor! group-hover:primaryColor! transition-colors duration-300 line-clamp-1'>
                        {category?.desc}
                    </Typography>
                </div>
                {category?.coins && !category?.has_unlocked && horizontalCard && (
                    <div className="ltr:ml-auto rtl:mr-auto shrink-0">
                        <CoinBadge coins={category?.coins} />
                    </div>
                )}
            </div>

            <UnlockModal
                message={hasEnoughCoins ? `Use ${category?.coins ?? 0} ${t('coins')}?` : t('noEnoughCoinsTitle')}
                description={hasEnoughCoins ? undefined : t('noEnoughCoinsDesc')}
                buttonText={hasEnoughCoins ? t('playNow') : t('goToCoinStore')}
                open={showUnlockModal}
                onOpenChange={setShowUnlockModal}
                onConfirm={() => {
                    if (unlocking) return;
                    if (hasEnoughCoins) {
                        handleConfirmUnlock();
                    } else {
                        setShowUnlockModal(false);
                        router.push(`/profile/my-wallet`);
                    }
                }}
            />

            <AuthModal open={authModalOpen} onClose={setAuthModalOpen} />
            <LoginRequiredModal
                open={loginRequiredOpen}
                onClose={setLoginRequiredOpen}
                onGuestClick={() => setLoginRequiredOpen(false)}
                onLoginClick={() => { setLoginRequiredOpen(false); setAuthModalOpen(true); }}
            />
        </>
    );
};

export default CategoryCard;
