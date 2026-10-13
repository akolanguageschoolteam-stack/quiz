'use client'
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import type { DropResult } from "@hello-pangea/dnd";
import Layout from "@/components/layout/Layout";
import { Skeleton } from "@/components/ui/skeleton";
import QuestionsOptsSkeleton from "@/components/skeltons/QuestionsOptsSkeleton";
import { Button } from "@/components/storybook/atoms/Button";
import { useTranslation } from "@/hooks/useTranslation";
import { Typography } from "@/components/storybook/atoms/Typography";
import { Coin, Erase, FiftyFifty, Hint, ResetTimer, Skip, UserPoll } from "@/components/common/Icons";
import { quizQuestionsQueryOptions } from "@/api/queries/questions";
import { funLearnQuestionsQueryOptions } from "@/api/queries/funLearn";
import { examAnswerKeyQueryOptions, examModuleQuestionsQueryOptions } from "@/api/queries/exams";
import { contestQuestionsQueryOptions } from "@/api/queries/contests";
import { submitQuizAnswer, submitFunLearnAnswer, submitGuessWordAnswer, submitExamAnswers, submitContestAnswer, submitCoinScore, submitBookmark, checkBookmarks, fetchBattleRoomQuestions } from "@/api/apiRoutes";
import { getContentTypeId } from "@/api/apiMiddleware";
import { SLUG_QUESTIONS_ENDPOINT_MAP, QuizType, AnswerType } from "@/lib/constants";
import { getLifelineTier } from "@/lib/lifelines";
import { getQuizSessionKey, loadQuizSession, saveQuizSession, clearQuizSession } from "@/lib/quizSession";
import { decryptAnswer } from "@/lib/helper";
import { firebaseAuth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useDispatch, useSelector } from "react-redux";
import { webSettingsSelector } from "@/redux/reducers/settingsSlice";
import { setQuizResult, setQuizPlayParams, setQuizTimeTaken, examPlayParamsSelector, setQuizReviewAnswers, quizReviewAnswersSelector, setReviewQuizQuestions, reviewQuizQuestionsSelector, setSelectedContestId, bookmarksPlaySessionSelector, setBookmarksPlaySession, setBattleResult, botMatchQuestionsSelector, setBotMatchQuestions, selectedLevelNoSelector } from "@/redux/reducers/quizSlice";
import { decrementCoins, profileSelector } from "@/redux/reducers/userSlice";
import { soundEffectsEnabledSelector } from "@/redux/reducers/preferencesSlice";


const rightSoundSrc = "/audios/right.mp3";
const wrongSoundSrc = "/audios/wrong.mp3";
import { withAuthGuard } from "@/hoc/authguard";
import { useBattleRoom } from "@/hooks/useBattleRoom";
import type { BattleSubmitAnswer } from "@/types/GlobalTypes";
import StatsBar from "./components/StatsBar";
import QuestionCard from "./components/QuestionCard";
import GuessWordPanel from "./components/GuessWordPanel";
import RearrangePanel from "./components/RearrangePanel";
import MultiSelectPanel from "./components/MultiSelectPanel";
import ChoicePanel from "./components/ChoicePanel";
import LifelineBar from "./components/LifelineBar";
import ExamNavBar from "./components/ExamNavBar";
import BattleSection, { type BattlePlayerView } from "./components/BattleSection";
import MyAttemptsModal from "@/components/modals/MyAttemptsModal";
import ReportQuestionModal from "@/components/modals/ReportQuestionModal";
import type { QuizOption } from "./components/types";
import type { BattleQuestion, EncryptedPayload, SubmitAnswerResponse } from "@/types/GlobalTypes";
import { getErrorMessage } from "@/utils/errorMessages";
import { useLocalizedRouter } from "@/hooks/useLocalizedRouter";

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

const shuffleLetters = (letters: string[]): string[] => {
    const arr = [...letters];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
};

const NEXT_QUESTION_DELAY_MS = 1500;
const DEFAULT_QUIZ_DURATION_SEC = 30;


const afterNextPaint = (fn: () => void) => {
    requestAnimationFrame(() => {
        requestAnimationFrame(fn);
    });
};


const afterMinHold = (answeredAtMs: number, minMs: number, fn: () => void) => {
    const deadline = answeredAtMs + minMs;
    const step = () => {
        if (performance.now() >= deadline) afterNextPaint(fn);
        else requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
};

const BATTLE_QUESTION_TYPE_TO_ANSWER_TYPE: Record<number, AnswerType> = {
    1: AnswerType.Single,
    2: AnswerType.Single,
    3: AnswerType.MultiSelect,
    4: AnswerType.Rearrange,
};

interface PlayScreenProps {
    moduleType: QuizType;
}

const PlayScreen = () => {

    const [bookmarkedQuestionIds, setBookmarkedQuestionIds] = useState<Set<number>>(new Set());
    const [firebaseUid, setFirebaseUid] = useState(() => firebaseAuth.currentUser?.uid ?? null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => setFirebaseUid(user?.uid ?? null));
        return unsubscribe;
    }, []);

    const { t } = useTranslation();
    const router = useLocalizedRouter();
    const queryClient = useQueryClient();
    const pathname = usePathname();
    const params = useParams<{ slug: string }>();
    const searchParams = useSearchParams();

    const isTrueFalsePage = params.slug === 'true-or-false'
    const isBookmarksPlayPage = params.slug === 'bookmarks'
    const bookmarksPlaySession = useSelector(bookmarksPlaySessionSelector);
    const bookmarksQuizType = bookmarksPlaySession?.quizType ?? null;

    const sessionKey = getQuizSessionKey(pathname, searchParams.toString());
    // Pure read (no mutation) — React StrictMode's dev-only double-mount runs this lazy
    // initializer twice, once for a discarded fiber and once for the kept one. A version
    // that "consumes" a one-shot flag as a side effect would have the discarded call eat
    // the flag, leaving the kept mount to see it already used and silently skip restoring
    // — which is exactly why every refresh looked like it reset the quiz.
    const isHardReload = () => {
        if (typeof window === "undefined" || !window.performance) return false;
        const [nav] = window.performance.getEntriesByType?.("navigation") ?? [];
        return nav ? (nav as PerformanceNavigationTiming).type === "reload" : window.performance.navigation?.type === 1;
    };
    const [restored] = useState(() => (isTrueFalsePage || isBookmarksPlayPage || !isHardReload()) ? null : loadQuizSession(sessionKey));

    const lifelineTier = getLifelineTier(params.slug);
    const hasFullLifeLines = lifelineTier === 'full';
    const isGroupBattlePage = pathname?.includes('group-battle')
    const isOneVsOnePage = pathname?.includes('1-vs-1-battle') ?? false
    const isRandomBattlePage = pathname?.includes('random-battle') ?? false
    const isBotMatch = isRandomBattlePage && searchParams.get('bot') === '1'
    const isLiveBattleMatch = isOneVsOnePage || isGroupBattlePage || (isRandomBattlePage && !isBotMatch)
    const isAnyBattleMatchPage = isLiveBattleMatch || isBotMatch
    const isBattlePage = isGroupBattlePage || isOneVsOnePage || isRandomBattlePage
    const roomCode = searchParams.get('roomCode') ?? ''
    const roomIdParam = searchParams.get('roomId') ?? ''
    const isGuessTheWordPage = pathname?.includes('guess-the-word') || (isBookmarksPlayPage && bookmarksQuizType === QuizType.GuessWord)
    const isMathManiaPage = params.slug === 'math-mania' || (isBookmarksPlayPage && bookmarksQuizType === QuizType.Math)
    const isFunLearnPage = params.slug === 'fun-and-learn'
    const isAudioQuizPage = params.slug === 'audio-quiz' || (isBookmarksPlayPage && bookmarksQuizType === QuizType.Audio)
    const isMultiMatchPage = params.slug === 'multi-match' || (isBookmarksPlayPage && bookmarksQuizType === QuizType.MultiMatch)
    const isDailyQuizPage = params.slug === 'daily-quiz'
    const isExamPage = pathname?.includes('/play-area/exams/play') ?? false
    const isContestPage = pathname?.includes('/play-area/contest-play/play') ?? false
    const contestId = Number(searchParams.get('id')) || 0
    const isReviewMode = searchParams.get('review') === '1';
    const showLifeLine = lifelineTier !== 'none' && !isExamPage && !isReviewMode && !isContestPage && !isBattlePage;
    const level = searchParams.get('level')
    const selectedLevelNo = useSelector(selectedLevelNoSelector);
    const examId = Number(searchParams.get('id')) || 0;
    const examPlayParams = useSelector(examPlayParamsSelector);
    const examCode = examPlayParams?.examCode ?? 0;
    const examDurationMinutes = examPlayParams?.durationMinutes ?? 0;
    const webSettings = useSelector(webSettingsSelector)
    const answerMode = webSettings?.general_answer_mode;


    const showCorrectness = answerMode === '1' || answerMode === '3';
    const profile = useSelector(profileSelector)
    const coins = typeof profile?.total_coins === 'number' ? profile.total_coins : 0
    const dispatch = useDispatch()
    const soundEffectsEnabled = useSelector(soundEffectsEnabledSelector)

    const rightAudioRef = useRef<HTMLAudioElement | null>(null);
    const wrongAudioRef = useRef<HTMLAudioElement | null>(null);
    useEffect(() => {
        rightAudioRef.current = new Audio(rightSoundSrc);
        wrongAudioRef.current = new Audio(wrongSoundSrc);
    }, []);


    const playAnswerFeedback = (isCorrect: boolean) => {
        if (isExamPage || isContestPage) return;
        if (answerMode === '2') {
            if (typeof navigator !== 'undefined') navigator.vibrate?.(50);
            return;
        }
        if (!soundEffectsEnabled) return;
        const audio = isCorrect ? rightAudioRef.current : wrongAudioRef.current;
        if (!audio) return;
        audio.currentTime = 0;
        audio.play().catch(() => { });
    };


    const myIdentity = firebaseUid ?? ''
    const { room: battleRoom, attachToRoom, submitOneVsOneAnswer, leaveRoom: leaveBattleRoom, submitResults, messages: battleMessages, sendBattleMessage } = useBattleRoom(isGroupBattlePage ? 'group' : '1v1')

    useEffect(() => {
        if (isLiveBattleMatch && roomIdParam && myIdentity) {
            battleOwnAnswersRef.current = [];
            attachToRoom(roomIdParam, myIdentity)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLiveBattleMatch, roomIdParam, myIdentity])


    const entryFeeChargedRef = useRef(false);
    useEffect(() => {
        if (!isLiveBattleMatch || !battleRoom || entryFeeChargedRef.current) return;
        entryFeeChargedRef.current = true;

        const amount = battleRoom.entryFee;
        if (!amount) return;

        const battleTypeLabel = isRandomBattlePage ? 'Random Battle' : isGroupBattlePage ? 'Group Battle' : '1v1 Battle';
        submitCoinScore({
            amount,
            source: 'battle_entry',
            description: `Battle entry fee - ${battleTypeLabel}`,
        })
            .then(() => dispatch(decrementCoins(amount)))
            .catch((error) => console.error("Failed to deduct battle entry fee:", error));
    }, [isLiveBattleMatch, battleRoom, isRandomBattlePage, isGroupBattlePage, dispatch]);

    useEffect(() => {
        if (!isLiveBattleMatch || !battleMessages.length) return;
        const last = battleMessages[battleMessages.length - 1];
        if (!last.by || last.id === lastBattleMessageIdRef.current) return;
        lastBattleMessageIdRef.current = last.id;
        setBattleBubbles((prev) => ({ ...prev, [last.by]: last.message }));
        const timer = setTimeout(() => {
            setBattleBubbles((prev) => {
                if (prev[last.by] !== last.message) return prev;
                const next = { ...prev };
                delete next[last.by];
                return next;
            });
        }, 3000);
        return () => clearTimeout(timer);
    }, [battleMessages, isLiveBattleMatch])

    const [botQuestions, setBotQuestions] = useState<BattleQuestion[] | null>(null);
    const [botMeta, setBotMeta] = useState<{ categoryId: number; categoryName: string; categoryImage: string | null } | null>(null);
    const botMatchQuestions = useSelector(botMatchQuestionsSelector);

    const botQuestionsConsumedRef = useRef(false);
    useEffect(() => {
        if (!isBotMatch || botQuestionsConsumedRef.current) return;

        if (isReviewMode) {
            if (!botMatchQuestions?.length) {
                router.replace(`/play-area/random-battle`);
                return;
            }
            botQuestionsConsumedRef.current = true;
            setBotQuestions(botMatchQuestions);
            return;
        }

        try {
            const raw = sessionStorage.getItem('randomBattleBot');
            const parsed = raw
                ? JSON.parse(raw) as { questions: BattleQuestion[]; categoryId: number; categoryName: string; categoryImage: string | null }
                : null;
            if (!parsed?.questions?.length) {
                router.replace(`/play-area/random-battle`);
                return;
            }
            botQuestionsConsumedRef.current = true;
            setBotQuestions(parsed.questions);
            setBotMeta({ categoryId: parsed.categoryId, categoryName: parsed.categoryName, categoryImage: parsed.categoryImage });
            dispatch(setBotMatchQuestions(parsed.questions));
            quizStartTimeRef.current = Date.now();
            sessionStorage.removeItem('randomBattleBot');
        } catch {
            router.replace(`/play-area/random-battle`);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isBotMatch, isReviewMode]);
    const storedReviewAnswers = useSelector(quizReviewAnswersSelector);
    const storedReviewQuestions = useSelector(reviewQuizQuestionsSelector);
    // The questions endpoint can hand back a freshly resampled/reshuffled set on every call
    // (no "give me this exact attempt" mode) — re-fetching for review risked showing
    // different questions/options than what was actually answered, with genuinely-attempted
    // questions rendering as unattempted. Reuse the exact snapshot saved at submit time
    // instead, when one is available for this attempt.
    const hasReviewQuestionsSnapshot = isReviewMode && !!storedReviewQuestions?.length;

    // Belt-and-suspenders: catches any path back into a fresh (non-review) PlayScreen that
    // isn't already covered by the close-button/nav-link cleanup, so a stale snapshot from
    // an earlier attempt can never leak into some later, unrelated review.
    useEffect(() => {
        if (isReviewMode) return;
        dispatch(setQuizReviewAnswers(null));
        dispatch(setReviewQuizQuestions(null));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const reviewAnswersMap = useMemo(
        () => new Map((isReviewMode ? storedReviewAnswers : null)?.map((a) => [a.question_id, a]) ?? []),
        [isReviewMode, storedReviewAnswers]
    );

    const getExpectedRearrangeOrder = (opts: { id: number; correct_sequence?: EncryptedPayload }[]) => {
        const firebaseId = firebaseAuth.currentUser?.uid ?? "";
        return [...opts]
            .sort((a, b) => {
                const seqA = a.correct_sequence ? Number(decryptAnswer(a.correct_sequence, firebaseId)) : 0;
                const seqB = b.correct_sequence ? Number(decryptAnswer(b.correct_sequence, firebaseId)) : 0;
                return seqA - seqB;
            })
            .map((opt) => opt.id);
    };

    const scoreModulePrefix = isMathManiaPage
        ? 'math_quiz'
        : isMultiMatchPage
            ? 'multi_match_quiz'
            : isAudioQuizPage
                ? 'audio_quiz'
                : isGuessTheWordPage
                    ? 'guess_the_word'
                    : isFunLearnPage
                        ? 'fun_n_learn'
                        : isDailyQuizPage
                            ? 'daily_quiz'
                            : 'quiz_zone';
    const creditPerCorrectAnswer = Number(webSettings?.[`${scoreModulePrefix}_correct_answer_credit`]) || 0;
    const deductPerWrongAnswer = Number(webSettings?.[`${scoreModulePrefix}_wrong_answer_deduct`]) || 0;

    const reportQuestionType = isMathManiaPage
        ? 'math_quiz'
        : isMultiMatchPage
            ? 'multi_match'
            : isAudioQuizPage
                ? 'audio'
                : isGuessTheWordPage
                    ? 'guess_word'
                    : isFunLearnPage
                        ? 'fun_n_learn'
                        : 'quiz_zone';

    const categoryId = Number(searchParams.get('cate')) || 0;
    const funLearnId = Number(searchParams.get('fun_n_learn_id')) || 0;
    const questionsEndpoint = SLUG_QUESTIONS_ENDPOINT_MAP[params.slug] ?? params.slug;
    const isSelfChallenge = params.slug === 'self-challenge';
    const contentTypeId = getContentTypeId();
    const questionsPayload = {
        ...(isTrueFalsePage || isDailyQuizPage
            ? {}
            : isSelfChallenge
                ? { category_id: categoryId, limit: Number(searchParams.get('limit')) || 10 }
                : { category_id: categoryId, level_id: level ? Number(level) : null }),
        ...(contentTypeId != null ? { content_type_id: contentTypeId } : {}),
    };

    const [selected, setSelected] = useState<number | null>(null);
    const [answerStatus, setAnswerStatus] = useState<'correct' | 'wrong' | null>(null);
    const [audioFinished, setAudioFinished] = useState(false);
    const [chatOpen, setChatOpen] = useState(false);
    const [battleBubbles, setBattleBubbles] = useState<Record<string, string>>({});
    const lastBattleMessageIdRef = useRef<string | null>(null);
    const [groupWaitingForOthers, setGroupWaitingForOthers] = useState(false);
    const [attemptsModal, setAttemptsModal] = useState(false);
    const [reportModal, setReportModal] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(() => restored?.currentIndex ?? 0);
    const [roundLocked, setRoundLocked] = useState(() => isReviewMode || (restored?.roundLocked ?? false));
    const [correctCount, setCorrectCount] = useState(() => restored?.correctCount ?? 0);
    const [wrongCount, setWrongCount] = useState(() => restored?.wrongCount ?? 0);
    const score = Math.max(0, correctCount * creditPerCorrectAnswer - wrongCount * deductPerWrongAnswer);

    // Lifelines: each usable once per quiz session
    const [usedLifelines, setUsedLifelines] = useState(() => restored?.usedLifelines ?? {
        fiftyFifty: false,
        audiencePoll: false,
        resetTimer: false,
        skip: false,
    });
    const [eliminatedOptionIds, setEliminatedOptionIds] = useState<number[]>(() => restored?.eliminatedOptionIds ?? []);
    const [pollPercentages, setPollPercentages] = useState<Record<number, number> | null>(() => restored?.pollPercentages ?? null);
    const [skippedQuestionId, setSkippedQuestionId] = useState<number | null>(() => restored?.skippedQuestionId ?? null);
    const [lifelineUsedThisQuestion, setLifelineUsedThisQuestion] = useState(() => restored?.lifelineUsedThisQuestion ?? false);

    const [guessWord, setGuessWord] = useState('');
    const [guessWordTiles, setGuessWordTiles] = useState<string[]>([]);
    const [wordSlots, setWordSlots] = useState<string[]>([]);
    const [usedTileKeys, setUsedTileKeys] = useState<Record<string, boolean>>({});
    const [slotTileKeys, setSlotTileKeys] = useState<Record<number, string>>({});
    const restoredGuessWordStateRef = useRef(restored?.guessWordState ?? null);
    const guessWordSetupQuestionIdRef = useRef<number | null>(null);
    const [hintsUsedCount, setHintsUsedCount] = useState(() => restored?.hintsUsedCount ?? 0);
    const [hintsUsedThisQuestion, setHintsUsedThisQuestion] = useState(() => restored?.hintsUsedThisQuestion ?? 0);
    const isWordComplete = wordSlots.length > 0 && wordSlots.every((letter) => letter !== '');
    const guessWordTileRows = useMemo(() => (guessWordTiles.length ? [guessWordTiles] : []), [guessWordTiles]);

    const maxHintsPerQuestion = useMemo(() => {
        const val = Number(webSettings?.guess_the_word_max_hint_per_question);
        return Number.isFinite(val) && val >= 0 ? val : Infinity;
    }, [webSettings]);

    const hintAvailable = hintsUsedThisQuestion < maxHintsPerQuestion;

    const [rearrangeOrder, setRearrangeOrder] = useState<number[]>([]);
    const [multiSelectedIds, setMultiSelectedIds] = useState<number[]>([]);
    const [examAnswers, setExamAnswers] = useState<Record<number, number>>(() => restored?.examAnswers ?? {});

    const quizDuration = useMemo(() => {
        if (isExamPage) return examDurationMinutes > 0 ? examDurationMinutes * 60 : DEFAULT_QUIZ_DURATION_SEC;
        if (isSelfChallenge) {
            const val = Number(searchParams.get('duration'));
            return Number.isFinite(val) && val > 0 ? val : DEFAULT_QUIZ_DURATION_SEC;
        }
        const settingKey = isContestPage
            ? 'contest_question_duration'
            : isGroupBattlePage
                ? 'group_battle_duration'
                : isOneVsOnePage
                    ? 'one_vs_one_duration'
                    : isRandomBattlePage
                        ? 'random_battle_duration'
                        : `${scoreModulePrefix}_duration`;
        const val = Number(webSettings?.[settingKey]);
        return Number.isFinite(val) && val > 0 ? val : DEFAULT_QUIZ_DURATION_SEC;
    }, [webSettings, isExamPage, examDurationMinutes, isSelfChallenge, searchParams, isContestPage, isGroupBattlePage, isOneVsOnePage, isRandomBattlePage, scoreModulePrefix]);

    const [timeLeft, setTimeLeft] = useState(() => restored?.timeLeft ?? quizDuration);
    const hasRestoredQuizResponse = !!restored?.quizResponse;

    const { data, isLoading: isQuizLoading, isError: isQuizError, error: quizErrorObj } = useQuery({
        ...quizQuestionsQueryOptions(questionsEndpoint, questionsPayload),
        enabled: (isTrueFalsePage || isDailyQuizPage || isSelfChallenge || !!categoryId) && !isFunLearnPage && !isExamPage && !isBookmarksPlayPage && !isAnyBattleMatchPage && !hasReviewQuestionsSnapshot,
        initialData: restored?.quizResponse,
        staleTime: hasRestoredQuizResponse ? Infinity : 0,
        refetchOnMount: hasRestoredQuizResponse ? undefined : 'always',
    });

    const { data: funLearnData, isLoading: isFunLearnLoading, isError: isFunLearnError, error: funLearnErrorObj } = useQuery({
        ...funLearnQuestionsQueryOptions(funLearnId),
        enabled: isFunLearnPage && !!funLearnId,
    });

    const { data: examData, isLoading: isExamLoading, isError: isExamError, error: examErrorObj } = useQuery({
        ...examModuleQuestionsQueryOptions({ exam_module_id: examId, exam_code: examCode }),
        enabled: isExamPage && !isReviewMode && !!examId,
        initialData: restored?.quizResponse,
        staleTime: Infinity,
    });

    const { data: examAnswerKeyData, isLoading: isExamAnswerKeyLoading, isError: isExamAnswerKeyError, error: examAnswerKeyErrorObj } = useQuery({
        ...examAnswerKeyQueryOptions(examId),
        enabled: isExamPage && isReviewMode && !!examId,
    });

    const { data: contestData, isLoading: isContestLoading, isError: isContestError, error: contestErrorObj } = useQuery({
        ...contestQuestionsQueryOptions(contestId),
        enabled: isContestPage && !!contestId,
        staleTime: Infinity,
    });

    const { data: battleData, isLoading: isBattleLoading, isError: isBattleError, error: battleErrorObj } = useQuery({
        queryKey: ['battle-room-questions', roomCode],
        queryFn: async () => (await fetchBattleRoomQuestions({ room_code: roomCode })).data,
        enabled: isLiveBattleMatch && !!roomCode,
        staleTime: Infinity,
        // fetchBattleRoomQuestions already toasts its own error — a retry would just replay it.
        retry: false,
    });

    const isLoading = isBookmarksPlayPage ? false : isExamPage ? (isReviewMode ? isExamAnswerKeyLoading : isExamLoading) : isFunLearnPage ? isFunLearnLoading : isContestPage ? isContestLoading : isBotMatch ? botQuestions === null : isLiveBattleMatch ? isBattleLoading : isQuizLoading;

    const isError = isBookmarksPlayPage ? !bookmarksPlaySession?.questions?.length : isExamPage ? (isReviewMode ? isExamAnswerKeyError : isExamError) : isFunLearnPage ? isFunLearnError : isContestPage ? isContestError : isBotMatch ? false : isLiveBattleMatch ? isBattleError : isQuizError;

    const queryError = isBookmarksPlayPage ? null : isExamPage ? (isReviewMode ? examAnswerKeyErrorObj : examErrorObj) : isFunLearnPage ? funLearnErrorObj : isContestPage ? contestErrorObj : isBotMatch ? null : isLiveBattleMatch ? battleErrorObj : quizErrorObj;

    const examAnswerKeyCorrectByOptionId = useMemo(() => {
        const map = new Map<number, boolean>();
        (examAnswerKeyData?.data?.questions ?? []).forEach((q) => {
            q.options.forEach((opt) => map.set(opt.id, opt.is_correct));
        });
        return map;
    }, [examAnswerKeyData]);

    const questions = isBookmarksPlayPage
        ? (bookmarksPlaySession?.questions ?? []).map((b) => ({
            id: b.question.id,
            question: b.question.question,
            image: b.question.media_url ?? null,
            audio: b.question.media_url ?? null,
            note: b.question.note ?? null,
            answer_type: b.question.answer_type ?? AnswerType.Single,
            options: (b.question.options ?? []).map((o) => ({ id: o.id, text: o.text, is_correct: o.is_correct, correct_sequence: o.correct_sequence })),
            answer: b.question.answer,
        }))
        : isExamPage
            ? isReviewMode
                ? (examAnswerKeyData?.data?.questions ?? []).map((q) => ({
                    id: q.id,
                    question: q.question,
                    image: q.image ?? null,
                    audio: null as string | null,
                    note: null as string | null,
                    answer_type: AnswerType.Single,
                    options: (q.options ?? []).map((o) => ({ id: o.id, text: o.text, is_correct: undefined as EncryptedPayload | undefined, correct_sequence: undefined as EncryptedPayload | undefined })),
                    answer: undefined as EncryptedPayload | undefined,
                }))
                : (examData?.data?.questions ?? []).map((q) => ({
                    id: q.id,
                    question: q.question,
                    image: q.image ?? null,
                    audio: q.audio_url ?? null,
                    note: q.note ?? null,
                    answer_type: q.answer_type ?? AnswerType.Single,
                    options: (q.options ?? []).map((o) => ({ id: o.id, text: o.text, is_correct: o.is_correct, correct_sequence: o.correct_sequence })),
                    answer: q.answer,
                }))
            : isFunLearnPage
                ? (funLearnData?.data?.questions ?? []).map((q) => ({
                    id: q.id,
                    question: q.question,
                    image: q.image,
                    audio: null as string | null,
                    note: null as string | null,
                    answer_type: AnswerType.Single,
                    options: q.options.map((o) => ({ id: o.id, text: o.text, is_correct: o.is_correct, correct_sequence: undefined as { ciphertext: string; iv: string } | undefined })),
                    answer: undefined as { ciphertext: string; iv: string } | undefined,
                }))
                : isContestPage
                    ? (contestData?.data?.questions ?? []).map((q) => ({
                        id: q.id,
                        question: q.question,
                        image: q.image,
                        audio: null as string | null,
                        note: q.note ?? null,
                        answer_type: AnswerType.Single,
                        options: q.options.map((o) => ({ id: o.id, text: o.text, is_correct: o.is_correct, correct_sequence: undefined as EncryptedPayload | undefined })),
                        answer: undefined as EncryptedPayload | undefined,
                    }))
                    : isAnyBattleMatchPage
                        ? (isBotMatch ? (botQuestions ?? []) : (battleData?.questions ?? [])).map((q) => ({
                            id: q.id,
                            question: q.question,
                            image: q.media_url ?? null,
                            audio: null as string | null,
                            note: q.note ?? null,
                            answer_type: BATTLE_QUESTION_TYPE_TO_ANSWER_TYPE[q.question_type] ?? AnswerType.Single,
                            options: (q.options ?? []).map((o) => ({ id: o.id, text: o.text, is_correct: o.is_correct, correct_sequence: o.correct_sequence })),
                            answer: undefined as EncryptedPayload | undefined,
                        }))
                        : hasReviewQuestionsSnapshot
                            ? (storedReviewQuestions ?? [])
                            : (data?.data?.questions ?? []).map((q) => ({
                                id: q.id,
                                question: q.question,
                                image: q.media_type === 'image' ? (q.media_url ?? null) : (q.image ?? null),
                                note: q.note ?? null,
                                audio: q.media_type === 'audio' ? (q.media_url ?? null) : (q.audio_url ?? null),
                                answer_type: q.answer_type ?? AnswerType.Single,
                                options: (q.options ?? []).map((o) => ({ id: o.id, text: o.text, is_correct: o.is_correct, correct_sequence: o.correct_sequence })),
                                answer: q.answer,
                            }));

    const totalQuestions = questions.length;
    const currentQuestion = questions[currentIndex];

    const initialBattleRoomCheckDoneRef = useRef(false);
    useEffect(() => {
        if (!isLiveBattleMatch || !battleRoom || initialBattleRoomCheckDoneRef.current) return;
        initialBattleRoomCheckDoneRef.current = true;
        if (!battleRoom.readyToPlay || battleFinishedRef.current) return;
        const myAnsweredCount = battleRoom.users.find((u) => u.uid === myIdentity)?.answers?.length ?? 0;
        if (myAnsweredCount <= 0) return;
        battleFinishedRef.current = true;
        submitAllAnswers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLiveBattleMatch, battleRoom, myIdentity])

    const bookmarkQuizType = isMathManiaPage
        ? QuizType.Math
        : isMultiMatchPage
            ? QuizType.MultiMatch
            : isAudioQuizPage
                ? QuizType.Audio
                : isGuessTheWordPage
                    ? QuizType.GuessWord
                    : isFunLearnPage
                        ? QuizType.FunLearn
                        : QuizType.QuizZone;
    const question = currentQuestion?.question;
    const answerType = currentQuestion?.answer_type ?? AnswerType.Single;
    const isRearrangeQuestion = answerType === AnswerType.Rearrange;
    const isMultiSelectQuestion = answerType === AnswerType.MultiSelect;

    const options: QuizOption[] = (currentQuestion?.options ?? []).map((opt, idx) => ({
        id: opt.id,
        letter: OPTION_LETTERS[idx] ?? String(idx + 1),
        label: opt.text,
        is_correct: opt.is_correct,
        correct_sequence: opt.correct_sequence,
    }));

    const simulateBotAnswer = (): boolean => {
        if (!options.length) return false;
        const opt = options[Math.floor(Math.random() * options.length)];
        if (!opt.is_correct) return false;
        try {
            const firebaseId = firebaseAuth.currentUser?.uid ?? "";
            const decoded = decryptAnswer(opt.is_correct, firebaseId);
            return decoded === "1" || decoded?.toLowerCase() === "true";
        } catch {
            return false;
        }
    };

    const examSelectedOptionId = currentQuestion ? examAnswers[currentQuestion.id] : undefined;
    const examSelectedIndex = examSelectedOptionId != null
        ? options.findIndex((opt) => opt.id === examSelectedOptionId)
        : -1;


    const reviewQuestionStatuses = useMemo(() => {
        if (!isReviewMode) return [];
        const firebaseId = firebaseAuth.currentUser?.uid ?? "";
        return questions.map((q) => {
            const storedAnswer = reviewAnswersMap.get(q.id);
            if (!storedAnswer) return null;

            if (isGuessTheWordPage) {
                if (typeof storedAnswer.answer !== 'string') return null;
                const word = (q.answer ? decryptAnswer(q.answer, firebaseId) : '')?.trim().toUpperCase() ?? '';
                return storedAnswer.answer === word ? 'correct' : 'wrong';
            }

            if (q.answer_type === AnswerType.Rearrange) {
                const selectedOrder = storedAnswer.selected_option_ids ?? [];
                if (!selectedOrder.length) return null;
                const expectedOrder = getExpectedRearrangeOrder(q.options);
                return expectedOrder.length === selectedOrder.length && expectedOrder.every((id, idx) => id === selectedOrder[idx])
                    ? 'correct' : 'wrong';
            }

            if (q.answer_type === AnswerType.MultiSelect) {
                const selectedIds = storedAnswer.selected_option_ids ?? [];
                if (!selectedIds.length) return null;
                const correctIds = q.options
                    .filter((opt) => {
                        if (!opt.is_correct) return false;
                        const decoded = decryptAnswer(opt.is_correct, firebaseId);
                        return decoded === "1" || decoded?.toLowerCase() === "true";
                    })
                    .map((opt) => opt.id);
                return correctIds.length === selectedIds.length && correctIds.every((id) => selectedIds.includes(id))
                    ? 'correct' : 'wrong';
            }

            const optIdx = storedAnswer.selected_option_id != null
                ? q.options.findIndex((opt) => opt.id === storedAnswer.selected_option_id)
                : -1;
            if (optIdx < 0) return null;
            const opt = q.options[optIdx];
            if (!opt.is_correct) return 'wrong';
            const decoded = decryptAnswer(opt.is_correct, firebaseId);
            return (decoded === "1" || decoded?.toLowerCase() === "true") ? 'correct' : 'wrong';
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isReviewMode, questions, reviewAnswersMap, isGuessTheWordPage]);

    const correctQuestionNumbers = reviewQuestionStatuses.reduce<number[]>((acc, status, idx) => {
        if (status === 'correct') acc.push(idx + 1);
        return acc;
    }, []);
    const wrongQuestionNumbers = reviewQuestionStatuses.reduce<number[]>((acc, status, idx) => {
        if (status === 'wrong') acc.push(idx + 1);
        return acc;
    }, []);

    const answersRef = useRef<{ question_id: number; selected_option_id?: number | null; selected_option_ids?: number[]; answer?: string }[]>(restored?.answers ?? []);
    const upsertAnswer = (entry: { question_id: number; selected_option_id?: number | null; selected_option_ids?: number[]; answer?: string }) => { 
        answersRef.current = answersRef.current.filter((a) => a.question_id !== entry.question_id);
        answersRef.current.push(entry);
    };
    const answeredAtRef = useRef(0);
    const battleOwnAnswersRef = useRef<BattleSubmitAnswer[]>([]);


    const attemptedQuestionNumbers = (isExamPage || isSelfChallenge)
        ? questions.reduce<number[]>((acc, q, idx) => {
            const attempted = examAnswers[q.id] != null || answersRef.current.some((a) => a.question_id === q.id);
            if (attempted) acc.push(idx + 1);
            return acc;
        }, [])
        : [];

    const botAnswersRef = useRef<{ isCorrect: boolean }[]>([]);
    useEffect(() => {
        if (isBotMatch && botQuestions) botAnswersRef.current = [];
    }, [isBotMatch, botQuestions]);
    const quizStartTimeRef = useRef<number | null>(restored?.quizStartTime ?? null);
    const quizAttemptId = isBookmarksPlayPage ? -1 : isExamPage ? examData?.data?.quiz_attempt_id : isFunLearnPage ? funLearnData?.data?.quiz_attempt_id : isContestPage ? contestData?.data?.quiz_attempt_id : data?.data?.quiz_attempt_id;
    const restoredAttemptIdRef = useRef(restored?.quizResponse?.data?.quiz_attempt_id);

    useEffect(() => {
        if (!quizAttemptId || quizAttemptId === restoredAttemptIdRef.current) return;
        answersRef.current = [];
        quizStartTimeRef.current = Date.now();
    }, [quizAttemptId]);

    const questionIds = questions.map((q) => q.id);
    const questionIdsKey = questionIds.join(',');

    useEffect(() => {
        if (isBookmarksPlayPage) {
            setBookmarkedQuestionIds(new Set(questionIds));
            return;
        }
        if (!isReviewMode || isDailyQuizPage || questionIds.length === 0) return;
        checkBookmarks({ quiz_type: bookmarkQuizType, question_ids: questionIds })
            .then((response) => {
                const bookmarked = (response?.data?.bookmarks ?? []).filter((b) => b.is_bookmarked).map((b) => b.question_id);
                setBookmarkedQuestionIds(new Set(bookmarked));
            })
            .catch((error) => {
                console.error("Failed to check bookmarks:", error);
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isReviewMode, questionIdsKey, bookmarkQuizType, isBookmarksPlayPage]);

    const computeLocalBookmarksResult = (): SubmitAnswerResponse => {
        const firebaseId = firebaseAuth.currentUser?.uid ?? "";
        let correct = 0;
        let wrong = 0;
        let skipped = 0;

        questions.forEach((q) => {
            const ans = answersRef.current.find((a) => a.question_id === q.id);
            if (!ans) { skipped++; return; }

            if (isGuessTheWordPage) {
                if (typeof ans.answer !== 'string') { skipped++; return; }
                const word = (q.answer ? decryptAnswer(q.answer, firebaseId) : '')?.trim().toUpperCase() ?? '';
                ans.answer === word ? correct++ : wrong++;
                return;
            }

            if (q.answer_type === AnswerType.Rearrange) {
                const selected = ans.selected_option_ids ?? [];
                if (!selected.length) { skipped++; return; }
                const expected = getExpectedRearrangeOrder(q.options);
                (expected.length === selected.length && expected.every((id, idx) => id === selected[idx])) ? correct++ : wrong++;
                return;
            }

            if (q.answer_type === AnswerType.MultiSelect) {
                const selected = ans.selected_option_ids ?? [];
                if (!selected.length) { skipped++; return; }
                const expectedIds = q.options
                    .filter((opt) => {
                        if (!opt.is_correct) return false;
                        const decoded = decryptAnswer(opt.is_correct, firebaseId);
                        return decoded === "1" || decoded?.toLowerCase() === "true";
                    })
                    .map((opt) => opt.id);
                const selectedSet = new Set(selected);
                (expectedIds.length === selectedSet.size && expectedIds.every((id) => selectedSet.has(id))) ? correct++ : wrong++;
                return;
            }

            if (ans.selected_option_id == null) { skipped++; return; }
            const opt = q.options.find((o) => o.id === ans.selected_option_id);
            const decoded = opt?.is_correct ? decryptAnswer(opt.is_correct, firebaseId) : null;
            (decoded === "1" || decoded?.toLowerCase() === "true") ? correct++ : wrong++;
        });

        const total = questions.length;
        return {
            total_questions: total,
            correct_answers: correct,
            wrong_answers: wrong,
            skipped_answers: skipped,
            winning_percentage: total ? Math.round((correct / total) * 100) : 0,
            earn_coin: 0,
            score: 0,
            total_coins: coins,
            total_score: 0,
            unlocked_level: null,
            unlocked_level_id: null,
        };
    };

    const submitAllAnswers = async (overrides?: { skippedQuestionId?: number | null; usedLifelines?: typeof usedLifelines }) => {
        if (isBotMatch) {
            const botAnswers = botAnswersRef.current;
            const myScore = Math.max(0, correctCount * creditPerCorrectAnswer - wrongCount * deductPerWrongAnswer);
            const botCorrect = botAnswers.filter((a) => a.isCorrect).length;
            const botWrong = botAnswers.length - botCorrect;
            const botScore = Math.max(0, botCorrect * creditPerCorrectAnswer - botWrong * deductPerWrongAnswer);
            const myUserId = Number(profile?.id) || 0;
            const timeTakenSeconds = quizStartTimeRef.current
                ? Math.round((Date.now() - quizStartTimeRef.current) / 1000)
                : 0;

            dispatch(setQuizResult({
                total_questions: totalQuestions,
                correct_answers: correctCount,
                wrong_answers: wrongCount,
                skipped_answers: Math.max(0, totalQuestions - correctCount - wrongCount),
                winning_percentage: totalQuestions ? Math.round((correctCount / totalQuestions) * 100) : 0,
                earn_coin: 0,
                score: myScore,
                total_coins: coins,
                total_score: myScore,
                unlocked_level: null,
                unlocked_level_id: null,
            }));
            dispatch(setQuizPlayParams({ pathname: pathname ?? null, categoryId: botMeta?.categoryId ?? categoryId, level, isBotMatch: true }));
            dispatch(setQuizReviewAnswers(answersRef.current));
            dispatch(setQuizTimeTaken(timeTakenSeconds));
            clearQuizSession(sessionKey);
            dispatch(setBattleResult({
                status: 'completed',
                is_bot_match: true,
                winner_user_id: myScore === botScore ? null : (myScore > botScore ? myUserId : -1),
                is_draw: myScore === botScore,
                winner_coin: 0,
                participants: [
                    {
                        user_id: myUserId, is_host: true, completed: true,
                        score: myScore, correct_count: correctCount, wrong_count: wrongCount,
                        total_questions: totalQuestions, winning_percentage: totalQuestions ? Math.round((correctCount / totalQuestions) * 100) : 0,
                        total_coins: coins, total_score: myScore, total_time_taken: 0, rank: myScore >= botScore ? 1 : 2, payout_coin: 0,
                    },
                    {
                        user_id: -1, is_host: false, completed: true,
                        score: botScore, correct_count: botCorrect, wrong_count: botWrong,
                        total_questions: totalQuestions, winning_percentage: totalQuestions ? Math.round((botCorrect / totalQuestions) * 100) : 0,
                        total_coins: 0, total_score: botScore, total_time_taken: 0, rank: botScore > myScore ? 1 : 2, payout_coin: 0,
                    },
                ],
            }));

            const resultPath = pathname?.replace(/\/play$/, '/result') ?? pathname;
            router.push(resultPath);
            return;
        }

        if (isLiveBattleMatch) {
            dispatch(setQuizPlayParams({ pathname: pathname ?? null, categoryId, level, roomId: roomIdParam, roomCode }));
            dispatch(setQuizReviewAnswers(answersRef.current));
            clearQuizSession(sessionKey);

            try {
                const myUserId = Number(profile?.id) || 0;
                const result = await submitResults(myIdentity, myUserId, battleOwnAnswersRef.current);
                dispatch(setBattleResult(result ?? null));

                const me = result?.participants.find((p) => p.user_id === myUserId);
                if (me) {
                    dispatch(setQuizResult({
                        total_questions: me.total_questions,
                        correct_answers: me.correct_count,
                        wrong_answers: me.wrong_count,
                        skipped_answers: Math.max(0, me.total_questions - me.correct_count - me.wrong_count),
                        winning_percentage: me.winning_percentage,
                        earn_coin: me.payout_coin,
                        score: me.score,
                        total_coins: me.total_coins,
                        total_score: me.total_score,
                        unlocked_level: null,
                        unlocked_level_id: null,
                    }));
                    dispatch(setQuizTimeTaken(me.total_time_taken));
                }
            } catch (error) {
                console.error("Failed to submit battle result:", error);
            }

            const resultPath = pathname?.replace(/\/play$/, '/result') ?? pathname;
            router.push(resultPath);
            return;
        }

        if (isBookmarksPlayPage) {
            const timeTakenSeconds = quizStartTimeRef.current
                ? Math.round((Date.now() - quizStartTimeRef.current) / 1000)
                : null;

            dispatch(setQuizResult(computeLocalBookmarksResult()));
            dispatch(setQuizPlayParams({ pathname: pathname ?? null, categoryId: 0, level: null }));
            dispatch(setQuizReviewAnswers(answersRef.current));
            dispatch(setQuizTimeTaken(timeTakenSeconds));
            clearQuizSession(sessionKey);
            const resultPath = pathname?.replace(/\/play$/, '/result') ?? pathname;
            router.push(resultPath);
            return;
        }

        if (!quizAttemptId) {
            return;
        }

        try {
            const finalSkippedQuestionId = overrides?.skippedQuestionId ?? skippedQuestionId;
            const timeTakenSeconds = quizStartTimeRef.current
                ? Math.round((Date.now() - quizStartTimeRef.current) / 1000)
                : null;

            const response = isContestPage
                ? await submitContestAnswer(contestId, {
                    answers: answersRef.current.map((a) => ({
                        question_id: a.question_id,
                        selected_option_id: a.selected_option_id ?? null,
                    })),
                })
                : isFunLearnPage
                    ? await submitFunLearnAnswer({
                        quiz_attempt_id: quizAttemptId,
                        skipped_question_id: finalSkippedQuestionId,
                        total_play_time: timeTakenSeconds ?? 0,
                        answers: answersRef.current,
                    })
                    : isGuessTheWordPage
                        ? await submitGuessWordAnswer(questionsEndpoint, {
                            quiz_attempt_id: quizAttemptId,
                            skipped_question_id: finalSkippedQuestionId,
                            total_play_time: timeTakenSeconds ?? 0,
                            lifelines_used: hintsUsedCount,
                            answers: answersRef.current
                                .filter((a): a is { question_id: number; answer: string } => typeof a.answer === 'string'),
                        })
                        : await submitQuizAnswer(questionsEndpoint, {
                            quiz_attempt_id: quizAttemptId,
                            skipped_question_id: finalSkippedQuestionId,
                            lifelines_used: Object.values(overrides?.usedLifelines ?? usedLifelines).filter(Boolean).length,
                            answers: answersRef.current,
                        });

            dispatch(setQuizResult(response?.data ?? null));
            dispatch(setQuizPlayParams({
                pathname: pathname ?? null,
                categoryId,
                level,
                funLearnId: isFunLearnPage ? funLearnId : null,
                lifelinesUsedCount: Object.values(overrides?.usedLifelines ?? usedLifelines).filter(Boolean).length,
                hintsUsedCount,
            }));
            if (isContestPage) {
                dispatch(setSelectedContestId(contestId));
            }
            dispatch(setQuizReviewAnswers(answersRef.current));
            dispatch(setReviewQuizQuestions(questions));
            dispatch(setQuizTimeTaken(timeTakenSeconds));
            clearQuizSession(sessionKey);
            const resultPath = pathname?.replace(/\/play$/, '/result') ?? pathname;
            router.push(resultPath);
        } catch (error) {
            console.error("Failed to submit quiz answers:", error);
        }
    };

    const handleBookmark = async () => {
        if (!currentQuestion) return;

        const nextStatus = !bookmarkedQuestionIds.has(currentQuestion.id);
        const storedAnswer = reviewAnswersMap.get(currentQuestion.id);

        const answerMode = isGuessTheWordPage
            ? 'text'
            : answerType === AnswerType.Rearrange
                ? 'rearrange'
                : answerType === AnswerType.MultiSelect
                    ? 'multi'
                    : 'single';

        try {
            await submitBookmark({
                quiz_type: bookmarkQuizType,
                question_id: currentQuestion.id,
                status: nextStatus,
                was_correct_at_bookmark: answerStatus === 'correct',
                attempted_answer: {
                    answer_mode: answerMode,
                    ...(answerMode === 'single' ? { selected_option_id: storedAnswer?.selected_option_id ?? null } : {}),
                    ...(answerMode === 'multi' ? { selected_option_ids: storedAnswer?.selected_option_ids ?? [] } : {}),
                    ...(answerMode === 'rearrange' ? { ordered_option_ids: storedAnswer?.selected_option_ids ?? [] } : {}),
                    ...(answerMode === 'text' ? { answer: storedAnswer?.answer ?? '' } : {}),
                },
            });
            setBookmarkedQuestionIds((prev) => {
                const next = new Set(prev);
                if (nextStatus) {
                    next.add(currentQuestion.id);
                } else {
                    next.delete(currentQuestion.id);
                }
                return next;
            });
        } catch (error) {
            console.error("Failed to bookmark question:", error);
        }
    };

    const handleExamOptionSelect = (option: QuizOption) => {
        if (!currentQuestion) return;
        setExamAnswers((prev) => ({ ...prev, [currentQuestion.id]: option.id }));
    };

    const handleSelfChallengeOptionSelect = (option: QuizOption) => {
        if (!currentQuestion) return;
        setExamAnswers((prev) => ({ ...prev, [currentQuestion.id]: option.id }));
    };

    const handleExamPrev = () => {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
    };

    const handleExamSubmit = async () => {
        if (!quizAttemptId) return;

        try {
            const timeTakenSeconds = quizStartTimeRef.current
                ? Math.round((Date.now() - quizStartTimeRef.current) / 1000)
                : null;

            const response = await submitExamAnswers({
                quiz_attempt_id: quizAttemptId,
                attempted_time_duration: timeTakenSeconds,
                violation_count: null,
                answers: questions.map((q) => ({
                    question_id: q.id,
                    selected_option_id: examAnswers[q.id] ?? null,
                })),
            });

            dispatch(setQuizResult(response?.data ?? null));
            dispatch(setQuizPlayParams({
                pathname: pathname ?? null,
                categoryId: 0,
                level: null,
            }));
            dispatch(setQuizTimeTaken(timeTakenSeconds));
            clearQuizSession(sessionKey);
            const resultPath = pathname?.replace(/\/play$/, '/result') ?? pathname;
            router.push(resultPath);
        } catch (error) {
            console.error("Failed to submit exam answers:", error);
        }
    };

    const handleSelfChallengeSubmit = async () => {
        if (!quizAttemptId) return;

        try {
            const timeTakenSeconds = quizStartTimeRef.current
                ? Math.round((Date.now() - quizStartTimeRef.current) / 1000)
                : null;

            // Single-choice answers live in examAnswers; rearrange/multi-select answers were
            // recorded into answersRef by handleConfirmAnswer instead — merge both so neither
            // gets silently dropped (and reported back to the server as "not attempted").
            const selfChallengeAnswers = questions.map((q) => {
                const richAnswer = answersRef.current.find((a) => a.question_id === q.id);
                if (richAnswer) return richAnswer;
                return { question_id: q.id, selected_option_id: examAnswers[q.id] ?? null };
            });

            const response = await submitQuizAnswer(questionsEndpoint, {
                quiz_attempt_id: quizAttemptId,
                skipped_question_id: null,
                lifelines_used: 0,
                answers: selfChallengeAnswers,
            });

            dispatch(setQuizResult(response?.data ?? null));
            dispatch(setQuizPlayParams({
                pathname: pathname ?? null,
                categoryId,
                level,
            }));
            dispatch(setQuizReviewAnswers(selfChallengeAnswers));
            dispatch(setReviewQuizQuestions(questions));
            dispatch(setQuizTimeTaken(timeTakenSeconds));
            clearQuizSession(sessionKey);
            const resultPath = pathname?.replace(/\/play$/, '/result') ?? pathname;
            router.push(resultPath);
        } catch (error) {
            console.error("Failed to submit self challenge answers:", error);
        }
    };

    const handleExamNext = () => {
        if (currentIndex + 1 < totalQuestions) {
            setCurrentIndex((prev) => prev + 1);
        } else if (isSelfChallenge) {
            handleSelfChallengeSubmit();
        } else {
            handleExamSubmit();
        }
    };

    const handleOptionSelect = async (option: QuizOption, idx: number) => {
        if (selected !== null || roundLocked || !currentQuestion || waitingForAudio) return;
        setSelected(idx);
        setRoundLocked(true);

        let isCorrect = false;
        try {
            if (option.is_correct) {
                const firebaseId = firebaseAuth.currentUser?.uid ?? "";
                const decoded = decryptAnswer(option.is_correct, firebaseId);
                isCorrect = decoded === "1" || decoded?.toLowerCase() === "true";
            }
        } catch (error) {
            console.error("Failed to decrypt option correctness:", error);
        }
        setAnswerStatus(isCorrect ? 'correct' : 'wrong');
        playAnswerFeedback(isCorrect);
        if (isCorrect) setCorrectCount((prev) => prev + 1);
        else setWrongCount((prev) => prev + 1);

        upsertAnswer({ question_id: currentQuestion.id, selected_option_id: option.id });

        if (isBotMatch) {
            botAnswersRef.current.push({ isCorrect: simulateBotAnswer() });
        }

        if (isLiveBattleMatch) {
            answeredAtRef.current = performance.now();
            const seconds = Math.max(0, quizDuration - timeLeft);
            battleOwnAnswersRef.current.push({ question_id: currentQuestion.id, selected_option_id: option.id, seconds });
            submitOneVsOneAnswer(
                myIdentity,
                { id: String(currentQuestion.id), answer: String(option.id), second: String(seconds) },
                isCorrect ? creditPerCorrectAnswer : -deductPerWrongAnswer,
            ).catch((error) => console.error("Failed to submit battle answer:", error));

            if (isGroupBattlePage) {
                const isLastQuestion = currentIndex + 1 >= totalQuestions;
                setTimeout(() => {
                    setSelected(null);
                    setAnswerStatus(null);
                    if (isLastQuestion) setGroupWaitingForOthers(true);
                    else setCurrentIndex((prev) => prev + 1);
                }, NEXT_QUESTION_DELAY_MS);
                return;
            }

            setTimeout(() => {
                setSelected(null);
                setAnswerStatus(null);
            }, NEXT_QUESTION_DELAY_MS);
            return;
        }

        const isLastQuestion = currentIndex + 1 >= totalQuestions;

        if (isLastQuestion) {
            await submitAllAnswers();
        }

        setTimeout(() => {
            setSelected(null);
            setAnswerStatus(null);
            setCurrentIndex((prev) => (prev + 1 < totalQuestions ? prev + 1 : prev));
        }, NEXT_QUESTION_DELAY_MS);
    };

    const handleTimeout = async () => {
        setRoundLocked(true);

        if (currentQuestion && !isGuessTheWordPage) {
            upsertAnswer({ question_id: currentQuestion.id, selected_option_id: null });
        }

        if (isBotMatch && currentQuestion) {
            botAnswersRef.current.push({ isCorrect: simulateBotAnswer() });
        }

        if (isLiveBattleMatch) {
            if (currentQuestion) {
                battleOwnAnswersRef.current.push({ question_id: currentQuestion.id, selected_option_id: null, seconds: quizDuration });
                submitOneVsOneAnswer(
                    myIdentity,
                    { id: String(currentQuestion.id), answer: '', second: String(quizDuration) },
                    -deductPerWrongAnswer,
                ).catch((error) => console.error("Failed to submit battle answer:", error));
            }

            if (isGroupBattlePage) {
                const isLastQuestion = currentIndex + 1 >= totalQuestions;
                setTimeout(() => {
                    if (isLastQuestion) setGroupWaitingForOthers(true);
                    else setCurrentIndex((prev) => prev + 1);
                }, NEXT_QUESTION_DELAY_MS);
            }
            return;
        }

        const isLastQuestion = currentIndex + 1 >= totalQuestions;
        if (isLastQuestion) {
            await submitAllAnswers();
        }

        setCurrentIndex((prev) => (prev + 1 < totalQuestions ? prev + 1 : prev));
    };


    const battleFinishedRef = useRef(false);


    const leaveBattleRoomRef = useRef(leaveBattleRoom);
    useEffect(() => { leaveBattleRoomRef.current = leaveBattleRoom; }, [leaveBattleRoom]);
    useEffect(() => {
        return () => {
            if (isLiveBattleMatch && !battleFinishedRef.current) {
                leaveBattleRoomRef.current(myIdentity);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLiveBattleMatch, myIdentity]);

    const advancePendingRef = useRef(false);
    useEffect(() => {
        if (isGroupBattlePage || !isLiveBattleMatch || isReviewMode || !battleRoom || !totalQuestions || battleFinishedRef.current || advancePendingRef.current) return;
        const me = battleRoom.users.find((u) => u.uid === myIdentity);
        const opponent = battleRoom.users.find((u) => u.uid && u.uid !== myIdentity);
        if (!me?.uid || !opponent?.uid) return;

        const bothAnswered = Math.min(me.answers?.length ?? 0, opponent.answers?.length ?? 0);
        if (bothAnswered <= currentIndex) return;

    
        advancePendingRef.current = true;
        afterMinHold(answeredAtRef.current, NEXT_QUESTION_DELAY_MS, () => {
            advancePendingRef.current = false;
            if (bothAnswered >= totalQuestions) {
                battleFinishedRef.current = true;
                submitAllAnswers();
                return;
            }
            setSelected(null);
            setAnswerStatus(null);
            setCurrentIndex(bothAnswered);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [battleRoom, isGroupBattlePage, isLiveBattleMatch, isReviewMode, myIdentity, currentIndex, totalQuestions]);


    useEffect(() => {
        if (isGroupBattlePage || !isLiveBattleMatch || isReviewMode || !battleRoom || battleFinishedRef.current) return;
        // battleRoom.finished only flips when the opponent leaves via the explicit
        // leaveRoom transaction (e.g. navigating away in-app). A closed tab / crash /
        // dropped connection instead relies on RTDB's onDisconnect, which only clears
        // `connected` — status stays 'inProgress' forever. Detect that case here too: if
        // I'm the only connected player left, treat it the same as an opponent leaving.
        const connectedUsers = battleRoom.users.filter((u) => u.uid);
        const opponentLeft = connectedUsers.length === 1 && connectedUsers[0].uid === myIdentity;
        if (!battleRoom.finished && !opponentLeft) return;
        battleFinishedRef.current = true;
        submitAllAnswers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [battleRoom, isGroupBattlePage, isLiveBattleMatch, isReviewMode, myIdentity]);


    useEffect(() => {
        if (!isGroupBattlePage || !isLiveBattleMatch || isReviewMode || !battleRoom || !totalQuestions || battleFinishedRef.current) return;
        const connected = battleRoom.users.filter((u) => u.uid);
        const me = connected.find((u) => u.uid === myIdentity);
        if (!me) return;

        const lastPlayerStanding = connected.length === 1;
        const iHaveFinished = (me.answers?.length ?? 0) >= totalQuestions;
        const stillPlaying = connected.filter((u) => (u.answers?.length ?? 0) < totalQuestions);

        if (lastPlayerStanding || (iHaveFinished && stillPlaying.length === 0)) {
            battleFinishedRef.current = true;
            submitAllAnswers();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [battleRoom, isGroupBattlePage, isLiveBattleMatch, isReviewMode, myIdentity, totalQuestions]);

    const isOptionCorrect = (option: QuizOption) => {
        if (isExamPage && isReviewMode) {
            return examAnswerKeyCorrectByOptionId.get(option.id) ?? false;
        }
        if (!option.is_correct) return false;
        try {
            const firebaseId = firebaseAuth.currentUser?.uid ?? "";
            const decoded = decryptAnswer(option.is_correct, firebaseId);
            return decoded === "1" || decoded?.toLowerCase() === "true";
        } catch (error) {
            console.error("Failed to decrypt option correctness:", error);
            return false;
        }
    };

    const moveRearrangeOption = (index: number, direction: -1 | 1) => {
        if (roundLocked) return;
        const targetIndex = index + direction;
        if (targetIndex < 0 || targetIndex >= rearrangeOrder.length) return;
        setRearrangeOrder((prev) => {
            const next = [...prev];
            [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
            return next;
        });
    };

    const handleRearrangeDragEnd = (result: DropResult) => {
        if (roundLocked || !result.destination) return;
        const sourceIndex = result.source.index;
        const targetIndex = result.destination.index;
        if (sourceIndex === targetIndex) return;
        setRearrangeOrder((prev) => {
            const next = [...prev];
            const [moved] = next.splice(sourceIndex, 1);
            next.splice(targetIndex, 0, moved);
            return next;
        });
    };

    const toggleMultiSelectOption = (optionId: number) => {
        if (roundLocked) return;
        setMultiSelectedIds((prev) =>
            prev.includes(optionId) ? prev.filter((id) => id !== optionId) : [...prev, optionId]
        );
    };

    const handleConfirmAnswer = async () => {
        if (roundLocked || !currentQuestion) return;
        setRoundLocked(true);

        let isCorrect = false;
        let selectedOptionIds: number[] = [];
        try {
            const firebaseId = firebaseAuth.currentUser?.uid ?? "";
            if (isRearrangeQuestion) {
                selectedOptionIds = rearrangeOrder;
                const expectedOrder = getExpectedRearrangeOrder(options);
                isCorrect = expectedOrder.length === selectedOptionIds.length
                    && expectedOrder.every((id, idx) => id === selectedOptionIds[idx]);
            } else if (isMultiSelectQuestion) {
                selectedOptionIds = multiSelectedIds;
                const expectedIds = options
                    .filter((opt) => {
                        if (!opt.is_correct) return false;
                        const decoded = decryptAnswer(opt.is_correct, firebaseId);
                        return decoded === "1" || decoded?.toLowerCase() === "true";
                    })
                    .map((opt) => opt.id);
                const selectedSet = new Set(selectedOptionIds);
                isCorrect = expectedIds.length === selectedSet.size && expectedIds.every((id) => selectedSet.has(id));

            }
        } catch (error) {
            console.error("Failed to evaluate answer:", error);
        }

        upsertAnswer({ question_id: currentQuestion.id, selected_option_ids: selectedOptionIds });

        if (isExamPage || isSelfChallenge) {
            // Free prev/next navigation + an explicit Submit button drive exam/self-challenge —
            // no local scoring, forced advance, or auto-submit here, mirroring how
            // handleExamOptionSelect/handleSelfChallengeOptionSelect handle single-choice.
            if (!isExamPage) {
                setAnswerStatus(isCorrect ? 'correct' : 'wrong');
                playAnswerFeedback(isCorrect);
            }
            return;
        }

        setAnswerStatus(isCorrect ? 'correct' : 'wrong');
        playAnswerFeedback(isCorrect);
        if (isCorrect) setCorrectCount((prev) => prev + 1);
        else setWrongCount((prev) => prev + 1);

        if (isBotMatch) {
            botAnswersRef.current.push({ isCorrect: simulateBotAnswer() });
        }

        if (isLiveBattleMatch) {
            const seconds = Math.max(0, quizDuration - timeLeft);
            const joinedAnswer = selectedOptionIds.join(',');
            battleOwnAnswersRef.current.push({ question_id: currentQuestion.id, selected_option_id: joinedAnswer ? Number(joinedAnswer) || null : null, seconds });
            submitOneVsOneAnswer(
                myIdentity,
                { id: String(currentQuestion.id), answer: joinedAnswer, second: String(seconds) },
                isCorrect ? creditPerCorrectAnswer : -deductPerWrongAnswer,
            ).catch((error) => console.error("Failed to submit battle answer:", error));

            if (isGroupBattlePage) {
                const isLastQuestion = currentIndex + 1 >= totalQuestions;
                setTimeout(() => {
                    setAnswerStatus(null);
                    if (isLastQuestion) setGroupWaitingForOthers(true);
                    else setCurrentIndex((prev) => prev + 1);
                }, NEXT_QUESTION_DELAY_MS);
                return;
            }

            setTimeout(() => {
                setAnswerStatus(null);
            }, NEXT_QUESTION_DELAY_MS);
            return;
        }

        const isLastQuestion = currentIndex + 1 >= totalQuestions;
        if (isLastQuestion) {
            await submitAllAnswers();
        }

        setTimeout(() => {
            setAnswerStatus(null);
            setCurrentIndex((prev) => (prev + 1 < totalQuestions ? prev + 1 : prev));
        }, NEXT_QUESTION_DELAY_MS);
    };

    const quizTypeLabel = params.slug
        ? params.slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
        : '';

    const logLifelineUse = (lifelineName: string) => {
        submitCoinScore({
            amount: 1,
            source: 'lifeline',
            description: `Used ${lifelineName} in ${quizTypeLabel}`,
        })
            .then(() => dispatch(decrementCoins(1)))
            .catch((error) => {
                console.error("Failed to log lifeline coin-score:", error);
            });
    };

    const handleFiftyFifty = () => {
        if (usedLifelines.fiftyFifty || lifelineUsedThisQuestion || selected !== null || roundLocked || !currentQuestion || waitingForAudio) return;

        const wrongOptionIds = options.filter((opt) => !isOptionCorrect(opt)).map((opt) => opt.id);
        const shuffled = [...wrongOptionIds].sort(() => Math.random() - 0.5);
        const toEliminate = shuffled.slice(0, Math.max(wrongOptionIds.length - 1, 0));

        setEliminatedOptionIds(toEliminate);
        setUsedLifelines((prev) => ({ ...prev, fiftyFifty: true }));
        setLifelineUsedThisQuestion(true);
        logLifelineUse('50-50');
    };

    const handleResetTimer = () => {
        if (usedLifelines.resetTimer || lifelineUsedThisQuestion || selected !== null || roundLocked || !currentQuestion) return;
        setTimeLeft(quizDuration);
        setUsedLifelines((prev) => ({ ...prev, resetTimer: true }));
        setLifelineUsedThisQuestion(true);
        logLifelineUse('Reset Timer');
    };

    const handleAudiencePoll = () => {
        if (usedLifelines.audiencePoll || lifelineUsedThisQuestion || selected !== null || roundLocked || !currentQuestion || waitingForAudio) return;

        const correctOption = options.find((opt) => isOptionCorrect(opt));
        if (!correctOption) return;

        const correctShare = 55 + Math.floor(Math.random() * 26);
        const remaining = 100 - correctShare;
        const otherOptions = options.filter((opt) => opt.id !== correctOption.id);

        const percentages: Record<number, number> = { [correctOption.id]: correctShare };
        let leftover = remaining;
        otherOptions.forEach((opt, idx) => {
            const isLast = idx === otherOptions.length - 1;
            const share = isLast ? leftover : Math.floor(Math.random() * (leftover + 1) / (otherOptions.length - idx));
            percentages[opt.id] = share;
            leftover -= share;
        });

        setPollPercentages(percentages);
        setUsedLifelines((prev) => ({ ...prev, audiencePoll: true }));
        setLifelineUsedThisQuestion(true);
        logLifelineUse('Audience Poll');
    };

    const handleSkip = async () => {
        if (usedLifelines.skip || lifelineUsedThisQuestion || selected !== null || roundLocked || !currentQuestion || waitingForAudio) return;
        const nextUsedLifelines = { ...usedLifelines, skip: true };
        setUsedLifelines(nextUsedLifelines);
        setSkippedQuestionId(currentQuestion.id);
        setLifelineUsedThisQuestion(true);
        setRoundLocked(true);
        logLifelineUse('Skip');

        const isLastQuestion = currentIndex + 1 >= totalQuestions;
        if (isLastQuestion) {
            await submitAllAnswers({ skippedQuestionId: currentQuestion.id, usedLifelines: nextUsedLifelines });
        }

        setCurrentIndex((prev) => (prev + 1 < totalQuestions ? prev + 1 : prev));
    };

    const handleTileClick = (rowIdx: number, colIdx: number, letter: string) => {
        if (roundLocked) return;
        const tileKey = `${rowIdx}-${colIdx}`;
        if (usedTileKeys[tileKey]) return;

        const emptySlotIdx = wordSlots.findIndex((slot) => slot === '');
        if (emptySlotIdx === -1) return;

        setWordSlots((prev) => prev.map((slot, idx) => (idx === emptySlotIdx ? letter : slot)));
        setUsedTileKeys((prev) => ({ ...prev, [tileKey]: true }));
        setSlotTileKeys((prev) => ({ ...prev, [emptySlotIdx]: tileKey }));
    };

    const handleSlotClick = (slotIdx: number) => {
        if (roundLocked) return;
        const tileKey = slotTileKeys[slotIdx];
        if (!tileKey) return;

        setWordSlots((prev) => prev.map((slot, idx) => (idx === slotIdx ? '' : slot)));
        setUsedTileKeys((prev) => {
            const next = { ...prev };
            delete next[tileKey];
            return next;
        });
        setSlotTileKeys((prev) => {
            const next = { ...prev };
            delete next[slotIdx];
            return next;
        });
    };

    const handleErase = () => {
        const filledSlotIndices = Object.keys(slotTileKeys).map(Number);
        if (filledSlotIndices.length === 0) return;

        const lastFilledSlotIdx = Math.max(...filledSlotIndices);
        handleSlotClick(lastFilledSlotIdx);
    };

    const handleHint = () => {
        if (roundLocked || !currentQuestion || !guessWord || !hintAvailable) return;

        // Target slot: prefer an empty slot; else an incorrectly-filled one; else fully solved, no-op.
        const emptySlotIndices = wordSlots.reduce<number[]>((acc, slot, idx) => {
            if (slot === '') acc.push(idx);
            return acc;
        }, []);

        let targetSlotIdx: number;
        if (emptySlotIndices.length) {
            targetSlotIdx = emptySlotIndices[Math.floor(Math.random() * emptySlotIndices.length)];
        } else {
            const incorrectSlotIndices = wordSlots.reduce<number[]>((acc, slot, idx) => {
                if (slot !== '' && slot !== guessWord[idx]) acc.push(idx);
                return acc;
            }, []);
            if (!incorrectSlotIndices.length) return;
            targetSlotIdx = incorrectSlotIndices[Math.floor(Math.random() * incorrectSlotIndices.length)];
        }

        const neededLetter = guessWord[targetSlotIdx];
        const allTiles = guessWordTileRows.flatMap((row, rowIdx) =>
            row.map((letter, colIdx) => ({ letter, tileKey: `${rowIdx}-${colIdx}` }))
        );
        const unusedTile = allTiles.find(({ letter, tileKey }) => letter === neededLetter && !usedTileKeys[tileKey]);

        // No unused chip of this letter (duplicate-letter word): find another slot wrongly holding it, to swap.
        // Never source from a slot that's already correct.
        const swapSlotIdx = !unusedTile
            ? wordSlots.findIndex((slot, idx) => idx !== targetSlotIdx && slot === neededLetter && slot !== guessWord[idx])
            : -1;

        if (!unusedTile && swapSlotIdx === -1) return; // unreachable given the chip-count guarantee, kept as a safety net

        if (coins < 1) return; // hint costs 1 coin; never charge/apply without funds

        const targetOldTileKey = slotTileKeys[targetSlotIdx];

        if (unusedTile) {
            setWordSlots((prev) => prev.map((slot, idx) => (idx === targetSlotIdx ? neededLetter : slot)));
            setSlotTileKeys((prev) => ({ ...prev, [targetSlotIdx]: unusedTile.tileKey }));
            setUsedTileKeys((prev) => {
                const next = { ...prev, [unusedTile.tileKey]: true };
                if (targetOldTileKey) delete next[targetOldTileKey];
                return next;
            });
        } else {
            const sourceTileKey = slotTileKeys[swapSlotIdx];
            const targetOldLetter = wordSlots[targetSlotIdx];
            setWordSlots((prev) => prev.map((slot, idx) => {
                if (idx === targetSlotIdx) return neededLetter;
                if (idx === swapSlotIdx) return targetOldLetter;
                return slot;
            }));
            setSlotTileKeys((prev) => {
                const next = { ...prev, [targetSlotIdx]: sourceTileKey };
                if (targetOldTileKey) next[swapSlotIdx] = targetOldTileKey;
                else delete next[swapSlotIdx];
                return next;
            });
        }

        setHintsUsedCount((prev) => prev + 1);
        setHintsUsedThisQuestion((prev) => prev + 1);
        logLifelineUse('Hint');
    };

    const handleGuessWordSubmit = async () => {
        if (roundLocked || !currentQuestion || !isWordComplete) return;
        setRoundLocked(true);

        const assembledWord = wordSlots.join('');
        const isCorrect = !!guessWord && assembledWord === guessWord;
        upsertAnswer({ question_id: currentQuestion.id, answer: assembledWord });

        if (isExamPage || isSelfChallenge) {
            if (!isExamPage) {
                setAnswerStatus(isCorrect ? 'correct' : 'wrong');
                playAnswerFeedback(isCorrect);
            }
            return;
        }

        setAnswerStatus(isCorrect ? 'correct' : 'wrong');
        playAnswerFeedback(isCorrect);
        if (isCorrect) setCorrectCount((prev) => prev + 1);
        else setWrongCount((prev) => prev + 1);

        const isLastQuestion = currentIndex + 1 >= totalQuestions;
        if (isLastQuestion) {
            await submitAllAnswers();
        }

        setTimeout(() => {
            setAnswerStatus(null);
            setCurrentIndex((prev) => (prev + 1 < totalQuestions ? prev + 1 : prev));
        }, NEXT_QUESTION_DELAY_MS);
    };

    const restoredIndexRef = useRef(restored?.currentIndex ?? -1);

    useEffect(() => {
        if (isExamPage || isSelfChallenge || isReviewMode || currentIndex === restoredIndexRef.current) return;
        setTimeLeft(quizDuration);
        setRoundLocked(false);
        setEliminatedOptionIds([]);
        setPollPercentages(null);
        setLifelineUsedThisQuestion(false);
        setHintsUsedThisQuestion(0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentIndex]);

    useEffect(() => {
        if ((!isExamPage && !isSelfChallenge) || isReviewMode) return;
        setRoundLocked(false);
        setAnswerStatus(null);
    }, [currentIndex, isExamPage, isSelfChallenge, isReviewMode]);

    const currentOptionIdsKey = currentQuestion?.options.map((opt) => opt.id).join(',') ?? '';

    useEffect(() => {
        if (!currentQuestion) return;
        const storedAnswer = isReviewMode ? reviewAnswersMap.get(currentQuestion.id) : undefined;

        setRearrangeOrder(storedAnswer?.selected_option_ids?.length ? storedAnswer.selected_option_ids : currentQuestion.options.map((opt) => opt.id));
        setMultiSelectedIds(storedAnswer?.selected_option_ids ?? []);

        let word = '';
        if (isGuessTheWordPage) {
            try {
                const firebaseId = firebaseAuth.currentUser?.uid ?? "";
                word = (currentQuestion.answer ? decryptAnswer(currentQuestion.answer, firebaseId) : '') ?? '';
                word = word.trim().toUpperCase();
            } catch (error) {
                console.error("Failed to decrypt guess word answer:", error);
            }
            setGuessWord(word);

            if (guessWordSetupQuestionIdRef.current !== currentQuestion.id) {
                guessWordSetupQuestionIdRef.current = currentQuestion.id;

                const restoredState = restoredGuessWordStateRef.current;
                const canUseRestored = !isReviewMode && !!restoredState && restoredState.questionId === currentQuestion.id;

                if (canUseRestored && restoredState) {
                    setWordSlots(restoredState.wordSlots);
                    setGuessWordTiles(restoredState.tiles);
                    setUsedTileKeys(restoredState.usedTileKeys);
                    setSlotTileKeys(restoredState.slotTileKeys);
                } else {
                    const answeredLetters = storedAnswer?.answer ? storedAnswer.answer.split('') : [];
                    setWordSlots(answeredLetters.length ? answeredLetters : Array(word.length).fill(''));

                    const shuffledTiles = shuffleLetters(word.split(''));
                    setGuessWordTiles(shuffledTiles);

                    if (answeredLetters.length) {
                        const nextUsedTileKeys: Record<string, boolean> = {};
                        const nextSlotTileKeys: Record<number, string> = {};
                        const takenTileKeys = new Set<string>();

                        answeredLetters.forEach((letter, slotIdx) => {
                            const tileIdx = shuffledTiles.findIndex((tile, idx) => tile === letter && !takenTileKeys.has(`0-${idx}`));
                            if (tileIdx === -1) return;
                            const tileKey = `0-${tileIdx}`;
                            takenTileKeys.add(tileKey);
                            nextUsedTileKeys[tileKey] = true;
                            nextSlotTileKeys[slotIdx] = tileKey;
                        });

                        setUsedTileKeys(nextUsedTileKeys);
                        setSlotTileKeys(nextSlotTileKeys);
                    } else {
                        setUsedTileKeys({});
                        setSlotTileKeys({});
                    }
                }
            }
        }

        if (!isReviewMode) return;

        setRoundLocked(true);
        let status: 'correct' | 'wrong' | null = null;

        if (isGuessTheWordPage) {
            if (typeof storedAnswer?.answer === 'string') status = storedAnswer.answer === word ? 'correct' : 'wrong';
        } else if (answerType === AnswerType.Rearrange) {
            const selectedOrder = storedAnswer?.selected_option_ids ?? [];
            if (selectedOrder.length) {
                const expectedOrder = getExpectedRearrangeOrder(currentQuestion.options);
                status = expectedOrder.length === selectedOrder.length && expectedOrder.every((id, idx) => id === selectedOrder[idx])
                    ? 'correct' : 'wrong';
            }
        } else if (answerType === AnswerType.MultiSelect) {
            const selectedIds = storedAnswer?.selected_option_ids ?? [];
            if (selectedIds.length) {
                try {
                    const firebaseId = firebaseAuth.currentUser?.uid ?? "";
                    const expectedIds = currentQuestion.options
                        .filter((opt) => {
                            if (!opt.is_correct) return false;
                            const decoded = decryptAnswer(opt.is_correct, firebaseId);
                            return decoded === "1" || decoded?.toLowerCase() === "true";
                        })
                        .map((opt) => opt.id);
                    const selectedSet = new Set(selectedIds);
                    status = expectedIds.length === selectedSet.size && expectedIds.every((id) => selectedSet.has(id))
                        ? 'correct' : 'wrong';
                } catch (error) {
                    console.error("Failed to evaluate review answer:", error);
                }
            }
        } else {
            const optIdx = storedAnswer?.selected_option_id != null
                ? currentQuestion.options.findIndex((opt) => opt.id === storedAnswer.selected_option_id)
                : -1;
            setSelected(optIdx >= 0 ? optIdx : null);
            if (optIdx >= 0) {
                const opt = currentQuestion.options[optIdx];
                try {
                    const firebaseId = firebaseAuth.currentUser?.uid ?? "";
                    const decoded = opt.is_correct ? decryptAnswer(opt.is_correct, firebaseId) : null;
                    status = (decoded === "1" || decoded?.toLowerCase() === "true") ? 'correct' : 'wrong';
                } catch (error) {
                    console.error("Failed to evaluate review answer:", error);
                }
            }
        }
        setAnswerStatus(status);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentQuestion?.id, currentOptionIdsKey, isReviewMode, firebaseUid]);

    useEffect(() => {
        setAudioFinished(!isAudioQuizPage || isReviewMode);
    }, [currentQuestion?.id, isAudioQuizPage, isReviewMode]);

    const waitingForAudio = isAudioQuizPage && !isReviewMode && !audioFinished;

    useEffect(() => {
        if (!currentQuestion || roundLocked || waitingForAudio) return;

        const intervalId = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(intervalId);
    }, [currentQuestion?.id, roundLocked, waitingForAudio]);

    useEffect(() => {
        if (timeLeft !== 0 || !currentQuestion) return;
        if (isExamPage) {
            handleExamSubmit();
        } else if (isSelfChallenge) {
            handleExamNext();
        } else if (!roundLocked) {
            handleTimeout();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeLeft]);

    useEffect(() => {
        if (isBookmarksPlayPage) return;
        if (isExamPage) {
            if (!examData?.data) return;
            saveQuizSession(sessionKey, {
                currentIndex,
                timeLeft,
                roundLocked,
                usedLifelines,
                skippedQuestionId,
                eliminatedOptionIds,
                pollPercentages,
                lifelineUsedThisQuestion,
                hintsUsedCount,
                hintsUsedThisQuestion,
                correctCount,
                wrongCount,
                quizStartTime: quizStartTimeRef.current,
                answers: answersRef.current,
                quizResponse: examData,
                examAnswers,
            });
            return;
        }
        if (!data?.data) return;
        saveQuizSession(sessionKey, {
            currentIndex,
            timeLeft,
            roundLocked,
            usedLifelines,
            skippedQuestionId,
            eliminatedOptionIds,
            pollPercentages,
            lifelineUsedThisQuestion,
            hintsUsedCount,
            hintsUsedThisQuestion,
            correctCount,
            wrongCount,
            quizStartTime: quizStartTimeRef.current,
            answers: answersRef.current,
            quizResponse: data,
            guessWordState: isGuessTheWordPage && currentQuestion ? {
                questionId: currentQuestion.id,
                wordSlots,
                tiles: guessWordTiles,
                usedTileKeys,
                slotTileKeys,
            } : null,
        });
    }, [sessionKey, data, examData, isExamPage, isBookmarksPlayPage, examAnswers, currentIndex, timeLeft, roundLocked, usedLifelines, skippedQuestionId, eliminatedOptionIds, pollPercentages, lifelineUsedThisQuestion, hintsUsedCount, hintsUsedThisQuestion, correctCount, wrongCount, isGuessTheWordPage, currentQuestion, wordSlots, guessWordTiles, usedTileKeys, slotTileKeys]);

    const current = totalQuestions ? currentIndex + 1 : 0;
    const timerProgress = quizDuration ? Math.round((timeLeft / quizDuration) * 100) : 0;

    const allLifeLines = [
        {
            key: 'fiftyFifty' as const,
            icon: <FiftyFifty className="dark:invert" />,
            label: '50-50',
            fullOnly: true,
            used: usedLifelines.fiftyFifty,
            onClick: handleFiftyFifty,
        },
        {
            key: 'audiencePoll' as const,
            icon: <UserPoll className="dark:invert" />,
            label: t('userPoll'),
            fullOnly: true,
            used: usedLifelines.audiencePoll,
            onClick: handleAudiencePoll,
        },
        {
            key: 'resetTimer' as const,
            icon: <ResetTimer className="dark:invert" />,
            label: t('reset'),
            fullOnly: false,
            used: usedLifelines.resetTimer,
            onClick: handleResetTimer,
        },
        {
            key: 'skip' as const,
            icon: <Skip className="dark:invert" />,
            label: t('skip'),
            fullOnly: false,
            used: usedLifelines.skip,
            onClick: handleSkip,
        },
    ]

    const lifeLines = (hasFullLifeLines ? allLifeLines : allLifeLines.filter((item) => !item.fullOnly))
        .map((item) => ({ ...item, disabled: item.used || lifelineUsedThisQuestion }));

    const hintLabel = Number.isFinite(maxHintsPerQuestion)
        ? `${t('hint')} (${hintsUsedThisQuestion}/${maxHintsPerQuestion})`
        : t('hint');

    const guessWordLifeLines = [
        {
            key: 'hint',
            icon: <Hint className="dark:invert" />,
            label: hintLabel,
            disabled: !hintAvailable,
            onClick: handleHint,
        },
        {
            key: 'erase',
            icon: <Erase className="dark:invert" />,
            label: t('erase'),
            disabled: false,
            onClick: handleErase,
            costsCoin: false,
        },
    ]

    const battlePlayers: BattlePlayerView[] = useMemo(() => {
        if (!isBattlePage) return [];

        if (isBotMatch) {
            return [
                {
                    uid: myIdentity,
                    name: profile?.name || t('you'),
                    avatarUrl: profile?.profile || null,
                    attendQuestions: currentIndex,
                    totalQuestions,
                    muted: false,
                },
                {
                    uid: 'bot',
                    name: t('bot'),
                    avatarUrl: null,
                    attendQuestions: currentIndex,
                    totalQuestions,
                    muted: false,
                },
            ];
        }

        if (isGroupBattlePage) {
            const users = battleRoom?.users ?? [];
            return users.map((u, idx): BattlePlayerView => {
                const isMe = !!u.uid && u.uid === myIdentity;
                return {
                    uid: u.uid || `waiting-${idx}`,
                    name: !u.uid ? t('waiting') : isMe ? (profile?.name || t('you')) : (u.name || t('player')),
                    avatarUrl: !u.uid ? null : (isMe ? (u.profile || profile?.profile || null) : (u.profile || null)),
                    attendQuestions: !u.uid ? 0 : (isMe ? (u.answers?.length ?? currentIndex) : (u.answers?.length ?? 0)),
                    totalQuestions,
                    muted: !u.uid,
                    bubble: u.uid ? battleBubbles[u.uid] : undefined,
                };
            });
        }

        const meUser = battleRoom?.users.find((u) => u.uid === myIdentity);
        const opponentUser = battleRoom?.users.find((u) => u.uid && u.uid !== myIdentity);

        return [
            {
                uid: myIdentity,
                name: meUser?.name || profile?.name || t('you'),
                avatarUrl: meUser?.profile || profile?.profile || null,
                attendQuestions: meUser?.answers?.length ?? currentIndex,
                totalQuestions,
                muted: false,
                bubble: battleBubbles[myIdentity],
            },
            {
                uid: opponentUser?.uid ?? '',
                name: opponentUser?.name || t('waiting'),
                avatarUrl: opponentUser?.profile || null,
                attendQuestions: opponentUser?.answers?.length ?? 0,
                totalQuestions,
                muted: !opponentUser?.uid,
                bubble: opponentUser?.uid ? battleBubbles[opponentUser.uid] : undefined,
            },
        ];
    }, [isBattlePage, isBotMatch, isGroupBattlePage, battleRoom, myIdentity, profile, currentIndex, totalQuestions, t, battleBubbles]);

    return (
        <Layout>
            <section className="primaryContainerBg min-h-screen pb-10 md:pb-20">
                <div className="container py-6 md:pt-8">
                    <div className="flex items-center justify-between gap-3 sm:gap-4">
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                            <button
                                aria-label="Close quiz"
                                onClick={async () => {
                                    if (isBotMatch) {
                                        router.back();
                                        return;
                                    }
                                    if (isGroupBattlePage && isLiveBattleMatch) {
                                        battleFinishedRef.current = true;
                                        await leaveBattleRoom(myIdentity);
                                        router.back();
                                        return;
                                    }
                                    if (isLiveBattleMatch) {
                                        battleFinishedRef.current = true;
                                        await leaveBattleRoom(myIdentity);
                                        await submitAllAnswers();
                                        return;
                                    }
                                    clearQuizSession(sessionKey);
                                    queryClient.removeQueries({ queryKey: ["quiz-questions"] });
                                    queryClient.removeQueries({ queryKey: ["fun-learn-questions"] });
                                    queryClient.removeQueries({ queryKey: ["exam-module-questions"] });
                                    queryClient.removeQueries({ queryKey: ["exam-answer-key"] });
                                    queryClient.removeQueries({ queryKey: ["contest-questions"] });
                                    if (isBookmarksPlayPage) {
                                        dispatch(setBookmarksPlaySession(null));
                                    }
                                    router.back();
                                }}
                                className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl flexCenter surfaceContainerLowestBg shadow-[0px_8px_32px_0px_#0000000A]"
                            >
                                <X className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                            {isReviewMode ? (
                                <Typography variant="h4" className="text-sm! md:text-xl! font-semibold md:font-medium font-nunito! leading-5 md:leading-7 onSurfaceColor">
                                    {t('reviewAnswers')}
                                </Typography>
                            ) : !isFunLearnPage && !isExamPage && !isDailyQuizPage && !isSelfChallenge && !isContestPage && !isBookmarksPlayPage && !isBattlePage && (
                                <Typography variant="h4" className="text-sm! md:text-xl! font-semibold md:font-medium font-nunito! leading-5 md:leading-7 onSurfaceColor">
                                    {t('level')} {selectedLevelNo ?? level}
                                </Typography>
                            )}
                        </div>

                        {/* Coins badge */}
                        <div className="relative flexCenter shrink-0 pr-3">
                            <div className="primaryBg rounded-full py-1 pl-4 pr-9">
                                <Typography variant="h4" className="text-sm! md:text-xl! font-medium md:font-bold font-nunito! leading-5 md:leading-7 onPrimaryColor">
                                    {coins}
                                </Typography>
                            </div>
                            <Coin width={40} height={40} className="absolute -right-1" />
                        </div>
                    </div>
                </div>

                <div className="max-w-262 mx-auto w-full px-4 max-575:max-w-full between-576-767:max-w-135 between-768-991:max-w-180 flexCol gap-6 md:gap-8 pt-6 md:pt-8">

                    <StatsBar
                        timeLeft={timeLeft}
                        timerProgress={timerProgress}
                        current={current}
                        totalQuestions={totalQuestions}
                        isBattleScreen={isBattlePage}
                        chatOpen={chatOpen}
                        onChatOpenChange={setChatOpen}
                        onSendMessage={isLiveBattleMatch ? (text) => sendBattleMessage(myIdentity, text, true) : undefined}
                        score={score}
                        t={t}
                        isExamPage={isExamPage}
                        onOpenAttempts={() => setAttemptsModal(true)}
                        isReviewMode={isReviewMode}
                        isBookmarked={!!currentQuestion && bookmarkedQuestionIds.has(currentQuestion.id)}
                        onBookmark={handleBookmark}
                        onReport={() => setReportModal(true)}
                        isDailyQuizPage={isDailyQuizPage}
                        isSelfChallengePage={isSelfChallenge}
                        isFunLearnPage={isFunLearnPage}
                    />

                    {groupWaitingForOthers ? (
                        <div className="surfaceContainerLowestBg rounded-2xl p-8 md:p-12 flexColCenter gap-2 text-center shadow-[0px_8px_32px_0px_#0000000A]">
                            <Typography variant="h4" weight="semibold" className="onSurfaceColor">
                                {t('waitingForOthers')}
                            </Typography>
                            <Typography variant="subtitle2" weight="regular" className="onSurfaceVarColor! font-nunito!">
                                {t('waitingForOthersDesc')}
                            </Typography>
                        </div>
                    ) : isLoading ? (
                        <QuestionsOptsSkeleton />
                    ) : isError || !currentQuestion ? (
                        <Typography variant="h5" className="text-center onSurfaceVarColor">{getErrorMessage(queryError, t('noQuestionsAvailable'))}</Typography>
                    ) : (
                        <div className="grid lg:grid-cols-2 gap-6 items-start">
                            <QuestionCard
                                questionId={currentQuestion.id}
                                question={question}
                                image={currentQuestion.image}
                                audio={currentQuestion.audio}
                                isMathManiaPage={isMathManiaPage}
                                isExamPage={isExamPage}
                                onAudioEnded={() => setAudioFinished(true)}
                            />

                            <div className="flexCol gap-4">
                            {isGuessTheWordPage ? (
                                <GuessWordPanel
                                    wordSlots={wordSlots}
                                    tileRows={guessWordTileRows}
                                    usedTileKeys={usedTileKeys}
                                    roundLocked={roundLocked}
                                    answerStatus={answerStatus}
                                    showCorrectness={isReviewMode || showCorrectness || isAnyBattleMatchPage}
                                    isWordComplete={isWordComplete}
                                    correctWord={guessWord}
                                    revealAnswer={answerMode === '3'}
                                    isReviewMode={isReviewMode}
                                    onSlotClick={handleSlotClick}
                                    onTileClick={handleTileClick}
                                    onSubmit={handleGuessWordSubmit}
                                    t={t}
                                />
                            ) : isRearrangeQuestion ? (
                                <RearrangePanel
                                    options={options}
                                    order={rearrangeOrder}
                                    correctOrder={getExpectedRearrangeOrder(options)}
                                    roundLocked={roundLocked}
                                    answerStatus={answerStatus}
                                    showCorrectness={isReviewMode || showCorrectness || isAnyBattleMatchPage}
                                    isReviewMode={isReviewMode}
                                    onDragEnd={handleRearrangeDragEnd}
                                    onMove={moveRearrangeOption}
                                    onConfirm={handleConfirmAnswer}
                                    t={t}
                                />
                            ) : isMultiSelectQuestion ? (
                                <MultiSelectPanel
                                    options={options}
                                    selectedIds={multiSelectedIds}
                                    roundLocked={roundLocked}
                                    answerStatus={answerStatus}
                                    showCorrectness={isReviewMode || showCorrectness || isAnyBattleMatchPage}
                                    isReviewMode={isReviewMode}
                                    isMathManiaPage={isMathManiaPage}
                                    isOptionCorrect={isOptionCorrect}
                                    onToggle={toggleMultiSelectOption}
                                    onConfirm={handleConfirmAnswer}
                                    t={t}
                                />
                            ) : isExamPage ? (
                                <ChoicePanel
                                    options={options}
                                    selected={isReviewMode ? null : (examSelectedIndex >= 0 ? examSelectedIndex : null)}
                                    answerStatus={null}
                                    eliminatedOptionIds={[]}
                                    pollPercentages={null}
                                    isMathManiaPage={isMathManiaPage}
                                    isExamPage={isExamPage}
                                    isOptionCorrect={isOptionCorrect}
                                    forceRevealCorrect={isReviewMode}
                                    revealOnSelect={false}
                                    onSelect={isReviewMode ? () => { } : handleExamOptionSelect}
                                />
                            ) : isSelfChallenge && !isReviewMode ? (
                                <ChoicePanel
                                    options={options}
                                    selected={examSelectedIndex >= 0 ? examSelectedIndex : null}
                                    answerStatus={null}
                                    eliminatedOptionIds={[]}
                                    pollPercentages={null}
                                    isMathManiaPage={isMathManiaPage}
                                    isOptionCorrect={isOptionCorrect}
                                    forceRevealCorrect={false}
                                    revealOnSelect={false}
                                    onSelect={handleSelfChallengeOptionSelect}
                                />
                            ) : waitingForAudio ? (
                                <div className="surfaceContainerLowestBg rounded-[42px] p-4 md:p-6 flexCol gap-4 shadow-[0px_8px_32px_0px_#0000000A]">
                                    {options.map((opt) => (
                                        <div key={opt.letter} className="w-full flex items-center gap-4 p-3 md:p-4 rounded-2xl">
                                            <span className="shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full flexCenter text-xl md:text-3xl font-normal font-candal leading-7 md:leading-9 surfaceContainerLowestBg onSurfaceColor">
                                                {opt.letter}
                                            </span>
                                            <Skeleton className="h-5 md:h-7 flex-1" />
                                        </div>
                                    ))}
                                    <Button
                                        variant="primary"
                                        className="rounded-full! w-fit mx-auto px-8!"
                                        onClick={() => setAudioFinished(true)}
                                    >
                                        {t('showOptions')}
                                    </Button>
                                </div>
                            ) : (
                                <ChoicePanel
                                    options={options}
                                    selected={selected}
                                    answerStatus={isContestPage ? null : answerStatus}
                                    eliminatedOptionIds={eliminatedOptionIds}
                                    pollPercentages={pollPercentages}
                                    isMathManiaPage={isMathManiaPage}
                                    isOptionCorrect={isOptionCorrect}
                                    forceRevealCorrect={isReviewMode}
                                    alwaysShowCorrectness={isAnyBattleMatchPage}
                                    revealOnSelect={!isContestPage}
                                    onSelect={isReviewMode ? () => { } : handleOptionSelect}
                                />
                            )}
                            {isReviewMode && !!currentQuestion.note && (
                                <div className="surfaceContainerLowestBg rounded-2xl p-4 md:p-6 shadow-[0px_8px_32px_0px_#0000000A]">
                                    <Typography variant="h6" weight="semibold" className="onSurfaceColor mb-1">
                                        {t('note')}
                                    </Typography>
                                    <Typography variant="subtitle2" className="onSurfaceVarColor! font-nunito!">
                                        {currentQuestion.note}
                                    </Typography>
                                </div>
                            )}
                            </div>
                        </div>
                    )}
                </div>
                {showLifeLine && <LifelineBar items={lifeLines} layout="vertical" />}
                {isGuessTheWordPage && !isReviewMode && <LifelineBar items={guessWordLifeLines} layout="horizontal" />}
                {(isExamPage || isSelfChallenge) && !isReviewMode && (
                    <ExamNavBar
                        canGoPrev={currentIndex > 0}
                        canGoNext={!!quizAttemptId}
                        onPrev={handleExamPrev}
                        onNext={handleExamNext}
                    />
                )}
                {isReviewMode && !!currentQuestion && (
                    <ExamNavBar
                        canGoPrev={currentIndex > 0}
                        canGoNext={currentIndex + 1 < totalQuestions}
                        onPrev={() => setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev))}
                        onNext={() => setCurrentIndex((prev) => (prev + 1 < totalQuestions ? prev + 1 : prev))}
                    />
                )}
                {(isExamPage || isSelfChallenge) && !isReviewMode && (
                    <MyAttemptsModal
                        open={attemptsModal}
                        onClose={setAttemptsModal}
                        totalQuestions={totalQuestions}
                        attemptedQuestionNumbers={attemptedQuestionNumbers}
                        onSelectQuestion={setCurrentIndex}
                        onSubmit={isSelfChallenge ? handleSelfChallengeSubmit : handleExamSubmit}
                    />
                )}
                {isReviewMode && (
                    <MyAttemptsModal
                        open={attemptsModal}
                        onClose={setAttemptsModal}
                        totalQuestions={totalQuestions}
                        correctQuestionNumbers={correctQuestionNumbers}
                        wrongQuestionNumbers={wrongQuestionNumbers}
                        onSelectQuestion={setCurrentIndex}
                        hideSubmit
                    />
                )}
                {isReviewMode && !!currentQuestion && (
                    <ReportQuestionModal
                        open={reportModal}
                        onClose={setReportModal}
                        questionId={currentQuestion.id}
                        questionType={reportQuestionType}
                    />
                )}

                {isBattlePage && <BattleSection isGroupBattlePage={!!isGroupBattlePage} players={battlePlayers} />}
            </section>
        </Layout>
    )
}

export default withAuthGuard(PlayScreen)
