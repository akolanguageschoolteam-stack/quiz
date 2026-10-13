'use client'
import { Typography } from "@/components/storybook/atoms/Typography";
import ImagePreview from "@/components/storybook/atoms/ImagePreview";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CategoryType } from "@/types/GlobalTypes";
import { LEVEL_PILL_BASE, levelPillClass } from "./levelPillClass";
import { useTranslation } from "@/hooks/useTranslation";
import AuthModal from "@/components/auth/AuthModal";
import LoginRequiredModal from "@/components/auth/LoginRequiredModal";
import { useAuthGate } from "@/hooks/useAuthGate";
import { useSelector } from "react-redux";
import { tokenSelector } from "@/redux/reducers/userSlice";

interface LevelModalProps {
    category: CategoryType | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentLevel?: number;
    onSelectLevel: (level: number, levelNo: number) => void;
    guestModeKey?: string;
}

const LevelModal = ({ category, open, onOpenChange, currentLevel = 1, onSelectLevel, guestModeKey = 'quiz_zone_guest_mode' }: LevelModalProps) => {
    const { authModalOpen, setAuthModalOpen, loginRequiredOpen, setLoginRequiredOpen, openAuthGate } = useAuthGate();
    const token = useSelector(tokenSelector);
    const isLoggedIn = !!token;
    const { t } = useTranslation();
    const total = category?.level_count ?? category?.levels?.length ?? 10;
    const levels = Array.from({ length: total }, (_, i) => {
        const display = i + 1;
        const match = category?.levels?.find((lvl) => lvl.level === display);
        const levelId = match?.id ?? null;
        const locked = !match?.is_unlocked;
        return { display, levelId, locked };
    });

    const handleLevelClick = (levelId: number | null, display: number) => {
        if (!isLoggedIn) {
            openAuthGate(guestModeKey);
            return;
        }
        levelId !== null && onSelectLevel(levelId, display);
    }


    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
                <div className="surfaceContainerLowestBg rounded-2xl shadow-[0px_8px_32px_0px_#0000001A] p-4 sm:p-6 md:p-8 flexCol gap-6 max-h-[calc(100vh-2rem)]">


                    {/* Header card */}
                    <div className="shrink-0 surfaceContainerLowestBg rounded-3xl border commonBorderB p-4 flexColCenter gap-2 text-center">
                        <div className="w-16 h-16 md:w-20 md:h-20 aspect-square">
                            <ImagePreview src={category?.img} alt={category?.title ?? 'category'} objectFit="contain" containerClassName="w-full h-full" />
                        </div>
                        <DialogTitle asChild>
                            <Typography variant="h2" className="lg:text-4xl! font-normal! font-candal! leading-10! onSurfaceColor">
                                {category?.title}
                            </Typography>
                        </DialogTitle>
                        <DialogDescription asChild>
                            <Typography variant="h6" className="lg:text-2xl! font-normal! font-nunito! leading-8! onSurfaceVarColor">
                                {total}- {t('level')}
                            </Typography>
                        </DialogDescription>
                    </div>

                    {/* Levels grid — scrolls inside */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4 flex-1 min-h-0 overflow-y-auto py-2 pr-2 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-(--neutral-300)">
                        {levels.map(({ display, levelId, locked }) => {
                            return (
                                <div key={display}>
                                    <button
                                        disabled={locked}
                                        onClick={() => handleLevelClick(levelId, display)}
                                        className={`${LEVEL_PILL_BASE} ${levelPillClass(display, currentLevel)} ${locked ? 'opacity-60 cursor-not-allowed!' : 'cursor-pointer hover:opacity-90'}`}
                                    >
                                        {t('level')} {display}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </DialogContent>
            <AuthModal open={authModalOpen} onClose={setAuthModalOpen} />
            <LoginRequiredModal
                open={loginRequiredOpen}
                onClose={setLoginRequiredOpen}
                onGuestClick={() => setLoginRequiredOpen(false)}
                onLoginClick={() => { setLoginRequiredOpen(false); setAuthModalOpen(true); }}
            />
        </Dialog>
    );
};

export default LevelModal;
