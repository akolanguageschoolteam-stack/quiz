import { StaticImageData } from "next/image";

export interface ComprehensiveType {
    img?: StaticImageData | string,
    title: string,
    questions: number
}

export interface SubCategoryType {
    id: number,
    img: StaticImageData | string,
    title: string,
    levels: number,
    levelDetails?: CategoryLevel[],
    questions: number,
    has_level: boolean,
    /** Fun & Learn: number of comprehensives shown in the sub-category subtitle. */
    comprehensivesCount?: number,
    /** Fun & Learn: comprehensive rows revealed when the sub-category expands. */
    comprehensives?: ComprehensiveType[]
}

export interface CategoryType {
    id: number,
    img: StaticImageData | string,
    title: string,
    desc: string,
    coins?: number,
    levels?: CategoryLevel[],
    subCategories?: SubCategoryType[],
    /** Fun & Learn comprehensive listing — opens ComprehensiveModal instead of level/sub modals. */
    comprehensive?: boolean,
    /** Fun & Learn sub-category → comprehensives accordion — opens SubComprehensiveModal. */
    subComprehensive?: boolean,
    level_count?: number,
    subcategories_count: number,
    has_level: boolean,
    has_unlocked?: boolean,
    /** Fun & Learn: comprehensions listed in ComprehensiveModal. */
    comprehensions?: FunLearnComprehension[],
}


export interface QuizItemType {
    img: StaticImageData | string,
    title: string,
    desc: string,
    href: string,
    moduleType: number,
    isVisible?: boolean,
    guestModeKey?: string
}

export type QuizTypeObject = QuizItemType[];

export interface ContestPrizeType {
    rank: string,
    amount: number
}

export interface ContestPlayType {
    img: StaticImageData | string,
    title: string,
    description: string,
    entryFee: number,
    players: string,
    joinFee: number,
    days: number,
    fromDate: string,
    toDate: string,
    timeWins: number,
    playersJoined: string,
    prizePool: ContestPrizeType[],
    hasPlayed: boolean,
    hasJoined: boolean
}


export interface FunLearnContent {
    id: number;
    category_id: number;
    content_type_id: number;
    title: string;
    detail: string;
    media_type: number;
    media_data: string | null;
    status: boolean;
    is_bookmarked: boolean;
    questions_count: number;
}

export interface FunLearnContentResponse {
    success: boolean;
    code: number;
    message: string;
    data: FunLearnContent;
}

export interface FunLearnQuestionOption {
    id: number;
    text: string;
    sequence: number;
    is_correct: {
        ciphertext: string;
        iv: string;
    };
}

export interface FunLearnQuestion {
    id: number;
    fun_n_learn_id: number;
    question_type: number;
    question: string;
    image: string | null;
    options: FunLearnQuestionOption[];
}

export interface FunLearnQuestionsData {
    quiz_attempt_id: number;
    questions: FunLearnQuestion[];
}

export interface FunLearnQuestionsResponse {
    success: boolean;
    code: number;
    message: string;
    data: FunLearnQuestionsData;
}

export interface CategoryLevel {
    id: number;
    level: number;
    questions_count: number;
    is_unlocked: boolean;
}

export interface FunLearnComprehension {
    id: number;
    title: string;
    questions_count: number;
}

export interface CategoryInterface {
    id: number;
    parent_id: number | null;
    content_type_id: number;
    name: string;
    slug: string;
    image: string | null;
    module_type: number;
    has_level: boolean;
    level_count: number;
    is_premium: boolean;
    coins_required: number;
    status: boolean;
    sequence: number;
    questions_count: number;
    subcategories_count: number;
    has_unlocked: boolean;
    levels: CategoryLevel[] | null;
    comprehension_counts?: number;
    comprehensions?: FunLearnComprehension[] | null;
}

export interface ResponseData<T> {
    success: boolean;
    message: string;
    data: T;
    code: number;
}

export interface Pagination {
    total: number;
    offset: number;
    limit: number;
}

export interface SocialMediaLink {
    link: string;
    icon: string;
}

// Almost every key is a flat string, except social_media which comes back as a structured
// array — intersecting instead of adding it as a plain property keeps every other
// `webSettings?.some_key` string access working untyped/unchanged.
export type WebSettingsResponse = Record<string, string> & {
    social_media?: SocialMediaLink[];
};

export interface HomeSettingsSection {
    section: number;
    is_active: boolean;
    images: string[];
    heading: string;
    titles?: string[];
    descriptions?: string[];
}

export interface HomeSettingsResponse {
    sections: HomeSettingsSection[];
}

export interface WebSliderItem {
    id: number;
    image: string;
    title: string;
    description: string;
}

export type WebSlidersResponse = WebSliderItem[];

export interface PageContentResponse {
    title: string;
    slug: string;
    page_content: string | null;
}

export interface LanguageItem {
    id: number;
    name: string;
    code: string;
    is_rtl: boolean;
    is_default: boolean;
    sequence: number;
    updated_at: string;
}

export type LanguagesResponse = LanguageItem[];

export interface ContentTypeItem {
    id: number;
    name: string;
    slug: string;
    is_default: boolean;
    sequence: number;
}

export type ContentTypesResponse = ContentTypeItem[];

export type TranslationsResponse = Record<string, string>;

export interface CategoriesResponse {
    categories: CategoryInterface[];
    pagination: Pagination;
}

export interface SubCategoriesResponse {
    subcategories: CategoryInterface[];
    pagination: Pagination;
}

export interface CheckExistsPayload {
    firebase_id: string;
    fcm_token: string | null;
    type: 'google' | 'email' | 'apple' | 'mobile';
    mail_address?: string | null;
}

export interface CheckExistsResponse {
    is_exists: boolean;
    token?: string;
    [key: string]: unknown;
}

export interface SignupPayload {
    firebase_id: string;
    type: string;
    name?: string | null;
    email?: string | null;
    mobile?: string | null;
    profile?: string | null;
    fcm_token?: string | null;
    friends_code?: string | null;
}

export type SignupResponse = CheckExistsResponse

export interface ConvertGuestPayload {
    type: string;
    name?: string | null;
    email?: string | null;
    mobile?: string | null;
}

export type ConvertGuestResponse = UserProfileResponse

export interface UserProfileResponse {
    id: number;
    firebase_id: string;
    name: string;
    email: string | null;
    mobile: string | null;
    type: string;
    is_guest?: boolean;
    profile: string | null;
    total_coins: number;
    redeemable_coins: number;
    refer_code: string;
    friends_code: string;
    status: boolean;
    remove_ads: boolean;
    date_registered: string;
    all_time_score: number;
    all_time_rank: number;
    daily_ads_available: boolean;
    daily_ads_counter_used: number;
    daily_ads_counter_max: number;
    unclaimed_rewards_count: number;
    has_played_daily_quiz: boolean;
}

export interface EncryptedPayload {
    ciphertext: string;
    iv: string;
}

export interface QuizQuestionOption {
    id: number;
    text: string;
    is_correct?: EncryptedPayload;
    correct_sequence?: EncryptedPayload;
}

export interface QuizQuestion {
    id: number;
    category_id: number;
    content_type_id: number;
    level_id: number;
    question_type: number;
    answer_type?: number;
    question: string;
    note: string | null;
    audio_url?: string | null;
    image?: string | null;
    media_type?: string | null;
    media_url?: string | null;
    options?: QuizQuestionOption[];
    // present for guess-the-word questions instead of options
    answer?: EncryptedPayload;
}

export interface QuizQuestionsResponse {
    quiz_attempt_id: number;
    questions: QuizQuestion[];
}

export interface BattleQuestion {
    id: number;
    category_id: number;
    content_type_id: number;
    level_id: number | null;
    question_type: number;
    question: string;
    note: string | null;
    media_url: string | null;
    options: QuizQuestionOption[];
}

export interface BattleRoomApiData {
    id: number;
    room_code: string;
    host_user_id: number;
    room_type: number;
    entry_coin: number;
    category_id: number | null;
    content_type_id: number | null;
    max_players: number;
    duration_seconds: number;
    questions_count: number;
    questions: BattleQuestion[];
    created_at: string | null;
}

export interface CreateBattleRoomPayload {
    room_type: 'group' | 'one_vs_one' | 'random';
    entry_coin: number | null;
    category_id: number | null;
    content_type_id: number | null;
}

export interface JoinBattleRoomPayload {
    room_code: string;
}

export interface BattleRoomQuestionsPayload {
    room_code: string;
}

export interface BattleRoomQuestionsResponse {
    room: BattleRoomApiData;
    questions: BattleQuestion[];
}

export interface BattleSubmitAnswer {
    question_id: number;
    selected_option_id: number | null;
    seconds: number;
}

export interface BattleSubmitResultEntry {
    user_id: number;
    answers: BattleSubmitAnswer[];
}

export interface SubmitBattleResultPayload {
    room_code: string;
    results: BattleSubmitResultEntry[];
}

export interface BattleResultParticipant {
    user_id: number;
    is_host: boolean;
    completed: boolean;
    score: number;
    correct_count: number;
    wrong_count: number;
    total_questions: number;
    winning_percentage: number;
    total_coins: number;
    total_score: number;
    total_time_taken: number;
    rank: number;
    payout_coin: number;
}

export interface BattleResultResponse {
    status: string;
    is_bot_match: boolean;
    winner_user_id: number | null;
    is_draw: boolean;
    winner_coin: number;
    participants: BattleResultParticipant[];
}

export interface DeleteBattleRoomPayload {
    room_code: string;
}

export interface SubmitAnswerPayload {
    quiz_attempt_id: number;
    skipped_question_id: number | null;
    lifelines_used: number;
    answers: {
        question_id: number;
        selected_option_id?: number | null;
        // populated instead of selected_option_id for answer_type 1 (rearrange, order = sequence) and 2 (multi-select)
        selected_option_ids?: number[];
        // populated instead of selected_option_id for guess-the-word questions mixed into a self-challenge session
        answer?: string;
    }[];
}

export interface SubmitAnswerResponse {
    total_questions: number;
    correct_answers: number;
    wrong_answers: number;
    skipped_answers: number;
    winning_percentage: number;
    earn_coin: number;
    score: number;
    total_coins: number;
    total_score: number;
    unlocked_level: number | null;
    unlocked_level_id: number | null;
}

export interface FunLearnSubmitPayload {
    quiz_attempt_id: number;
    skipped_question_id: number | null;
    total_play_time: number;
    answers: {
        question_id: number;
        selected_option_id?: number | null;
    }[];
}

export interface FunLearnSubmitResponse {
    success: boolean;
    code: number;
    message: string;
    data: SubmitAnswerResponse;
}

export interface GuessWordSubmitPayload {
    quiz_attempt_id: number;
    skipped_question_id: number | null;
    total_play_time: number;
    lifelines_used: number;
    answers: {
        question_id: number;
        answer: string;
    }[];
}

export interface BookmarkAttemptedAnswer {
    answer_mode: 'single' | 'multi' | 'rearrange' | 'text';
    selected_option_id?: number | null;
    selected_option_ids?: number[];
    ordered_option_ids?: number[];
    answer?: string;
}

export interface ReportQuestionPayload {
    question_type: string;
    question_id: number;
    message: string;
}

export interface BookmarkPayload {
    quiz_type: number;
    question_id: number;
    status: boolean;
    was_correct_at_bookmark?: boolean;
    attempted_answer?: BookmarkAttemptedAnswer;
}

export interface BookmarkToggleResponse {
    is_bookmarked: boolean;
    changed: boolean;
}

export interface BookmarkCheckPayload {
    quiz_type: number;
    question_ids: number[];
}

export interface BookmarkCheckResponse {
    bookmarks: {
        question_id: number;
        is_bookmarked: boolean;
    }[];
}

export interface BookmarkQuestion {
    id: number;
    category_id: number;
    content_type_id: number;
    level_id?: number;
    question_type?: number;
    question?: string;
    note?: string | null;
    media_url?: string | null;
    options?: QuizQuestionOption[];
    answer_type?: number;
    answer?: EncryptedPayload;
    title?: string;
    detail?: string;
}

export interface BookmarkListItem {
    quiz_type: number;
    question_id: number;
    attempted_answer: BookmarkAttemptedAnswer | null;
    was_correct_at_bookmark: boolean | null;
    bookmarked_at: string | null;
    question: BookmarkQuestion;
}

export interface BookmarkListResponse {
    bookmarks: BookmarkListItem[];
    pagination: Pagination;
}

export interface CoinScorePayload {
    amount: number;
    source: string;
    description: string | null;
}

export interface CoinScoreResponse {
    success: boolean;
    code: number;
    message: string;
    data: unknown;
}

export interface ExamAttempt {
    id: number;
    exam_id: number;
    user_id: number;
    score: number;
    correct_answers: number;
    wrong_answers: number;
    skipped_answers: number;
    total_questions: number;
    created_at: string;
    updated_at: string;
}

export interface ExamItem {
    id: number;
    title: string;
    exam_code: EncryptedPayload;
    duration: number;
    answer_again: boolean;
    total_marks: number;
    starts_at: string;
    ends_at: string | null;
    is_active: boolean;
    latex_mode: boolean;
    questions_count: number;
    my_attempt: ExamAttempt | null;
}

export interface ExamsResponse {
    exams: ExamItem[];
    pagination: Pagination;
}

export interface ContestPrize {
    rank: number;
    coins: number;
}

export interface ContestWinner {
    rank: number;
    coins: number;
    user_id: number;
    name: string;
    profile: string | null;
    score: number;
}

export interface ContestItem {
    id: number;
    content_type_id: number | null;
    name: string;
    description: string | null;
    image: string;
    entry_coins: number;
    start_date: string;
    end_date: string;
    status: boolean;
    prize_status: number;
    participants_count: number;
    total_prize_coins: number;
    has_joined: boolean;
    has_played: boolean;
    prizes: ContestPrize[] | null;
    winners: ContestWinner[] | null;
}

export interface ContestsResponse {
    contests: ContestItem[];
    pagination: Pagination;
}

export interface JoinContestResponse {
    has_played: boolean;
    new_coin_balance: number;
}

export interface ContestQuestionOption {
    id: number;
    text: string;
    sequence: number;
    is_correct?: EncryptedPayload;
}

export interface ContestQuestion {
    id: number;
    contest_id: number;
    question_type: number;
    question: string;
    image: string | null;
    note: string | null;
    options: ContestQuestionOption[];
}

export interface ContestQuestionsResponse {
    quiz_attempt_id: number;
    questions: ContestQuestion[];
}

export interface ContestLeaderboardUser {
    user_id: number;
    name: string;
    email: string;
    profile: string | null;
    score: number;
    user_rank: number;
}

export interface ContestLeaderboardResponse {
    my_rank: ContestLeaderboardUser;
    other_users_rank: ContestLeaderboardUser[];
    top_three_ranks: ContestLeaderboardUser[];
    pagination: Pagination;
}

export interface ContestSubmitPayload {
    answers: {
        question_id: number;
        selected_option_id: number | null;
    }[];
}


export interface ExamModuleQuestionsPayload {
    exam_module_id: number;
    exam_code: number;
}

export type ExamModuleQuestionsResponse = QuizQuestionsResponse;

export interface ExamSubmitPayload {
    quiz_attempt_id: number;
    attempted_time_duration: number | null;
    violation_count: number | null;
    answers: {
        question_id: number;
        selected_option_id: number | null;
    }[];
}

export interface ExamAttemptResult {
    id: number;
    status: string;
    total_score: number;
    total_exam_marks: number;
    correct_count: number;
    wrong_count: number;
    skipped_count: number;
    total_questions: number;
    mark_wise_stats: {
        mark: number;
        correct_questions: number;
        incorrect_questions: number;
    }[];
    violation_count: number;
    attempted_time_duration: number;
}

export interface ExamSubmitResponse {
    attempt: ExamAttemptResult;
    was_already_submitted: boolean;
}

export interface ExamAnswerKeyOption {
    id: number;
    text: string;
    is_correct: boolean;
}

export interface ExamAnswerKeyQuestion {
    id: number;
    exam_id: number;
    question_type: number;
    question: string;
    image: string | null;
    marks: number;
    options: ExamAnswerKeyOption[];
}

export interface ExamAnswerKeyResponse {
    exam_module_id: number;
    questions: ExamAnswerKeyQuestion[];
}

export type StatisticsModuleLabel = 'quiz_zone' | 'multi_match' | 'guess_word' | 'math_quiz' | 'audio';

export interface StatisticsTotals {
    total_questions: number;
    correct_answered: number;
    wrong_answered: number;
    percentage: number;
}

export interface StatisticsModuleStats extends StatisticsTotals {
    label: StatisticsModuleLabel;
}

export interface StatisticsOneVsOneStats {
    total_played: number;
    total_won: number;
    total_lose: number;
    percentage: number;
}

export interface StatisticsGroupBattleStats {
    total_played: number;
    rank_1_count: number;
    rank_2_count: number;
    rank_3_count: number;
    rank_4_count: number;
}

export interface StatisticsBattleStats {
    total_played: number;
    total_won: number;
    total_lose: number;
    percentage: number;
    one_vs_one: StatisticsOneVsOneStats;
    group: StatisticsGroupBattleStats;
}
export interface BadgeItem {
    id: number;
    type: string;
    label: string;
    note: string;
    icon: string | null;
    reward: number;
    counter_required: number;
    counter_progress: number;
    is_unlocked: boolean;
    is_reward_claimed: boolean;
    counter_date: string | null;
}

export type BadgesListResponse = BadgeItem[];

export interface StatisticsResponse {
    badges: BadgeItem[];
    quiz_stats: StatisticsModuleStats[];
    grand_total: StatisticsTotals;
    battle: StatisticsBattleStats;
}
export interface CoinTransaction {
    id: number;
    type: 'credit' | 'debit';
    source: string;
    amount: number;
    balance_after: number;
    description: string;
    status: 'completed' | 'pending' | 'failed';
    created_at: string;
}

export interface CoinHistoryResponse {
    transactions: CoinTransaction[];
    pagination: Pagination;
}

export interface NotificationItem {
    id: number;
    title: string;
    message: string;
    type: string;
    scope: string;
    image: string | null;
    sent_at: string;
}

export interface NotificationListResponse {
    items: NotificationItem[];
    pagination: Pagination;
}

export type PaymentMethodFieldType = 'text' | 'number' | 'email' | 'textarea';

export interface PaymentMethodField {
    id: number;
    key: string;
    label: string;
    field_type: PaymentMethodFieldType;
    placeholder: string | null;
    is_required: boolean;
}

export interface PaymentMethod {
    id: number;
    name: string;
    icon_url: string | null;
    fields: PaymentMethodField[];
}

export type PaymentMethodsResponse = PaymentMethod[];

export interface PaymentRequestPayload {
    payment_method_id: number;
    coin_used: number;
    // keyed by PaymentMethodField.id
    fields: Record<string, string>;
}

export interface PaymentRequestResponse {
    [key: string]: unknown;
}

export interface TransactionPaymentMethod {
    id: number;
    name: string;
    icon_url: string | null;
}

export interface PaymentRequestTransaction {
    id: number;
    payment_method: TransactionPaymentMethod;
    payment_amount: number;
    status: number;
    status_label: string | null;
    status_changed_at: string | null;
    created_at: string | null;
}

export interface TransactionsResponse {
    requests: PaymentRequestTransaction[];
    total_earned: number;
    pagination: Pagination;
}

export interface RewardClaimPayload {
    badge_id: number;
}

export interface RewardClaimResponse {
    badge_id: string;
    badge_type: string;
    label: string;
    icon: string | null;
    note: string;
    reward: number;
    new_coin_balance: number;
}

export interface UpdateProfilePayload {
    name: string;
    email: string | null;
    mobile: string | null;
    remove_ads?: boolean;
    // new avatar (preset pick or custom upload), sent as binary when the avatar changed
    profile_image?: File;
    // existing avatar URL, passed through unchanged when the avatar wasn't edited
    profile_url?: string;
}