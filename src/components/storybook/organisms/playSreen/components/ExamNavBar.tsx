import { SkipBack, SkipForward } from "lucide-react";

interface ExamNavBarProps {
    canGoPrev: boolean;
    canGoNext: boolean;
    onPrev: () => void;
    onNext: () => void;
}

const ExamNavBar = ({ canGoPrev, canGoNext, onPrev, onNext }: ExamNavBarProps) => (
    <div className="flexCenter commonMT">
        <div className="flexCenter surfaceContainerLowestBg py-2 px-3 rounded-3xl gap-3 shadow-[0px_8px_32px_0px_#0000000A]">
            <button
                type="button"
                aria-label="Previous question"
                disabled={!canGoPrev}
                onClick={onPrev}
                className="w-10 h-10 md:w-12 md:h-12 rounded-full flexCenter surfaceContainerLowBg disabled:opacity-40 disabled:pointer-events-none"
            >
                <SkipBack className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" />
            </button>
            <button
                type="button"
                aria-label="Next question"
                disabled={!canGoNext}
                onClick={onNext}
                className="w-10 h-10 md:w-12 md:h-12 rounded-full flexCenter surfaceContainerLowBg disabled:opacity-40 disabled:pointer-events-none"
            >
                <SkipForward className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" />
            </button>
        </div>
    </div>
);

export default ExamNavBar;
