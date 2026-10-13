import { BadgesListResponse, BattleRoomApiData, BattleRoomQuestionsPayload, BattleRoomQuestionsResponse, BattleResultResponse, BookmarkCheckPayload, BookmarkCheckResponse, BookmarkListResponse, BookmarkPayload, BookmarkToggleResponse, CategoriesResponse, CheckExistsPayload, CheckExistsResponse, CoinHistoryResponse, CoinScorePayload, CoinScoreResponse, ContentTypesResponse, ContestLeaderboardResponse, ContestQuestionsResponse, ContestSubmitPayload, ContestsResponse, ConvertGuestPayload, ConvertGuestResponse, CreateBattleRoomPayload, DeleteBattleRoomPayload, ExamAnswerKeyResponse, ExamModuleQuestionsPayload, ExamModuleQuestionsResponse, ExamsResponse, ExamSubmitPayload, ExamSubmitResponse, FunLearnContentResponse, FunLearnQuestionsResponse, FunLearnSubmitPayload, FunLearnSubmitResponse, GuessWordSubmitPayload, JoinBattleRoomPayload, HomeSettingsResponse, JoinContestResponse, LanguagesResponse, NotificationListResponse, PageContentResponse, PaymentMethodsResponse, PaymentRequestPayload, PaymentRequestResponse, QuizQuestionsResponse, ReportQuestionPayload, ResponseData, RewardClaimPayload, RewardClaimResponse, SignupResponse, SubmitBattleResultPayload, UpdateProfilePayload, StatisticsResponse, SubCategoriesResponse, SubmitAnswerPayload, SubmitAnswerResponse, TransactionsResponse, TranslationsResponse, UserProfileResponse, WebSettingsResponse, WebSlidersResponse } from "@/types/GlobalTypes";

import { badgesList, battleRoomQuestionsEndpoint, bookmarksCheckEndPoint, bookmarksEndPoint, bookmarksList, categoriesEndPoint, checkExistsEndPoint, coinHistory, coinScoreEndPoint, contentTypesEndPoint, convertGuestEndPoint, createBattleRoomEndpoint, deleteAccountEndPoint, deleteBattleRoomEndpoint, contestQuestionsEndPoint, contestSubmitEndPoint, contestsEndPoint, examAnswerKeyEndPoint, examModules, funAndLearnEndPoint, funAndLearnQuestionsEndPoint, funAndLearnSubmitEndPoint, joinBattleRoomEndpoint, joinContestEndPoint, langEndPoint, languagesEndPoint, leaderboard, logoutEndPoint, notificationsList, pagesEndPoint, paymentMethods, paymentRequestsEndPoint, profile, questions, questionsEndPoint, reportQuestionEndPoint, rewardClaim, settingsWebEndPoint, signupEndPoint, statistics, subCategoriesEndPoint, submitBattleResultEndpoint, submitEndpoint, unlockCategoryEndPoint, updateProfile, user, webHomeSettingsEndPoint, webSlidersEndPoint } from "./apiEndpoints";
import axiosClient, { getContentTypeId } from "./apiMiddleware";

export const fetchCategories = async (module_type: number): Promise<ResponseData<CategoriesResponse>> => {
    const contentTypeId = getContentTypeId();
    const contentTypeQuery = contentTypeId != null ? `&content_type_id=${contentTypeId}` : '';
    const response = await axiosClient.get<ResponseData<CategoriesResponse>>(`${categoriesEndPoint}?module_type=${module_type}${contentTypeQuery}`);
    return response.data;
}

export const fetchSubCategories = async (categoryId: number): Promise<ResponseData<SubCategoriesResponse>> => {
    const response = await axiosClient.get<ResponseData<SubCategoriesResponse>>(`${categoriesEndPoint}/${categoryId}/${subCategoriesEndPoint}`);
    return response.data;
}

export const unlockCategory = async (categoryId: number): Promise<ResponseData<null>> => {
    const response = await axiosClient.post<ResponseData<null>>(`${categoriesEndPoint}/${categoryId}/${unlockCategoryEndPoint}`);
    return response.data;
}

export const createBattleRoom = async (payload: CreateBattleRoomPayload): Promise<ResponseData<BattleRoomApiData>> => {
    const response = await axiosClient.post<ResponseData<BattleRoomApiData>>(createBattleRoomEndpoint, payload, {
        headers: { "Content-Type": "application/json" },
    });
    return response.data;
}

export const joinBattleRoom = async (payload: JoinBattleRoomPayload): Promise<ResponseData<BattleRoomApiData>> => {
    const response = await axiosClient.post<ResponseData<BattleRoomApiData>>(joinBattleRoomEndpoint, payload, {
        headers: { "Content-Type": "application/json" },
    });
    return response.data;
}

export const fetchBattleRoomQuestions = async (payload: BattleRoomQuestionsPayload): Promise<ResponseData<BattleRoomQuestionsResponse>> => {
    const response = await axiosClient.post<ResponseData<BattleRoomQuestionsResponse>>(battleRoomQuestionsEndpoint, payload, {
        headers: { "Content-Type": "application/json" },
    });
    return response.data;
}

export const submitBattleResult = async (payload: SubmitBattleResultPayload): Promise<ResponseData<BattleResultResponse>> => {
    const response = await axiosClient.post<ResponseData<BattleResultResponse>>(submitBattleResultEndpoint, payload, {
        headers: { "Content-Type": "application/json" },
    });
    return response.data;
}

export const deleteBattleRoom = async (payload: DeleteBattleRoomPayload): Promise<ResponseData<null>> => {
    const response = await axiosClient.post<ResponseData<null>>(deleteBattleRoomEndpoint, payload, {
        headers: { "Content-Type": "application/json" },
    });
    return response.data;
}

export const fetchFunLearnContent = async (categoryId: number, funLearnId: number): Promise<FunLearnContentResponse> => {
    const response = await axiosClient.get<FunLearnContentResponse>(`${funAndLearnEndPoint}?category_id=${categoryId}&fun_n_learn_id=${funLearnId}`);
    return response.data;
}

export const fetchFunLearnQuestions = async (funLearnId: number): Promise<FunLearnQuestionsResponse> => {
    const response = await axiosClient.post<FunLearnQuestionsResponse>(funAndLearnQuestionsEndPoint, { fun_n_learn_id: funLearnId }, {
        headers: { "Content-Type": "application/json" },
    });
    return response.data;
}

export const submitFunLearnAnswer = async (payload: FunLearnSubmitPayload): Promise<FunLearnSubmitResponse> => {
    const response = await axiosClient.post<FunLearnSubmitResponse>(funAndLearnSubmitEndPoint, payload, {
        headers: { "Content-Type": "application/json" },
    });
    return response.data;
}

export const fetchQuizQuestions = async (moduleEndpoint: string, payload: Record<string, unknown>): Promise<ResponseData<QuizQuestionsResponse>> => {
    const response = await axiosClient.post<ResponseData<QuizQuestionsResponse>>(`${moduleEndpoint}/${questionsEndPoint}`, payload, {
        headers: { "Content-Type": "application/json" },
    });
    return response.data;
}

export const submitQuizAnswer = async (moduleEndpoint: string, payload: SubmitAnswerPayload): Promise<ResponseData<SubmitAnswerResponse>> => {
    const response = await axiosClient.post<ResponseData<SubmitAnswerResponse>>(`${moduleEndpoint}/${submitEndpoint}`, payload, {
        headers: { "Content-Type": "application/json" },
    });
    return response.data;
}

export const submitGuessWordAnswer = async (moduleEndpoint: string, payload: GuessWordSubmitPayload): Promise<ResponseData<SubmitAnswerResponse>> => {
    const response = await axiosClient.post<ResponseData<SubmitAnswerResponse>>(`${moduleEndpoint}/${submitEndpoint}`, payload, {
        headers: { "Content-Type": "application/json" },
    });
    return response.data;
}

export const checkUserExists = async (payload: CheckExistsPayload): Promise<ResponseData<CheckExistsResponse>> => {
    const response = await axiosClient.post<ResponseData<CheckExistsResponse>>(checkExistsEndPoint, payload, {
        headers: { "Content-Type": "application/json" },
    });
    return response.data;
}

export const signup = async (payload: FormData): Promise<ResponseData<SignupResponse>> => {
    const response = await axiosClient.post<ResponseData<SignupResponse>>(signupEndPoint, payload);
    return response.data;
}


export const convertGuest = async (payload: ConvertGuestPayload): Promise<ResponseData<ConvertGuestResponse>> => {
    const response = await axiosClient.post<ResponseData<ConvertGuestResponse>>(convertGuestEndPoint, payload, {
        headers: { "Content-Type": "application/json" },
    });
    return response.data;
}

export const fetchUserProfile = async (): Promise<ResponseData<UserProfileResponse>> => {
    const response = await axiosClient.get<ResponseData<UserProfileResponse>>(`${user}/${profile}`);
    return response.data;
}

export const logout = async (): Promise<ResponseData<null>> => {
    const response = await axiosClient.post<ResponseData<null>>(logoutEndPoint);
    return response.data;
}

export const deleteAccount = async (confirmation: string): Promise<ResponseData<null>> => {
    const response = await axiosClient.delete<ResponseData<null>>(deleteAccountEndPoint, {
        params: { confirmation },
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000,
    });
    return response.data;
}

export const fetchWebSettings = async (): Promise<ResponseData<WebSettingsResponse>> => {
    const response = await axiosClient.get<ResponseData<WebSettingsResponse>>(settingsWebEndPoint);
    return response.data;
}

export const fetchHomeSettings = async (): Promise<ResponseData<HomeSettingsResponse>> => {
    const response = await axiosClient.get<ResponseData<HomeSettingsResponse>>(webHomeSettingsEndPoint);
    return response.data;
}

export const fetchWebSliders = async (): Promise<ResponseData<WebSlidersResponse>> => {
    const response = await axiosClient.get<ResponseData<WebSlidersResponse>>(webSlidersEndPoint);
    return response.data;
}

export const fetchLanguages = async (): Promise<ResponseData<LanguagesResponse>> => {
    const response = await axiosClient.get<ResponseData<LanguagesResponse>>(languagesEndPoint);
    return response.data;
}

export const fetchContentTypes = async (): Promise<ResponseData<ContentTypesResponse>> => {
    const response = await axiosClient.get<ResponseData<ContentTypesResponse>>(contentTypesEndPoint);
    return response.data;
}

export const fetchTranslations = async (langCode: string): Promise<ResponseData<TranslationsResponse>> => {
    const response = await axiosClient.get<ResponseData<TranslationsResponse>>(`${langEndPoint}/${langCode}_web.json`);
    return response.data;
}

export const submitCoinScore = async (payload: CoinScorePayload): Promise<CoinScoreResponse> => {
    const response = await axiosClient.post<CoinScoreResponse>(coinScoreEndPoint, payload, {
        headers: { "Content-Type": "application/json" },
    });
    return response.data;
}

export const fetchExams = async (examType: string, offset: number = 0, limit: number = 10): Promise<ResponseData<ExamsResponse>> => {
    const contentTypeId = getContentTypeId();
    const contentTypeQuery = contentTypeId != null ? `&content_type_id=${contentTypeId}` : '';
    const response = await axiosClient.get<ResponseData<ExamsResponse>>(`${examModules}?type=${examType}&offset=${offset}&limit=${limit}${contentTypeQuery}`);
    return response.data;
}

export const fetchExamModuleQuestions = async (payload: ExamModuleQuestionsPayload): Promise<ResponseData<ExamModuleQuestionsResponse>> => {
    const response = await axiosClient.post<ResponseData<ExamModuleQuestionsResponse>>(`${examModules}/${questions}`, payload, {
        headers: { "Content-Type": "application/json" },
    });
    return response.data;
}

export const submitExamAnswers = async (payload: ExamSubmitPayload): Promise<ResponseData<ExamSubmitResponse>> => {
    const response = await axiosClient.post<ResponseData<ExamSubmitResponse>>(`${examModules}/${submitEndpoint}`, payload, {
        headers: { "Content-Type": "application/json" },
    });
    return response.data;
}

export const fetchExamAnswerKey = async (examModuleId: number): Promise<ResponseData<ExamAnswerKeyResponse>> => {
    const response = await axiosClient.get<ResponseData<ExamAnswerKeyResponse>>(`${examModules}/${examAnswerKeyEndPoint}?exam_module_id=${examModuleId}`);
    return response.data;
}


export const fetchContests = async (type: string, offset: number = 0, limit: number = 10, content_type_id: number | null = null): Promise<ResponseData<ContestsResponse>> => {
    const response = await axiosClient.get<ResponseData<ContestsResponse>>(`${contestsEndPoint}?type=${type}&offset=${offset}&limit=${limit}${content_type_id ? `&content_type_id=${content_type_id}` : ''}`);
    return response.data;
}

export const joinContest = async (contestId: number): Promise<ResponseData<JoinContestResponse>> => {
    const response = await axiosClient.post<ResponseData<JoinContestResponse>>(`${contestsEndPoint}/${contestId}/${joinContestEndPoint}`);
    return response.data;
}

export const fetchContestQuestions = async (contestId: number): Promise<ResponseData<ContestQuestionsResponse>> => {
    const response = await axiosClient.post<ResponseData<ContestQuestionsResponse>>(`${contestsEndPoint}/${contestId}/${contestQuestionsEndPoint}`);
    return response.data;
}

export const submitContestAnswer = async (contestId: number, payload: ContestSubmitPayload): Promise<ResponseData<SubmitAnswerResponse>> => {
    const response = await axiosClient.post<ResponseData<SubmitAnswerResponse>>(`${contestsEndPoint}/${contestId}/${contestSubmitEndPoint}`, payload, {
        headers: { "Content-Type": "application/json" },
    });
    return response.data;
}

export const fetchContestLeaderboard = async (contestId: number, offset: number = 0, limit: number = 20): Promise<ResponseData<ContestLeaderboardResponse>> => {
    const response = await axiosClient.get<ResponseData<ContestLeaderboardResponse>>(`${contestsEndPoint}/${contestId}/${leaderboard}?offset=${offset}&limit=${limit}`);
    return response.data;
}

export const submitBookmark = async (payload: BookmarkPayload): Promise<ResponseData<BookmarkToggleResponse>> => {
    const response = await axiosClient.post<ResponseData<BookmarkToggleResponse>>(bookmarksEndPoint, payload, {
        headers: { "Content-Type": "application/json" },
    });
    return response.data;
}

export const checkBookmarks = async (payload: BookmarkCheckPayload): Promise<ResponseData<BookmarkCheckResponse>> => {
    const response = await axiosClient.post<ResponseData<BookmarkCheckResponse>>(bookmarksCheckEndPoint, payload, {
        headers: { "Content-Type": "application/json" },
    });
    return response.data;
}

export const fetchBookmarksList = async (quizType: number, offset: number = 0, limit: number = 20): Promise<ResponseData<BookmarkListResponse>> => {
    const response = await axiosClient.get<ResponseData<BookmarkListResponse>>(`${bookmarksList}?quiz_type=${quizType}&offset=${offset}&limit=${limit}`);
    return response.data;
}

export const submitReportQuestion = async (payload: ReportQuestionPayload): Promise<ResponseData<null>> => {
    const response = await axiosClient.post<ResponseData<null>>(reportQuestionEndPoint, payload, {
        headers: { "Content-Type": "application/json" },
    });
    return response.data;
}

// profile apis
export const fetchStatistics = async (): Promise<ResponseData<StatisticsResponse>> => {
    const response = await axiosClient.get<ResponseData<StatisticsResponse>>(statistics);
    return response.data;
}

export const fetchCoinHistory = async (offset: number = 0, limit: number = 10): Promise<ResponseData<CoinHistoryResponse>> => {
    const response = await axiosClient.get<ResponseData<CoinHistoryResponse>>(`${coinHistory}?offset=${offset}&limit=${limit}`);
    return response.data;
}

export const fetchNotificationList = async (offset: number = 0, limit: number = 10): Promise<ResponseData<NotificationListResponse>> => {
    const response = await axiosClient.get<ResponseData<NotificationListResponse>>(`${notificationsList}?offset=${offset}&limit=${limit}`);
    return response.data;
}

export const fetchBadgesList = async (): Promise<ResponseData<BadgesListResponse>> => {
    const response = await axiosClient.get<ResponseData<BadgesListResponse>>(badgesList);
    return response.data;
}

export const fetchPaymentMethods = async (): Promise<ResponseData<PaymentMethodsResponse>> => {
    const response = await axiosClient.get<ResponseData<PaymentMethodsResponse>>(paymentMethods);
    return response.data;
}

export const submitPaymentRequests = async (payload: PaymentRequestPayload): Promise<ResponseData<PaymentRequestResponse>> => {
    const response = await axiosClient.post<ResponseData<PaymentRequestResponse>>(paymentRequestsEndPoint, payload, {
        headers: { "Content-Type": "application/json" },
    });
    return response.data;
}

export const fetchTransactions = async (offset: number = 0, limit: number = 10): Promise<ResponseData<TransactionsResponse>> => {
    const response = await axiosClient.get<ResponseData<TransactionsResponse>>(`${paymentRequestsEndPoint}?offset=${offset}&limit=${limit}`);
    return response.data;
}

export const submitRewardClaim = async (payload: RewardClaimPayload): Promise<ResponseData<RewardClaimResponse>> => {
    const response = await axiosClient.post<ResponseData<RewardClaimResponse>>(rewardClaim, payload, {
        headers: { "Content-Type": "application/json" },
    });
    return response.data;
}

export const updateProfileData = async (payload: UpdateProfilePayload): Promise<ResponseData<UserProfileResponse>> => {
    const formPayload = new FormData();
    formPayload.append('name', payload.name);
    formPayload.append('email', payload.email ?? '');
    formPayload.append('mobile', payload.mobile ?? '');
    if (payload.remove_ads !== undefined) formPayload.append('remove_ads', String(payload.remove_ads));
    if (payload.profile_image) {
        formPayload.append('profile_image', payload.profile_image);
    } else if (payload.profile_url) {
        formPayload.append('profile_url', payload.profile_url);
    }

    const response = await axiosClient.post<ResponseData<UserProfileResponse>>(updateProfile, formPayload);
    return response.data;
}


export const fetchLeaderboard = async (type: string = 'global', offset: number = 0, limit: number = 20): Promise<ResponseData<ContestLeaderboardResponse>> => {
    const response = await axiosClient.get<ResponseData<ContestLeaderboardResponse>>(`${leaderboard}?type=${type}&offset=${offset}&limit=${limit}`);
    return response.data;
}

export const fetchPage = async (slug: string): Promise<ResponseData<PageContentResponse>> => {
    const response = await axiosClient.get<ResponseData<PageContentResponse>>(`${pagesEndPoint}/${slug}?slug=${slug}`);
    return response.data;
}