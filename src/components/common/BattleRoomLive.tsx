'use client'

import { useEffect, useState } from "react"
import { useLocalizedRouter } from "@/hooks/useLocalizedRouter"
import { useTranslation } from "@/hooks/useTranslation"
import { Typography } from "../storybook/atoms/Typography"
import { Button } from "../storybook/atoms/Button"
import ImagePreview from "../storybook/atoms/ImagePreview"
import { PlayerCard } from "../storybook/molecules/playerCard"
import { Copy, PremiumCoin, Share, LightFlash } from "./Icons"
import cateIcon from '@/assets/cateIcon.png'
import avtar1 from '@/assets/avtars/Avatar.svg'
import guestAvtar from '@/assets/avtars/guest.svg'
import { toast } from "@/lib/toast"
import type { BattleMode, BattleRoomDoc } from "@/hooks/useBattleRoom"
import type { CategoryType } from "@/types/GlobalTypes"


interface BattleRoomLiveProps {
    mode: BattleMode
    room: BattleRoomDoc
    roomId: string
    myUid: string
    starting?: boolean
    // 1v1/random rooms don't store category display metadata in RTDB (matches the
    // app's schema) — resolved locally by room.categoryId against this list instead.
    categories?: CategoryType[]
    onCancel?: () => void | Promise<void>
    onLeave: () => void
    onStart?: () => Promise<void>
}

const BattleRoomLive = ({ mode, room, roomId, myUid, starting, categories, onCancel, onLeave, onStart }: BattleRoomLiveProps) => {

    const { t } = useTranslation();
    const router = useLocalizedRouter();
    const [cancelling, setCancelling] = useState(false);

    const isOwner = room.createdBy === myUid;
    const joinedCount = room.users.filter((u) => u.uid).length;

    const resolvedCategory = categories?.find((c) => c.id === room.categoryId);
    const categoryName = room.categoryName || resolvedCategory?.title || t('quizZone');
    const categoryImage = room.categoryImage || (typeof resolvedCategory?.img === 'string' ? resolvedCategory.img : null);

    useEffect(() => {
        if (!room.readyToPlay) return;
        const routeSlug = mode === 'group' ? 'group-battle' : '1-vs-1-battle';
        router.push(`/play-area/${routeSlug}/play?roomId=${roomId}&roomCode=${room.roomCode}&cate=${room.categoryId}`);
    }, [room.readyToPlay, mode, roomId, room.categoryId, router]);

    const handleCopyRoomId = () => {
        navigator.clipboard?.writeText(room.roomCode)
            .then(() => toast.success(t('roomIdCopied')))
            .catch(() => { })
    }

    const handleStart = async () => {
        try {
            await onStart?.();
        } catch {
            toast.error(t('needAtLeastOnePlayer'));
        }
    }

    const handleCancel = async () => {
        try {
            setCancelling(true);
            await onCancel?.();
        } finally {
            setCancelling(false);
        }
    }

    return (
        <div className="flexCol gap-6 w-full">
            <div className='flex flex-col gap-3 mt-4'>
                <Typography variant='h2' weight='medium' className='line-clamp-1'>
                    {t('roomIsLive')}
                </Typography>
                <Typography variant='subtitle2' weight='regular' className='onSurfaceVarColor! font-nunito! line-clamp-2'>
                    {t('roomIsLiveDesc')}
                </Typography>
            </div>

            <div className="surfaceContainerLowestBg rounded-[32px] p-6 flexCol gap-5">
                <div className="flex items-center justify-between gap-4 flex-wrap pb-5 border-b ">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 md:w-14 md:h-14 shrink-0">
                            <ImagePreview src={categoryImage || cateIcon} alt={categoryName} rounded="2xl" />
                        </div>
                        <div className="flexCol gap-0.5">
                            <Typography variant="h5" weight="semibold">
                                {categoryName}
                            </Typography>
                        </div>
                    </div>
                    <div className="flexCol items-end gap-1">
                        <div className="warningContainerBg py-1 px-2 md:px-3 rounded-xl flexCenter gap-2">
                            <PremiumCoin width={18} height={18} />
                            <Typography variant='h6' weight='semibold' className="font-nunito!">
                                {room.entryFee}
                            </Typography>
                        </div>
                        <Typography variant="caption" weight="medium" className="warningColor! font-nunito!">
                            {t('entryFees')}
                        </Typography>
                    </div>
                </div>

                <div className="flex items-center justify-between gap-4 flex-wrap max-375:justify-center">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={handleCopyRoomId}
                            aria-label={t('roomId')}
                            className="w-12 h-12 rounded-full primaryContainerBg flexCenter shrink-0"
                        >
                            <Copy className="primaryColor" />
                        </button>
                        <div className="flexCol gap-0.5">
                            <Typography variant="h6" weight="medium" className="onSurfaceVarColor! font-nunito!">
                                {t('roomId')}
                            </Typography>
                            <Typography variant="h5" weight="semibold">
                                {room.roomCode}
                            </Typography>
                        </div>
                    </div>
                    <Button
                        type="button"
                        variant="secondaryShade"
                        size="sm"
                        className="rounded-full! border-b-2!"
                        leftIcon={<Share width={16} height={16} />}
                        onClick={handleCopyRoomId}
                    >
                        {t('shareCode')}
                    </Button>
                </div>
            </div>

            {mode === 'group' ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {room.users.map((user, idx) => (
                        user.uid
                            ? <PlayerCard key={idx} avatar={user.profile || avtar1} name={user.uid === myUid ? t('you') : user.name} role={user.uid === room.createdBy ? t('creator') : t('player')} />
                            : <PlayerCard key={idx} avatar={guestAvtar} name={t('waiting')} role={t('player')} muted />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4 md:gap-6 relative">
                    {room.users[0]?.uid
                        ? <PlayerCard avatar={room.users[0].profile || avtar1} name={room.users[0].uid === myUid ? t('you') : room.users[0].name} role={t('creator')} />
                        : <PlayerCard avatar={guestAvtar} name={t('waiting')} role={t('creator')} muted />}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                        <LightFlash width={56} height={78} />
                    </div>
                    {room.users[1]?.uid
                        ? <PlayerCard avatar={room.users[1].profile || avtar1} name={room.users[1].uid === myUid ? t('you') : room.users[1].name} role={t('player')} />
                        : <PlayerCard avatar={guestAvtar} name={t('waiting')} role={t('player')} muted />}
                </div>
            )}

            {isOwner ? (
                <div className="flexCenter gap-4">
                    <Button variant="secondary" onClick={handleStart} disabled={joinedCount < 2 || starting} className="flex-1">
                        {t('startBattle')}
                    </Button>
                    <Button variant="outline" onClick={handleCancel} disabled={cancelling}>
                        {cancelling ? (
                            <div className="flex gap-1">
                                <span className="w-2 h-2 primaryBg rounded-full animate-bounce"></span>
                                <span className="w-2 h-2 primaryBg rounded-full animate-bounce [animation-delay:0.1s]"></span>
                                <span className="w-2 h-2 primaryBg rounded-full animate-bounce [animation-delay:0.3s]"></span>
                                <span className="w-2 h-2 primaryBg rounded-full animate-bounce [animation-delay:0.5s]"></span>
                            </div>
                        ) : t('cancelRoom')}
                    </Button>
                </div>
            ) : (
                <div className="flexCenter">
                    <Button variant="secondary" onClick={onLeave}>
                        {t('leaveRoom')}
                    </Button>
                </div>
            )}
        </div>
    )
}

export default BattleRoomLive
