import { AlarmClock, Bookmark, BookmarkCheck, ChevronDown, Timer, TriangleAlert, Zap } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Chat } from "@/components/common/Icons";
import { Typography } from "@/components/storybook/atoms/Typography";

const formatDuration = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    const units = hrs > 0 ? [hrs, mins, secs] : [mins, secs];
    return units.map((unit) => String(unit).padStart(2, '0')).join(':');
}

const QUICK_CHAT_EMOJIS = ["👍", "🔥", "🎉", "😂", "😮", "😢", "👏", "❤️", "😎", "🤔"];

const QUICK_CHAT_MESSAGES = [
    { id: 1, text: "Hi!" },
    { id: 2, text: "Good luck!" },
    { id: 3, text: "Nice shot!" },
    { id: 4, text: "Well played!" },
    { id: 5, text: "So close!" },
    { id: 6, text: "Oops!" },
    { id: 7, text: "You're on fire!" },
    { id: 8, text: "Nice try!" },
    { id: 9, text: "GG!" },
    { id: 10, text: "Let's go!" },
    { id: 11, text: "Unlucky!" },
    { id: 12, text: "Great game!" },
    { id: 13, text: "Rematch?" },
    { id: 14, text: "Thanks for playing!" },
    { id: 15, text: "See you next time!" },
];

interface StatsBarProps {
    timeLeft: number;
    timerProgress: number;
    current: number;
    totalQuestions: number;
    isBattleScreen: boolean;
    chatOpen: boolean;
    onChatOpenChange: (open: boolean) => void;
    onSendMessage?: (text: string) => void;
    score: number;
    t: (key: string) => string;
    isExamPage?: boolean;
    onOpenAttempts?: () => void;
    isReviewMode?: boolean;
    isBookmarked?: boolean;
    onBookmark?: () => void;
    onReport?: () => void;
    isDailyQuizPage?: boolean;
    isSelfChallengePage?: boolean;
    isFunLearnPage?: boolean;
}

const StatsBar = ({ timeLeft, timerProgress, current, totalQuestions, isBattleScreen, chatOpen, onChatOpenChange, onSendMessage, score, t, isExamPage, onOpenAttempts, isReviewMode, isBookmarked, onBookmark, onReport, isDailyQuizPage, isSelfChallengePage, isFunLearnPage }: StatsBarProps) => {
    if (isReviewMode) {
        return (
            <div className="surfaceContainerLowestBg rounded-2xl p-2 md:p-4 flex items-center justify-between gap-2 md:gap-4 shadow-[0px_8px_32px_0px_#0000000A]">
                <button
                    type="button"
                    onClick={onOpenAttempts}
                    className="rounded-full py-1.5 pl-3 pr-2 md:py-2 md:pl-4 md:pr-3 flex items-center gap-1 md:gap-1.5 shrink-0 cursor-pointer border border-black/10"
                >
                    <Typography variant="h5" weight="regular" className="text-sm! md:text-2xl! font-candal! leading-5 md:leading-8 onSurfaceColor">
                        {current}/{totalQuestions}
                    </Typography>
                    <ChevronDown className="w-4 h-4 md:w-5 md:h-5 onSurfaceVarColor" />
                </button>

                {!isExamPage && (
                    <div className="flex items-center gap-2 md:gap-3 shrink-0">
                        {!isDailyQuizPage && !isSelfChallengePage && !isFunLearnPage && (
                            <button
                                type="button"
                                onClick={onBookmark}
                                aria-label={isBookmarked ? "Remove bookmark" : "Bookmark question"}
                                className={`w-9 h-9 md:w-10 md:h-10 rounded-xl flexCenter cursor-pointer ${isBookmarked ? 'primaryBg' : 'bg-black'}`}
                            >
                                {isBookmarked ? (
                                    <BookmarkCheck className="w-4 h-4 md:w-5 md:h-5 text-white" />
                                ) : (
                                    <Bookmark className="w-4 h-4 md:w-5 md:h-5 text-white" fill="white" />
                                )}
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={onReport}
                            aria-label="Report question"
                            className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-black flexCenter cursor-pointer"
                        >
                            <TriangleAlert className="w-4 h-4 md:w-5 md:h-5 text-white" />
                        </button>
                    </div>
                )}
            </div>
        )
    }

    if (isExamPage || isSelfChallengePage) {
        return (
            <div className="surfaceContainerLowestBg rounded-2xl p-2 md:p-4 flex items-center justify-between gap-2 md:gap-4 shadow-[0px_8px_32px_0px_#0000000A]">
                <div className="errorContainerBg rounded-full py-1.5 pl-1.5 pr-3 md:py-2 md:pl-2 md:pr-4 flexCenter gap-1.5 md:gap-2 shrink-0">
                    <span className="primaryBg w-6 h-6 md:w-7 md:h-7 rounded-full flexCenter shrink-0">
                        <AlarmClock className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
                    </span>
                    <Typography variant="h5" className="text-sm! md:text-2xl! font-extrabold md:font-bold font-nunito! leading-5 md:leading-8 inverseSurfaceColor">
                        {formatDuration(timeLeft)}
                    </Typography>
                </div>

                <button
                    type="button"
                    onClick={onOpenAttempts}
                    className="surfaceContainerLowBg rounded-full py-1.5 pl-3 pr-2 md:py-2 md:pl-4 md:pr-3 flex items-center gap-1 md:gap-1.5 shrink-0 cursor-pointer"
                >
                    <Typography variant="h5" weight="regular" className="text-sm! md:text-2xl! font-candal! leading-5 md:leading-8 inverseSurfaceColor">
                        {current}/{totalQuestions}
                    </Typography>
                    <ChevronDown className="w-4 h-4 md:w-5 md:h-5 onSurfaceVarColor" />
                </button>
            </div>
        )
    }

    return (
        <div className="surfaceContainerLowestBg rounded-2xl p-2 md:p-4 flex items-center gap-2 md:gap-4 shadow-[0px_8px_32px_0px_#0000000A]">
            <div className="primaryContainerBg rounded-full py-1.5 px-3 md:py-2 md:px-4 flexCenter gap-1.5 md:gap-2 shrink-0">
                <Timer className="w-5 h-5 md:w-6 md:h-6 primaryColor" />
                <Typography variant="h5" className="text-sm! md:text-2xl! font-extrabold md:font-normal font-nunito! md:font-candal! leading-5 md:leading-8 inverseSurfaceColor">
                    {timeLeft}
                </Typography>
            </div>

            <div className="flex-1 h-7 md:h-9 primaryFixedBg rounded-full flex flex-col justify-start items-start gap-2.5">
                <div className="self-stretch flex-1 relative overflow-hidden">
                    <div className="h-full left-0 top-0 absolute primaryBg rounded-full border-b-4 border-primary! transition-all duration-500" style={{ width: `${timerProgress}%` }} />
                </div>
            </div>

            <div className="surfaceContainerLowBg rounded-full py-1.5 px-3 md:py-2 md:px-4 shrink-0">
                <Typography variant="h5" weight="regular" className="text-sm! md:text-2xl! font-candal! leading-5 md:leading-8 inverseSurfaceColor">
                    {current}/{totalQuestions}
                </Typography>
            </div>

            {isBattleScreen ? (
                <Popover open={chatOpen} onOpenChange={onChatOpenChange}>
                    <PopoverTrigger asChild>
                        <div className="commonBg rounded-full py-1.5 px-3 md:py-2 md:px-4 flexCenter gap-1.5 md:gap-2 shrink-0 cursor-pointer">
                            <Chat />
                            <Typography variant="h5" weight="regular" className="text-sm! md:text-xl! font-nunito! leading-5 md:leading-7">
                                {t('chat')}
                            </Typography>
                        </div>
                    </PopoverTrigger>
                    <PopoverContent
                        side="bottom"
                        align="end"
                        sideOffset={12}
                        className="surfaceContainerLowestBg onSurfaceColor rounded-3xl shadow-[0px_8px_32px_0px_rgba(0,0,0,0.15)] p-4 flexCol gap-3"
                        onMouseLeave={() => onChatOpenChange(false)}
                    >
                        <div className="flex items-center gap-2 overflow-auto customScrollbar pb-2">
                            {QUICK_CHAT_EMOJIS.map((emoji) => (
                                <button
                                    key={emoji}
                                    type="button"
                                    onClick={() => {
                                        onSendMessage?.(emoji);
                                        onChatOpenChange(false);
                                    }}
                                    className="shrink-0 onSurfaceBg rounded-full w-10 h-10 flexCenter cursor-pointer"
                                >
                                    <span className="text-xl leading-none">{emoji}</span>
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-2 overflow-auto customScrollbar pb-2">
                            <div className="grid grid-rows-2 grid-flow-col gap-3 w-fit">
                                {QUICK_CHAT_MESSAGES.map((msg) => (
                                    <button
                                        key={msg.id}
                                        type="button"
                                        onClick={() => {
                                            onSendMessage?.(msg.text);
                                            onChatOpenChange(false);
                                        }}
                                        className="shrink-0 onSurfaceBg rounded-full py-2 px-4 flexCenter gap-1.5 whitespace-nowrap cursor-pointer"
                                    >
                                        <Typography as="span" variant="h6" weight="semibold" className="font-nunito! surfaceColor!">
                                            {msg.text}
                                        </Typography>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>
            ) : (
                <div className="blueContainerBg rounded-full py-1.5 px-3 md:py-2 md:px-4 flexCenter gap-1.5 md:gap-2 shrink-0">
                    <Zap className="w-5 h-5 md:w-6 md:h-6 blueColor fill-current" />
                    <Typography variant="h5" className="text-sm! md:text-xl! font-extrabold md:font-bold font-nunito! leading-5 md:leading-7 blueColor">
                        {score}
                    </Typography>
                </div>
            )}
        </div>
    )
};

export default StatsBar;
