'use client';
import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store/index';
import { SubmitAnswerResponse, ExamSubmitResponse, BookmarkListItem, BattleResultResponse, BattleQuestion, EncryptedPayload } from '@/types/GlobalTypes';
import { AnswerType } from '@/lib/constants';

interface QuizPlayParams {
    pathname: string | null;
    categoryId: number | null;
    level: string | null;
    funLearnId?: number | null;
    lifelinesUsedCount?: number;
    hintsUsedCount?: number;
    roomId?: string | null;
    roomCode?: string | null;
    isBotMatch?: boolean;
}

interface ExamPlayParams {
    examId: number;
    examCode: number;
    durationMinutes: number;
}

export interface QuizReviewAnswer {
    question_id: number;
    selected_option_id?: number | null;
    selected_option_ids?: number[];
    answer?: string;
}

export interface ReviewQuizQuestion {
    id: number;
    question?: string;
    image: string | null;
    audio: string | null;
    note?: string | null;
    answer_type: AnswerType;
    options: { id: number; text: string; is_correct?: EncryptedPayload; correct_sequence?: EncryptedPayload }[];
    answer?: EncryptedPayload;
}

export interface BookmarksPlaySession {
    quizType: number;
    questions: BookmarkListItem[];
}

interface QuizState {
    selectedTitle: string | null;
    quizResult: SubmitAnswerResponse | ExamSubmitResponse | null;
    quizPlayParams: QuizPlayParams | null;
    quizTimeTakenSeconds: number | null;
    examPlayParams: ExamPlayParams | null;
    quizReviewAnswers: QuizReviewAnswer[] | null;
    // The questions endpoint has no "give me this exact attempt's questions" mode — every
    // call (including the one review mode would otherwise make) can hand back a freshly
    // resampled/reshuffled set. Stashing the exact snapshot shown during play lets review
    // reuse it instead of re-fetching and risking a different question/option set.
    reviewQuizQuestions: ReviewQuizQuestion[] | null;
    selectedContestId: number | null;
    bookmarksPlaySession: BookmarksPlaySession | null;
    battleResult: BattleResultResponse | null;
    // Bot-match questions are only ever handed off once via sessionStorage (see
    // SearchOpponentModal); stashing a copy here lets the review-answers flow
    // re-enter PlayScreen and rebuild the question list without that storage,
    // which is already consumed by the time review is requested.
    botMatchQuestions: BattleQuestion[] | null;
    // Coins for "review answers" are only ever charged once per attempt — this
    // flags that the current quizResult has already been paid for, so re-entering
    // review (e.g. via browser back) doesn't charge again. Reset whenever a new
    // result is set.
    reviewUnlocked: boolean;
    // Display-facing level number (e.g. "Level 3") chosen in LevelModal/SubCategoryModal.
    // The `level` query param passed to PlayScreen is the level's DB id, not this count,
    // so this is stashed separately purely for display on the play screen.
    selectedLevelNo: number | null;
}

const initialState: QuizState = {
    selectedTitle: null,
    quizResult: null,
    quizPlayParams: null,
    quizTimeTakenSeconds: null,
    examPlayParams: null,
    quizReviewAnswers: null,
    reviewQuizQuestions: null,
    selectedContestId: null,
    bookmarksPlaySession: null,
    battleResult: null,
    botMatchQuestions: null,
    reviewUnlocked: false,
    selectedLevelNo: null,
};

export const quizSlice = createSlice({
    name: 'quiz',
    initialState,
    reducers: {
        setSelectedTitle: (state, action: PayloadAction<string>) => {
            state.selectedTitle = action.payload;
        },
        setQuizResult: (state, action: PayloadAction<SubmitAnswerResponse | ExamSubmitResponse | null>) => {
            state.quizResult = action.payload;
            state.reviewUnlocked = false;
        },
        setReviewUnlocked: (state, action: PayloadAction<boolean>) => {
            state.reviewUnlocked = action.payload;
        },
        setQuizPlayParams: (state, action: PayloadAction<QuizPlayParams | null>) => {
            state.quizPlayParams = action.payload;
        },
        setQuizTimeTaken: (state, action: PayloadAction<number | null>) => {
            state.quizTimeTakenSeconds = action.payload;
        },
        setExamPlayParams: (state, action: PayloadAction<ExamPlayParams | null>) => {
            state.examPlayParams = action.payload;
        },
        setQuizReviewAnswers: (state, action: PayloadAction<QuizReviewAnswer[] | null>) => {
            state.quizReviewAnswers = action.payload;
        },
        setReviewQuizQuestions: (state, action: PayloadAction<ReviewQuizQuestion[] | null>) => {
            state.reviewQuizQuestions = action.payload;
        },
        setSelectedContestId: (state, action: PayloadAction<number | null>) => {
            state.selectedContestId = action.payload;
        },
        setBookmarksPlaySession: (state, action: PayloadAction<BookmarksPlaySession | null>) => {
            state.bookmarksPlaySession = action.payload;
        },
        setBattleResult: (state, action: PayloadAction<BattleResultResponse | null>) => {
            state.battleResult = action.payload;
        },
        setBotMatchQuestions: (state, action: PayloadAction<BattleQuestion[] | null>) => {
            state.botMatchQuestions = action.payload;
        },
        setSelectedLevelNo: (state, action: PayloadAction<number | null>) => {
            state.selectedLevelNo = action.payload;
        },
    },
});

export const { setSelectedTitle, setQuizResult, setQuizPlayParams, setQuizTimeTaken, setExamPlayParams, setQuizReviewAnswers, setReviewQuizQuestions, setSelectedContestId, setBookmarksPlaySession, setBattleResult, setBotMatchQuestions, setReviewUnlocked, setSelectedLevelNo } = quizSlice.actions;

export default quizSlice.reducer;

const quizDataSelector = (state: RootState) => state.quiz;

export const selectedTitleSelector = createSelector(quizDataSelector, (state) => state.selectedTitle);
export const quizResultSelector = createSelector(quizDataSelector, (state) => state.quizResult);
export const quizPlayParamsSelector = createSelector(quizDataSelector, (state) => state.quizPlayParams);
export const quizTimeTakenSelector = createSelector(quizDataSelector, (state) => state.quizTimeTakenSeconds);
export const examPlayParamsSelector = createSelector(quizDataSelector, (state) => state.examPlayParams);
export const quizReviewAnswersSelector = createSelector(quizDataSelector, (state) => state.quizReviewAnswers);
export const reviewQuizQuestionsSelector = createSelector(quizDataSelector, (state) => state.reviewQuizQuestions);
export const selectedContestIdSelector = createSelector(quizDataSelector, (state) => state.selectedContestId);
export const bookmarksPlaySessionSelector = createSelector(quizDataSelector, (state) => state.bookmarksPlaySession);
export const battleResultSelector = createSelector(quizDataSelector, (state) => state.battleResult);
export const botMatchQuestionsSelector = createSelector(quizDataSelector, (state) => state.botMatchQuestions);
export const reviewUnlockedSelector = createSelector(quizDataSelector, (state) => state.reviewUnlocked);
export const selectedLevelNoSelector = createSelector(quizDataSelector, (state) => state.selectedLevelNo);
