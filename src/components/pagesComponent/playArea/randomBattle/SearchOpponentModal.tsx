'use client'
import { useEffect, useRef, useState } from "react"
import { useLocalizedRouter } from "@/hooks/useLocalizedRouter"
import { useSelector } from "react-redux"
import { Loader2 } from "lucide-react"
import { PlayerCard } from "@/components/storybook/molecules/playerCard"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import avtar1 from '@/assets/avtars/Avatar.svg'
import guestAvtar from '@/assets/avtars/guest.svg'
import { LightFlash } from "@/components/common/Icons"
import { useTranslation } from "@/hooks/useTranslation"
import { Button } from "@/components/storybook/atoms/Button"
import { Typography } from "@/components/storybook/atoms/Typography"
import { toast } from "@/lib/toast"
import { profileSelector } from "@/redux/reducers/userSlice"
import { webSettingsSelector } from "@/redux/reducers/settingsSlice"
import { firebaseAuth } from "@/lib/firebase"
import { useBattleRoom } from "@/hooks/useBattleRoom"
import type { CategoryType } from "@/types/GlobalTypes"

const DEFAULT_SEARCH_DURATION_SEC = 30
const BOT_QUESTIONS_STORAGE_KEY = 'randomBattleBot'
const MATCH_FOUND_DELAY_MS = 3000

interface SearchOpponentModalProps {
    open: boolean,
    onClose: (open: boolean) => void,
    category: CategoryType | null,
    entryFee: number,
}

const SearchOpponentModal = ({ open, onClose, category, entryFee }: SearchOpponentModalProps) => {

    const { t } = useTranslation();
    const router = useLocalizedRouter();
    const profile = useSelector(profileSelector);
    const webSettings = useSelector(webSettingsSelector);

    const searchDurationSec = (() => {
        const configured = Number(webSettings?.random_battle_opponent_search_duration);
        return Number.isFinite(configured) && configured > 0 ? configured : DEFAULT_SEARCH_DURATION_SEC;
    })();

    const { roomId, room, randomMatchStatus, randomSearchQuestions, searchOpponent, cancelSearch, fetchBotQuestions } = useBattleRoom('1v1');

    // RTDB players/{uid} is keyed by Firebase Auth uid (matches the mobile app's schema);
    // the backend numeric id rides along as BattlePlayer.userId.
    const myIdentity = firebaseAuth.currentUser?.uid ?? '';
    const me = { uid: myIdentity, userId: Number(profile?.id) || 0, name: profile?.name ?? '', profile: profile?.profile ?? '' };

    const [timedOut, setTimedOut] = useState(false);
    const [secondsLeft, setSecondsLeft] = useState(searchDurationSec);
    const [startingBot, setStartingBot] = useState(false);
    const [matchFound, setMatchFound] = useState(false);
    const startedRef = useRef(false);
    const settledRef = useRef(false); // true once matched or handed off to bot — skips the cancel-on-unmount cleanup

    const opponent = room?.users.find((u) => u.uid && u.uid !== myIdentity) ?? null;

    const beginSearch = () => {
        setTimedOut(false);
        setSecondsLeft(searchDurationSec);
        searchOpponent(me, {
            categoryId: category?.id ?? 0,
            categoryName: category?.title ?? '',
            categoryImage: typeof category?.img === 'string' ? category.img : null,
            entryFee,
        });
    }

    useEffect(() => {
        if (!open) {
            startedRef.current = false;
            settledRef.current = false;
            setMatchFound(false);
            return;
        }
        if (startedRef.current) return;
        startedRef.current = true;
        beginSearch();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    useEffect(() => {
        if (!open || timedOut || randomMatchStatus === 'matched') return;
        if (secondsLeft <= 0) {
            setTimedOut(true);
            cancelSearch(myIdentity);
            return;
        }
        const id = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
        return () => clearTimeout(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, timedOut, secondsLeft, randomMatchStatus, cancelSearch]);

    useEffect(() => {
        if (randomMatchStatus !== 'matched' || !roomId || !room) return;
        settledRef.current = true;
        setMatchFound(true);
        const id = setTimeout(() => {
            onClose(false);
            router.push(`/play-area/random-battle/play?roomId=${roomId}&roomCode=${room.roomCode}&cate=${room.categoryId}`);
        }, MATCH_FOUND_DELAY_MS);
        return () => clearTimeout(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [randomMatchStatus, roomId, room?.roomCode, room?.categoryId]);

    // Leaving the page mid-search (not just closing the modal) — clean up whatever this
    // device created, same as a manual cancel.
    useEffect(() => () => {
        if (startedRef.current && !settledRef.current) cancelSearch(myIdentity);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleCancel = () => {
        cancelSearch(myIdentity);
        onClose(false);
    }

    const handleRetry = () => {
        beginSearch();
    }

    const handlePlayWithBot = async () => {
        if (startingBot) return;
        setStartingBot(true);
        try {
            const questions = randomSearchQuestions ?? await fetchBotQuestions({ categoryId: category?.id ?? 0, entryFee });
            if (!questions?.length) throw new Error('NO_QUESTIONS');
            sessionStorage.setItem(BOT_QUESTIONS_STORAGE_KEY, JSON.stringify({
                questions,
                categoryId: category?.id ?? 0,
                categoryName: category?.title ?? '',
                categoryImage: typeof category?.img === 'string' ? category.img : null,
            }));
            settledRef.current = true;
            onClose(false);
            router.push(`/play-area/random-battle/play?bot=1&cate=${category?.id ?? 0}`);
        } catch {
            toast.error(t('somethingWentWrong'));
        } finally {
            setStartingBot(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={(next) => { if (!next) handleCancel(); }}>
            <DialogContent>
                <div className="surfaceBrightBg rounded-[42px] p-8 gap-8 max-h-[calc(100vh-2rem)] overflow-y-auto customScrollbar flexCol">
                    <DialogHeader>
                        <DialogTitle>
                            <Typography variant='h2' weight='medium' className='line-clamp-1'>
                                {t('searchingOpp')}
                            </Typography>
                        </DialogTitle>
                        <DialogDescription>
                            <Typography variant='subtitle2' weight='regular' className='onSurfaceVarColor! font-nunito! line-clamp-2'>
                                {t('searchingOppDesc')}
                            </Typography>
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flexCenter">
                        {matchFound ? (
                            <div className="border rounded-full py-3 px-6">
                                <Typography variant="h6" weight="medium" className="font-nunito! primaryColor">
                                    {t('opponentFound')}
                                </Typography>
                            </div>
                        ) : timedOut ? (
                            <div className="border rounded-full py-3 px-6">
                                <Typography variant="h6" weight="medium" className="font-nunito!">
                                    {t('playerNotFound')} - <span className="primaryColor font-nunito! cursor-pointer" onClick={handleRetry}>{t('tryAgain')}</span>
                                </Typography>
                            </div>
                        ) : (
                            <div className="flexCenter gap-2 border rounded-full py-3 px-6">
                                <Loader2 width={18} height={18} className="animate-spin primaryColor" />
                                <Typography variant="h6" weight="medium" className="font-nunito!">
                                    {t('searchingOpp')} ({secondsLeft}s)
                                </Typography>
                            </div>
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-4 md:gap-6 relative commonBg rounded-3xl p-4">
                        <PlayerCard avatar={profile?.profile || avtar1} name={t('you')} role={t('creator')} />
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                            <LightFlash width={56} height={78} />
                        </div>
                        {opponent ? (
                            <PlayerCard avatar={opponent.profile || guestAvtar} name={opponent.name || t('player')} role={t('player')} />
                        ) : (
                            <PlayerCard avatar={guestAvtar} name={t('waiting')} role={t('player')} muted />
                        )}
                    </div>
                    <div className="flexCol gap-3">
                        {matchFound ? null : timedOut ? (
                            <>
                                <Button variant="primary" fullWidth onClick={handleRetry}>
                                    {t('tryAgain')}
                                </Button>
                                <Button variant="secondary" fullWidth onClick={handlePlayWithBot} disabled={startingBot}>
                                    {t('playWithBot')}
                                </Button>
                            </>
                        ) : (
                            <Button variant="outline" fullWidth onClick={handleCancel}>
                                {t('cancel')}
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default SearchOpponentModal
