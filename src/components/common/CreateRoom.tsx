'use client'

import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useDispatch, useSelector } from "react-redux"
import { useTranslation } from "@/hooks/useTranslation"
import { useLocalizedRouter } from "@/hooks/useLocalizedRouter"
import { Typography } from "../storybook/atoms/Typography"
import { Button } from "../storybook/atoms/Button"
import Input from "../storybook/atoms/Input/Input"
import { CategoryCard } from "../storybook/molecules/categoryCard"
import CategoryCardHorizontalSkeleton from "@/components/skeltons/CategoryCardHorizontalSkeleton"
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel"
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures"
import { PremiumCoin } from "./Icons"
import { CategoryType } from "@/types/GlobalTypes"
import { toast } from "@/lib/toast"
import { getErrorMessage } from "@/utils/errorMessages"
import AuthModal from "@/components/auth/AuthModal"
import LoginRequiredModal from "@/components/auth/LoginRequiredModal"
import UnlockModal from "@/components/pagesComponent/playArea/quizPages/UnlockModal"
import { useAuthGate } from "@/hooks/useAuthGate"
import BattleRoomLive from "./BattleRoomLive"
import { categoriesQueryOptions } from "@/api/queries/categories"
import { mapCategoryInterfaceToCategoryType } from "@/lib/categoryMapper"
import { QuizType } from "@/lib/constants"
import { unlockCategory } from "@/api/apiRoutes"
import { decrementCoins, profileSelector } from "@/redux/reducers/userSlice"
import { firebaseAuth } from "@/lib/firebase"
import { useBattleRoom, type BattleMode } from "@/hooks/useBattleRoom"
import { webSettingsSelector } from "@/redux/reducers/settingsSlice"

const entryFees = [10, 20, 40, 50, 60];

interface CreateRoomProps {
    mode: BattleMode
}

const CreateRoom = ({ mode }: CreateRoomProps) => {

    const { t } = useTranslation();
    const router = useLocalizedRouter();
    const dispatch = useDispatch();
    const queryClient = useQueryClient();
    const profile = useSelector(profileSelector);
    const coins = typeof profile?.total_coins === 'number' ? profile.total_coins : 0;
    const webSettings = useSelector(webSettingsSelector);

    const categoryModeFlag = mode === 'group' ? webSettings?.group_battle_category_mode : webSettings?.one_vs_one_category_mode;
    const isCategoryModeEnabled = categoryModeFlag === '1';

    const { data, isLoading } = useQuery({
        ...categoriesQueryOptions(QuizType.QuizZone),
        enabled: isCategoryModeEnabled,
    });
    const categories: CategoryType[] = (data?.data?.categories ?? [])
        .map(mapCategoryInterfaceToCategoryType);

    const [activeCategory, setActiveCategory] = useState<CategoryType | null>(null);
    const [selectedEntryFee, setSelectedEntryFee] = useState<number | null>(entryFees[1]);
    const [customEntryFee, setCustomEntryFee] = useState<string>("");
    const { authModalOpen, setAuthModalOpen, loginRequiredOpen, setLoginRequiredOpen, guardPlay } = useAuthGate();
    const guestModeKey = mode === 'group' ? 'group_battle_guest_mode' : 'one_vs_one_battle_guest_mode';
    const [creating, setCreating] = useState(false);
    const [showUnlockModal, setShowUnlockModal] = useState(false);
    const [hasEnoughCoins, setHasEnoughCoins] = useState(true);
    const [unlocking, setUnlocking] = useState(false);

    const { roomId, room, createRoom, startGame, cancelRoom, leaveRoom } = useBattleRoom(mode);

    const myIdentity = firebaseAuth.currentUser?.uid ?? '';

    const handleSelectEntryFee = (fee: number) => {
        setSelectedEntryFee(fee)
        setCustomEntryFee("")
    }

    const handleCustomEntryFeeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, "")
        setCustomEntryFee(value)
        setSelectedEntryFee(null)
    }

    const liveCategory = activeCategory ?? categories[0] ?? null;
    const roomEntryFee = selectedEntryFee ?? Number(customEntryFee) ?? 0;
    const isLiveCategoryLocked = isCategoryModeEnabled && !!liveCategory?.coins && !liveCategory?.has_unlocked;

    const proceedCreateRoom = async () => {
        if (roomEntryFee > 0 && roomEntryFee > coins) {
            toast.error(t('notEnoughCoinsForEntry'));
            return;
        }

        const me = {
            uid: myIdentity,
            userId: Number(profile?.id) || 0,
            name: profile?.name ?? '',
            profile: profile?.profile ?? '',
        };

        try {
            setCreating(true);
            await createRoom(me, {
                categoryId: liveCategory?.id ?? 0,
                categoryName: liveCategory?.title ?? '',
                categoryImage: typeof liveCategory?.img === 'string' ? liveCategory.img : null,
                entryFee: roomEntryFee,
            });
        } catch {
            toast.error(t('somethingWentWrong'));
        } finally {
            setCreating(false);
        }
    }

    const handleCreateRoom = () => {
        if (!guardPlay(guestModeKey)) return;
        if (isCategoryModeEnabled && !liveCategory) {
            toast.error(t('somethingWentWrong'));
            return;
        }

        // A category picked from the carousel is already unlocked by CategoryCard's own
        // flow — but liveCategory falls back to categories[0] when nothing was explicitly
        // clicked, which can still be a locked/premium category. Catch that here too.
        if (isLiveCategoryLocked) {
            setHasEnoughCoins(coins >= (liveCategory?.coins ?? 0));
            setShowUnlockModal(true);
            return;
        }

        proceedCreateRoom();
    }

    const handleConfirmUnlock = async () => {
        if (!liveCategory?.id) return;

        try {
            setUnlocking(true);
            await unlockCategory(liveCategory.id);
            dispatch(decrementCoins(liveCategory.coins ?? 0));
            liveCategory.has_unlocked = true;
            queryClient.invalidateQueries({ queryKey: ["categories"] });
            setShowUnlockModal(false);
            await proceedCreateRoom();
        } catch (error) {
            toast.error(getErrorMessage(error, t('somethingWentWrong')));
        } finally {
            setUnlocking(false);
        }
    }

    if (roomId && room) {
        return (
            <BattleRoomLive
                mode={mode}
                room={room}
                roomId={roomId}
                myUid={myIdentity}
                categories={categories}
                onStart={startGame}
                onCancel={cancelRoom}
                onLeave={() => leaveRoom(myIdentity)}
            />
        )
    }

    return (
        <div className="flexCol gap-6">
            <div className='flex flex-col gap-3 mt-4'>
                <Typography variant='h2' weight='medium' className='line-clamp-1'>
                    {t('createRoom')}
                </Typography>
                <Typography variant='subtitle2' weight='regular' className='onSurfaceVarColor! font-nunito! line-clamp-2'>
                    {t('createRoomDesc')}
                </Typography>
            </div>

            {/* categories  */}
            {isCategoryModeEnabled && (
                <Carousel opts={{ align: "start", dragFree: true }} plugins={[WheelGesturesPlugin()]} className="w-full">
                    <CarouselContent className="-ml-3 pb-1">
                        {isLoading
                            ? Array.from({ length: 6 }).map((_, idx) => (
                                <CarouselItem key={idx} className="basis-auto pl-3">
                                    <CategoryCardHorizontalSkeleton />
                                </CarouselItem>
                            ))
                            : categories?.map((cate, idx) => (
                                <CarouselItem key={idx} className="basis-auto pl-3">
                                    <CategoryCard category={cate} onClick={() => setActiveCategory(cate)} horizontalCard={true} isSelected={liveCategory?.id === cate.id} guestModeKey={guestModeKey} />
                                </CarouselItem>
                            ))
                        }
                    </CarouselContent>
                </Carousel>
            )}

            {/* entryFees  */}
            <div className="surfaceContainerLowestBg rounded-2xl p-4 flexCol gap-3 -mt-2">
                <Typography variant="h5" weight="semibold">
                    {t('entryFees')}:
                </Typography>
                <div className="flex flex-wrap items-center gap-3">
                    {entryFees.map((fee) => {
                        const isSelected = selectedEntryFee === fee
                        return (
                            <button
                                key={fee}
                                type="button"
                                role="radio"
                                aria-checked={isSelected}
                                onClick={() => handleSelectEntryFee(fee)}
                                className={`flexCenter gap-1.5 pl-2 pr-4 py-1.5 rounded-full border-2 transition-colors duration-200 ${isSelected ? 'primaryBorder primaryContainerBg' : 'border-transparent surfaceContainerLowBg'}`}
                            >
                                <PremiumCoin width={20} height={20} />
                                <Typography variant="h6" weight="semibold" className="font-nunito!">
                                    {fee}
                                </Typography>
                            </button>
                        )
                    })}
                    <div className="flex-1 min-w-35">
                        <Input
                            fullWidth
                            variant="filled"
                            inputMode="numeric"
                            placeholder={t('enter')}
                            leftIcon={<PremiumCoin width={20} height={20} />}
                            value={customEntryFee}
                            onChange={handleCustomEntryFeeChange}
                            className="rounded-full! surfaceContainerLowBg! dark:text-white!"
                            fillNone
                        />
                    </div>
                </div>
            </div>

            <div className="max-sm:pl-2">
                <Button variant="secondary" onClick={handleCreateRoom} disabled={(isCategoryModeEnabled && !liveCategory) || creating}>
                    {t('createNow')}
                </Button>
            </div>

            <UnlockModal
                message={hasEnoughCoins ? `Use ${liveCategory?.coins ?? 0} ${t('coins')}?` : t('noEnoughCoinsTitle')}
                description={hasEnoughCoins ? undefined : t('noEnoughCoinsDesc')}
                buttonText={hasEnoughCoins ? t('createNow') : t('goToCoinStore')}
                open={showUnlockModal}
                onOpenChange={setShowUnlockModal}
                loading={unlocking}
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
        </div>
    )
}

export default CreateRoom
