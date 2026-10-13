'use client';
import React from 'react';
import { Eye } from 'lucide-react';
import { Typography } from '../../atoms/Typography';
import { ExamCardProps } from './ExamCard.type';
import { Play } from '@/components/common/Icons';

const getOrdinal = (n: number) => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

const formatDate = (iso: string) => {
    const d = new Date(iso);
    const day = getOrdinal(d.getDate());
    const month = d.toLocaleString('en-US', { month: 'short' });
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
};

const ExamCard: React.FC<ExamCardProps> = ({ marks, marksLabel, title, date, questionsCount, className = '', canPlayExam = false, onPlayClick, canReviewExam = false, onReviewClick }) => {
    return (
        <div className={`surfaceContainerLowestBg rounded-2xl p-3 md:p-4 flex items-center ${canPlayExam || canReviewExam ? 'justify-between' : ''} gap-3 md:gap-4 border shadow-[0px_8px_32px_0px_#0000000A] ${className}`}>
            <div className="commonBg rounded-xl flexCol items-center justify-center gap-0.5 shrink-0 w-14 h-14 md:w-16 md:h-16">
                <Typography as="span" variant="h4" weight="bold" className="leading-none onSurfaceColor!">
                    {marks}
                </Typography>
                <Typography as="span" variant="caption" weight="medium" className="font-nunito! onSurfaceVarColor!">
                    {marksLabel}
                </Typography>
            </div>
            <div className="flexCol gap-1 min-w-0">
                <Typography variant="h5" weight="bold" className="line-clamp-2">
                    {title}
                </Typography>
                <Typography as="span" variant="caption" weight="medium" className="font-nunito! onSurfaceVarColor!">
                    {canPlayExam ? `${questionsCount} Questions` : formatDate(date)}
                </Typography>
            </div>
            {
                canPlayExam &&
                <div
                    className="primaryContainerBg rounded-full flexCol items-center justify-center gap-0.5 shrink-0 w-10 h-10 md:w-12 md:h-12 cursor-pointer"
                    onClick={onPlayClick}
                >
                    <Play className='primaryColor' />
                </div>
            }
            {
                canReviewExam &&
                <div
                    className="primaryContainerBg rounded-full flexCol items-center justify-center gap-0.5 shrink-0 w-10 h-10 md:w-12 md:h-12 cursor-pointer"
                    onClick={onReviewClick}
                >
                    <Eye className='primaryColor' width={20} height={20} />
                </div>
            }
        </div>
    );
};

export default ExamCard;
