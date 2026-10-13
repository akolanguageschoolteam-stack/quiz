'use client'
import { Typography } from "@/components/storybook/atoms/Typography";
import ImagePreview from "@/components/storybook/atoms/ImagePreview";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { FunLearnComprehension, CategoryType } from "@/types/GlobalTypes";
import { useTranslation } from "@/hooks/useTranslation";
import AuthModal from "@/components/auth/AuthModal";
import LoginRequiredModal from "@/components/auth/LoginRequiredModal";
import { useAuthGate } from "@/hooks/useAuthGate";

const TriangleRight = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
        <path d="M6 11L6 4L10.5 7.5L6 11Z" fill="currentColor" />
    </svg>
);

interface ComprehensiveModalProps {
    category: CategoryType | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelectComprehensive: (comprehension: FunLearnComprehension) => void;
}

const ComprehensiveModal = ({ category, open, onOpenChange, onSelectComprehensive }: ComprehensiveModalProps) => {

    const comprehensives = category?.comprehensions ?? [];

    const { t } = useTranslation();
    const { authModalOpen, setAuthModalOpen, loginRequiredOpen, setLoginRequiredOpen, guardPlay } = useAuthGate();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} className="surfaceContainerLowestBg rounded-2xl shadow-[0px_8px_32px_0px_#0000001A] p-4 sm:p-6 md:p-8 flexCol gap-6 w-162 max-w-[calc(100vw-2rem)] h-200 max-h-[calc(100vh-2rem)]">

                {/* Header card */}
                <div className="shrink-0 surfaceContainerLowestBg rounded-3xl border commonBorderB p-4 flexColCenter gap-2 text-center">
                    <div className="w-16 h-16 md:w-20 md:h-20 aspect-square">
                        <ImagePreview src={category?.img} alt={category?.title ?? 'category'} objectFit="contain" containerClassName="w-full h-full" />
                    </div>
                    <DialogTitle asChild>
                        <Typography variant="h2" className="text-4xl! font-normal! font-candal! leading-10! onSurfaceColor">
                            {category?.title}
                        </Typography>
                    </DialogTitle>
                    <DialogDescription asChild>
                        <Typography variant="h6" className="text-2xl! font-normal! font-nunito! leading-8! onSurfaceVarColor">
                            {comprehensives.length} - {t("comprehensives")}
                        </Typography>
                    </DialogDescription>
                </div>

                {/* Comprehensive list — scrolls inside */}
                <div className="flex-1 min-h-0 overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-(--neutral-300)">
                    {comprehensives.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                if (guardPlay('fun_n_learn_guest_mode')) {
                                    onSelectComprehensive(item);
                                }
                            }}
                            className="w-full flex items-center justify-between gap-4 py-4 border-b border-(--neutral-200) cursor-pointer group"
                        >
                            <div className="flexCol gap-1 min-w-0 text-left">
                                <Typography variant="h4" className="text-lg! md:text-xl! font-bold font-nunito! leading-6 onSurfaceColor truncate">
                                    {item.title}
                                </Typography>
                                <Typography variant="h6" className="text-sm! md:text-base! font-medium font-nunito! leading-5 onSurfaceVarColor">
                                    {item.questions_count} {t("questions")}
                                </Typography>
                            </div>
                            <div className="shrink-0 p-2 surfaceContainerLowestBg rounded-[30px] border-b-2 border-(--neutral-200) inline-flex justify-center items-center group-hover:bg-(--neutral-100) dark:group-hover:bg-(--primary-500) duration-300">
                                <TriangleRight className="w-5 h-5 onSurfaceColor" />
                            </div>
                        </button>
                    ))}
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

export default ComprehensiveModal;
