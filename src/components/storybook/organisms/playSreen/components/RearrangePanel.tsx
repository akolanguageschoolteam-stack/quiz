import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { ChevronUp, ChevronDown, GripVertical } from "lucide-react";
import { Typography } from "@/components/storybook/atoms/Typography";
import { Button } from "@/components/storybook/atoms/Button";
import AnswerFeedbackBanner from "./AnswerFeedbackBanner";
import type { QuizOption } from "./types";

interface RearrangePanelProps {
    options: QuizOption[];
    order: number[];
    correctOrder: number[];
    roundLocked: boolean;
    answerStatus: 'correct' | 'wrong' | null;
    showCorrectness: boolean;
    isReviewMode: boolean;
    onDragEnd: (result: DropResult) => void;
    onMove: (index: number, direction: -1 | 1) => void;
    onConfirm: () => void;
    t: (key: string) => string;
}

const RearrangePanel = ({ options, order, correctOrder, roundLocked, answerStatus, showCorrectness, isReviewMode, onDragEnd, onMove, onConfirm, t }: RearrangePanelProps) => {
    const correctOrderLabel = correctOrder.map((id) => options.find((o) => o.id === id)?.letter ?? '').join('');

    return (
    <div className="surfaceContainerLowestBg rounded-[42px] p-4 md:p-6 flexCol gap-4 shadow-[0px_8px_32px_0px_#0000000A]">
        <AnswerFeedbackBanner
            show={roundLocked && !!answerStatus && showCorrectness}
            status={answerStatus ?? 'correct'}
            label={t(answerStatus === 'correct' ? 'correct' : 'wrong')}
        />
        <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="rearrange-options">
                {(droppableProvided) => (
                    <div
                        ref={droppableProvided.innerRef}
                        {...droppableProvided.droppableProps}
                        className="flexCol -mb-4"
                    >
                        {order.map((optionId, idx) => {
                            const opt = options.find((o) => o.id === optionId);
                            if (!opt) return null;
                            return (
                                <Draggable key={opt.id} draggableId={String(opt.id)} index={idx} isDragDisabled={roundLocked}>
                                    {(draggableProvided, snapshot) => (
                                        <div
                                            ref={draggableProvided.innerRef}
                                            {...draggableProvided.draggableProps}
                                            {...draggableProvided.dragHandleProps}
                                            aria-label={`${opt.letter}. ${opt.label}. Drag to reorder`}
                                            className={`flex items-center gap-3 mb-4 p-3 md:p-4 rounded-2xl surfaceContainerLowBg border-2 border-transparent select-none ${roundLocked ? 'opacity-80' : 'cursor-grab active:cursor-grabbing'} ${snapshot.isDragging ? 'shadow-[0px_8px_32px_0px_#00000033]' : ''}`}
                                        >
                                            <span className="shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full flexCenter primaryBg text-white font-bold font-nunito!">
                                                {opt.letter}
                                            </span>
                                            <Typography variant="h5" className="flex-1 text-base! md:text-xl! font-nunito! onSurfaceColor">
                                                {opt.label}
                                            </Typography>
                                            <div className="flexCol gap-1 shrink-0">
                                                <button type="button" disabled={roundLocked || idx === 0} onClick={() => onMove(idx, -1)} className="disabled:opacity-30" aria-label="Move up">
                                                    <ChevronUp size={18} />
                                                </button>
                                                <button type="button" disabled={roundLocked || idx === order.length - 1} onClick={() => onMove(idx, 1)} className="disabled:opacity-30" aria-label="Move down">
                                                    <ChevronDown size={18} />
                                                </button>
                                            </div>
                                            <span aria-hidden className="shrink-0 w-9 h-9 md:w-8 md:h-8 flexCenter">
                                                <GripVertical className="opacity-40" size={18} />
                                            </span>
                                        </div>
                                    )}
                                </Draggable>
                            );
                        })}
                        {droppableProvided.placeholder}
                    </div>
                )}
            </Droppable>
        </DragDropContext>

        {roundLocked && isReviewMode && !!correctOrderLabel && (
            <Typography variant="h5" weight="bold" className="text-center successColor!">
                {t('correctOrder')} :- {correctOrderLabel}
            </Typography>
        )}

        {!isReviewMode && (
            <Button variant="primary" fullWidth disabled={roundLocked} onClick={onConfirm}>
                {t('checkNow')}
            </Button>
        )}
    </div>
    );
};

export default RearrangePanel;
