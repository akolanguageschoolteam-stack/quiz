import OptionCard from "@/components/storybook/molecules/optionCard";
import type { QuizOption } from "./types";

interface ChoicePanelProps {
    options: QuizOption[];
    selected: number | null;
    answerStatus: 'correct' | 'wrong' | null;
    eliminatedOptionIds: number[];
    pollPercentages: Record<number, number> | null;
    isMathManiaPage: boolean;
    isExamPage?: boolean;
    isOptionCorrect: (option: QuizOption) => boolean;
    onSelect: (option: QuizOption, idx: number) => void;
    forceRevealCorrect?: boolean;
    alwaysShowCorrectness?: boolean;
    revealOnSelect?: boolean;
}

const ChoicePanel = ({ options, selected, answerStatus, eliminatedOptionIds, pollPercentages, isMathManiaPage, isExamPage, isOptionCorrect, onSelect, forceRevealCorrect = false, alwaysShowCorrectness = false, revealOnSelect = true }: ChoicePanelProps) => (
    <div className="surfaceContainerLowestBg rounded-[42px] p-4 md:p-6 flexCol gap-4 shadow-[0px_8px_32px_0px_#0000000A]">
        {options.map((opt, idx) => (
            <OptionCard
                key={opt.letter}
                letter={opt.letter}
                label={opt.label}
                selected={selected === idx}
                status={selected === idx ? answerStatus ?? undefined : undefined}
                isCorrectAnswer={(forceRevealCorrect || (revealOnSelect && selected !== null)) && isOptionCorrect(opt)}
                forceRevealCorrect={forceRevealCorrect}
                alwaysShowCorrectness={alwaysShowCorrectness}
                eliminated={eliminatedOptionIds.includes(opt.id)}
                pollPercentage={pollPercentages?.[opt.id]}
                renderAsMath={isMathManiaPage || isExamPage}
                onClick={() => onSelect(opt, idx)}
            />
        ))}
    </div>
);

export default ChoicePanel;
