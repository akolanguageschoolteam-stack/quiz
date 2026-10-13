'use client'

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { useTranslation } from "@/hooks/useTranslation";
import { Typography } from "../storybook/atoms/Typography"
import { Button } from "../storybook/atoms/Button"
import { OptBox } from "../storybook/molecules/optBox"
import { toast } from "@/lib/toast"
import AuthModal from "@/components/auth/AuthModal"
import LoginRequiredModal from "@/components/auth/LoginRequiredModal"
import { useAuthGate } from "@/hooks/useAuthGate"
import BattleRoomLive from "./BattleRoomLive"
import { profileSelector } from "@/redux/reducers/userSlice"
import { webSettingsSelector } from "@/redux/reducers/settingsSlice"
import { firebaseAuth } from "@/lib/firebase"
import { useBattleRoom, type BattleMode, type BattleRoomError } from "@/hooks/useBattleRoom"
import { categoriesQueryOptions } from "@/api/queries/categories"
import { mapCategoryInterfaceToCategoryType } from "@/lib/categoryMapper"
import { QuizType } from "@/lib/constants"
import type { CategoryType } from "@/types/GlobalTypes"

const ROOM_CODE_LENGTH = 6

interface JoinRoomProps {
    mode: BattleMode
}

const ERROR_MESSAGE_KEY: Record<BattleRoomError, string> = {
    NOT_FOUND: 'invalidRoomCode',
    ROOM_FULL: 'roomFull',
    ALREADY_STARTED: 'roomAlreadyStarted',
    NOT_ENOUGH_COINS: 'notEnoughCoinsForEntry',
    NEED_PLAYER: 'needAtLeastOnePlayer',
    BACKEND_ERROR: 'somethingWentWrong',
    UNKNOWN: 'somethingWentWrong',
}

const JoinRoom = ({ mode }: JoinRoomProps) => {

    const { t } = useTranslation();
    const profile = useSelector(profileSelector);
    const coins = typeof profile?.total_coins === 'number' ? profile.total_coins : 0;
    const webSettings = useSelector(webSettingsSelector);

    // 1v1/random rooms don't carry category display metadata in RTDB (matches the app's
    // schema) — resolved by room.categoryId against this list, same source CreateRoom uses.
    const categoryModeFlag = mode === 'group' ? webSettings?.group_battle_category_mode : webSettings?.one_vs_one_category_mode;
    const isCategoryModeEnabled = categoryModeFlag === '1';
    const { data: categoriesData } = useQuery({
        ...categoriesQueryOptions(QuizType.QuizZone),
        enabled: isCategoryModeEnabled,
    });
    const categories: CategoryType[] = (categoriesData?.data?.categories ?? [])
        .map(mapCategoryInterfaceToCategoryType);

    const [roomCode, setRoomCode] = useState<string[]>(Array(ROOM_CODE_LENGTH).fill(''))
    const { authModalOpen, setAuthModalOpen, loginRequiredOpen, setLoginRequiredOpen, guardPlay } = useAuthGate();
    const guestModeKey = mode === 'group' ? 'group_battle_guest_mode' : 'one_vs_one_battle_guest_mode';
    const [joining, setJoining] = useState(false);

    const { roomId, room, joinRoom, leaveRoom } = useBattleRoom(mode);
    // RTDB players/{uid} is keyed by Firebase Auth uid (matches the mobile app's schema)
    // for every battle mode; the backend numeric id rides along as BattlePlayer.userId.
    const myIdentity = firebaseAuth.currentUser?.uid ?? '';

    const handleJoinRoom = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!guardPlay(guestModeKey)) return;

        const me = {
            uid: myIdentity,
            userId: Number(profile?.id) || 0,
            name: profile?.name ?? '',
            profile: profile?.profile ?? '',
        };

        try {
            setJoining(true);
            await joinRoom(me, coins, roomCode.join(''));
        } catch (error) {
            const code = (error instanceof Error ? error.message : 'UNKNOWN') as BattleRoomError;
            toast.error(t(ERROR_MESSAGE_KEY[code] ?? ERROR_MESSAGE_KEY.UNKNOWN));
        } finally {
            setJoining(false);
        }
    }

    const isRoomCodeComplete = roomCode.every(digit => digit !== '')

    if (roomId && room) {
        return (
            <BattleRoomLive
                mode={mode}
                room={room}
                roomId={roomId}
                myUid={myIdentity}
                categories={categories}
                onLeave={() => leaveRoom(myIdentity)}
            />
        )
    }

    return (
        <form onSubmit={handleJoinRoom} className="flexColCenter text-center gap-8 w-full h-full my-auto">
            <div className="flexColCenter text-center gap-2">
                <Typography variant="h2" weight="medium">
                    {t('enterRoomCode')}
                </Typography>
                <Typography variant="subtitle2" weight="regular" className="onSurfaceVarColor! font-nunito!">
                    {t('enterRoomCodeDesc')}
                </Typography>
            </div>

            <OptBox length={ROOM_CODE_LENGTH} value={roomCode} onChange={setRoomCode} ariaLabel="Room code digit" emptyBg="surfaceDimBg" />

            <Button variant="secondary" type="submit" disabled={!isRoomCodeComplete || joining} className="px-10!">
                {t('joinNow')}
            </Button>

            <AuthModal open={authModalOpen} onClose={setAuthModalOpen} />
            <LoginRequiredModal
                open={loginRequiredOpen}
                onClose={setLoginRequiredOpen}
                onGuestClick={() => setLoginRequiredOpen(false)}
                onLoginClick={() => { setLoginRequiredOpen(false); setAuthModalOpen(true); }}
            />
        </form>
    )
}

export default JoinRoom
