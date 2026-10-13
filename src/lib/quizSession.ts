import type { ResponseData, QuizQuestionsResponse } from "@/types/GlobalTypes";

const STORAGE_PREFIX = "quiz-session:";
const MAX_AGE_MS = 2 * 60 * 60 * 1000; // discard stale sessions after 2 hours

export interface PersistedLifelineState {
    fiftyFifty: boolean;
    audiencePoll: boolean;
    resetTimer: boolean;
    skip: boolean;
}

export interface PersistedGuessWordState {
    questionId: number;
    wordSlots: string[];
    tiles: string[];
    usedTileKeys: Record<string, boolean>;
    slotTileKeys: Record<number, string>;
}

export interface PersistedQuizSession {
    savedAt: number;
    currentIndex: number;
    timeLeft: number;
    roundLocked: boolean;
    usedLifelines: PersistedLifelineState;
    skippedQuestionId: number | null;
    eliminatedOptionIds: number[];
    pollPercentages: Record<number, number> | null;
    lifelineUsedThisQuestion: boolean;
    hintsUsedCount: number;
    hintsUsedThisQuestion: number;
    correctCount: number;
    wrongCount: number;
    quizStartTime: number | null;
    answers: { question_id: number; selected_option_id?: number | null; selected_option_ids?: number[]; answer?: string }[];
    quizResponse: ResponseData<QuizQuestionsResponse>;
    examAnswers?: Record<number, number>;
    guessWordState?: PersistedGuessWordState | null;
}

export const getQuizSessionKey = (pathname: string | null, search: string): string =>
    `${STORAGE_PREFIX}${pathname ?? ""}?${search}`;

export const loadQuizSession = (key: string): PersistedQuizSession | null => {
    if (typeof window === "undefined") return null;
    try {
        const raw = window.sessionStorage.getItem(key);
        if (!raw) return null;

        const parsed = JSON.parse(raw) as PersistedQuizSession;
        if (!parsed?.savedAt || Date.now() - parsed.savedAt > MAX_AGE_MS) {
            window.sessionStorage.removeItem(key);
            return null;
        }
        return parsed;
    } catch {
        return null;
    }
};

export const saveQuizSession = (key: string, state: Omit<PersistedQuizSession, "savedAt">): void => {
    if (typeof window === "undefined") return;
    try {
        window.sessionStorage.setItem(key, JSON.stringify({ ...state, savedAt: Date.now() }));
    } catch {
        // sessionStorage unavailable/full — resuming a session is a nicety, not critical
    }
};

export const clearQuizSession = (key: string): void => {
    if (typeof window === "undefined") return;
    try {
        window.sessionStorage.removeItem(key);
    } catch {
        // ignore
    }
};
