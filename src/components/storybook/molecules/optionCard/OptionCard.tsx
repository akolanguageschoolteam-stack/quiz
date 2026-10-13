'use client';
import React from 'react';
import { Check, X } from 'lucide-react';
import { Typography } from '../../atoms/Typography';
import { OptionCardProps } from './OptionCard.type';
import { useSelector } from 'react-redux';
import { webSettingsSelector } from '@/redux/reducers/settingsSlice';
import MathContent from '@/components/common/MathContent';
import RichTextContent from '@/components/common/RichText';

const OptionCard: React.FC<OptionCardProps> = ({
    letter,
    label,
    selected = false,
    status,
    isCorrectAnswer = false,
    forceRevealCorrect = false,
    alwaysShowCorrectness = false,
    eliminated = false,
    pollPercentage,
    renderAsMath = false,
    selectedBadge,
    onClick,
    className = '',
}) => {

    const setting = useSelector(webSettingsSelector);
    const answerMode = setting?.general_answer_mode;

    const showCorrectness = forceRevealCorrect || alwaysShowCorrectness || answerMode === '1' || answerMode === '3';
    const revealCorrectAnswer = (forceRevealCorrect || alwaysShowCorrectness || answerMode === '3') && isCorrectAnswer && !selected;

    const isSelectedWrong = showCorrectness && selected && status === 'wrong';
    const isSelectedCorrect = showCorrectness && selected && status === 'correct';

    const borderClass = isSelectedWrong
        ? 'surfaceContainerLowestBg border-2 border-(--error-500)!'
        : isSelectedCorrect || revealCorrectAnswer
            ? 'surfaceContainerLowestBg border-2 border-(--success-500)!'
            : selected
                ? 'surfaceContainerLowestBg border-2 border-transparent! primaryBorder'
                : 'surfaceContainerLowBg border-2 border-transparent! hover:primaryBorder';

    const badgeClass = isSelectedWrong
        ? 'errorBg text-white'
        : isSelectedCorrect || revealCorrectAnswer
            ? 'successBg text-white'
            : selected
                ? 'primaryBg text-white'
                : 'surfaceContainerLowestBg onSurfaceColor';


    return (
        <button
            type="button"
            onClick={onClick}
            disabled={eliminated}
            className={`w-full flex items-center gap-4 p-3 md:p-4 rounded-2xl text-left transition-all duration-300 ${borderClass} ${eliminated ? 'opacity-40 pointer-events-none' : ''} ${className}`}
        >
            <span
                className={`shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full flexCenter text-xl md:text-3xl font-normal font-candal leading-7 md:leading-9 transition-all duration-300 ${badgeClass}`}
            >
                {selected ? (isSelectedWrong ? <X size={22} strokeWidth={3} /> : (selectedBadge ?? <Check size={22} strokeWidth={3} />)) : letter}
            </span>
            <div className="flex-1 min-w-0">
                {renderAsMath ? (
                    <MathContent
                        content={label}
                        className="tracking-tight text-base! md:text-2xl! font-semibold md:font-normal font-nunito! md:leading-8 onSurfaceColor line-clamp-2"
                    />
                ) : (
                    <Typography variant="h5" className="text-base! md:text-2xl! font-semibold md:font-normal font-nunito! md:leading-8 onSurfaceColor line-clamp-2">
                        <RichTextContent content={label}/>
                    </Typography>
                )}
                {typeof pollPercentage === 'number' && (
                    <div className="mt-1.5 h-1.5 w-full rounded-full surfaceContainerLowBg overflow-hidden">
                        <div className="h-full primaryBg rounded-full transition-all duration-500" style={{ width: `${pollPercentage}%` }} />
                    </div>
                )}
            </div>
        </button>
    );
};

export default OptionCard;
