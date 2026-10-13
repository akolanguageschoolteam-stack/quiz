'use client'
import { useState } from "react";
import { useParams } from "next/navigation";
import { useLocalizedRouter } from "@/hooks/useLocalizedRouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "@/hooks/useTranslation";
import Layout from "@/components/layout/Layout"
import { Breadcrumb } from "@/components/storybook/molecules/Breadcrumb"
import { useIsDark } from "@/hooks/useIsDark";
import SectionInfo from "@/components/storybook/molecules/SectionInfo";
import CategoryCard from "@/components/storybook/molecules/categoryCard/CategoryCard";
import LevelModal from "./LevelModal";
import UnlockModal from "./UnlockModal";
import SubCategoryModal from "./SubCategoryModal";
import AuthModal from "@/components/auth/AuthModal";
import LoginRequiredModal from "@/components/auth/LoginRequiredModal";
import { useAuthGate } from "@/hooks/useAuthGate";
import { CategoryType } from "@/types/GlobalTypes";
import { categoriesQueryOptions } from "@/api/queries/categories";
import { quizQuestionsQueryOptions } from "@/api/queries/questions";
import { getContentTypeId } from "@/api/apiMiddleware";
import { mapCategoryInterfaceToCategoryType } from "@/lib/categoryMapper";
import { QuizType, SLUG_MODULE_TYPE_MAP, SLUG_QUESTIONS_ENDPOINT_MAP, SLUG_GUEST_MODE_KEY_MAP } from "@/lib/constants";
import { selectedTitleSelector, setSelectedLevelNo } from "@/redux/reducers/quizSlice";
import DifficultyModal from "../selfChallenge/DifficultyModal";
import MyAttemptsModal from "@/components/modals/MyAttemptsModal";
import { motion } from "motion/react";
import { itemVariants, listVariants } from "@/lib/motionVariants";
import VerticalCardSkeleton from "@/components/skeltons/VerticalCardSkeleton";
import EmptyStatus from "@/components/common/EmptyStatus";
import { AdZone, useAdGridColumns } from "@/components/ads/AdZone";
import { toast } from "@/lib/toast";
import { getErrorMessage } from "@/utils/errorMessages";

const hasSubCategories = (cate: CategoryType) => (cate.subcategories_count ?? 0) > 0;
const isLocked = (cate: CategoryType) => hasSubCategories(cate) && !!cate.coins && !cate.has_unlocked;
const isFreeSub = (cate: CategoryType) => hasSubCategories(cate) && (!cate.coins || !!cate.has_unlocked);

const QuizZone = () => {
    const { t } = useTranslation();
    const router = useLocalizedRouter();
    const dispatch = useDispatch();
    const queryClient = useQueryClient();
    const isDark = useIsDark();
    const params = useParams<{ slug: string }>();

    const selectedTitle = useSelector(selectedTitleSelector);

    const [activeCategory, setActiveCategory] = useState<CategoryType | null>(null);
    const [selfChallengeCategoryId, setSelfChallengeCategoryId] = useState<number | null>(null);
    const [difficultyModal, setDifficultyModal] = useState(false)
    const [attemptsModal, setAttemptsModal] = useState(false)
    const { authModalOpen, setAuthModalOpen, loginRequiredOpen, setLoginRequiredOpen, guardPlay } = useAuthGate();
    const isSelfChallengePage = params.slug === 'self-challenge';
    const pageTitle = isSelfChallengePage ? t('selfChallenge') : (selectedTitle || t('quizZone'));
    const moduleType = SLUG_MODULE_TYPE_MAP[params.slug] ?? QuizType.QuizZone;
    const questionsEndpoint = SLUG_QUESTIONS_ENDPOINT_MAP[params.slug] ?? params.slug;
    const guestModeKey = SLUG_GUEST_MODE_KEY_MAP[params.slug] ?? 'quiz_zone_guest_mode';
    const { data, isLoading } = useQuery(categoriesQueryOptions(moduleType));
    const categories: CategoryType[] = (data?.data?.categories ?? []).map(mapCategoryInterfaceToCategoryType);
    const unlockedLevels = activeCategory?.levels?.filter((lvl) => lvl.is_unlocked == true) ?? [];
    const currentLevel = unlockedLevels.length || 1;
    const adColumns = useAdGridColumns([{ minWidthPx: 0, columns: 2 }, { minWidthPx: 640, columns: 3 }, { minWidthPx: 1024, columns: 4 }]);
    const gridRemainder = categories.length > 0 ? categories.length % adColumns : 0;


    const [navigatingToPlay, setNavigatingToPlay] = useState(false);

    const goToPlay = async (query: string) => {
        if (navigatingToPlay || !guardPlay(guestModeKey)) return;

        const queryParams = new URLSearchParams(query);
        const categoryIdParam = Number(queryParams.get('cate')) || 0;
        const levelParam = queryParams.get('level');
        const contentTypeId = getContentTypeId();
        const questionsPayload = {
            ...(isSelfChallengePage
                ? { category_id: categoryIdParam, limit: Number(queryParams.get('limit')) || 10 }
                : { category_id: categoryIdParam, level_id: levelParam ? Number(levelParam) : null }),
            ...(contentTypeId != null ? { content_type_id: contentTypeId } : {}),
        };

        setNavigatingToPlay(true);
        try {
            // Fetch the questions first so a failure (e.g. guest play limit exceeded)
            // surfaces as a toast and keeps the user on this page instead of landing
            // them on a broken play screen.
            await queryClient.fetchQuery(quizQuestionsQueryOptions(questionsEndpoint, questionsPayload));
        } catch (error) {
            toast.error(getErrorMessage(error, t('somethingWentWrong')));
            setNavigatingToPlay(false);
            return;
        }

        queryClient.invalidateQueries({ queryKey: ["quiz-questions"] });
        router.push(`/play-area/${params.slug}/play?${query}`)
    }

    const handleSelectLevel = (level: number, levelNo: number) => {
        dispatch(setSelectedLevelNo(levelNo));
        goToPlay(`cate=${activeCategory?.id}&level=${level}`)
    }

    const handleSubSelectLevel = (subCategoryId: number, level: number, levelNo: number) => {
        dispatch(setSelectedLevelNo(levelNo));
        goToPlay(`cate=${subCategoryId}&level=${level}`)
    }

    const handlePlaySubCategory = (subCategoryId: number) => {
        goToPlay(`cate=${subCategoryId}`)
    }

    const handleSetCategory = (category: CategoryType) => {
        if (isSelfChallengePage) {
            setActiveCategory(category)
            if (hasSubCategories(category)) return;
            setSelfChallengeCategoryId(category.id)
            setDifficultyModal(true)
            return;
        }
        if (category.has_level || hasSubCategories(category)) {
            setActiveCategory(category)
        } else {
            goToPlay(`cate=${category.id}`)
        }
    }

    const handleSelfChallengeSubCategorySelect = (subCategoryId: number) => {
        setActiveCategory(null)
        setSelfChallengeCategoryId(subCategoryId)
        setDifficultyModal(true)
    }

    const handleStartSelfChallenge = ({ questionCount, quizDuration }: { questionCount: number; quizDuration: number }) => {
        if (!selfChallengeCategoryId) return;
        setDifficultyModal(false)
        const durationInSeconds = quizDuration * 60;
        goToPlay(`cate=${selfChallengeCategoryId}&limit=${questionCount}&duration=${durationInSeconds}`)
    }

    return (
        <Layout>
            <Breadcrumb firstElement={t('playArea')} secondElement={pageTitle} />
            <section className={`${isDark ? 'onPrimaryBg' : 'bg-linear-to-b from-(--neutral-100) to-(--neutral-50)'} commonPY`}>
                <div className="container commonTextContentGap">
                    <div>
                        <SectionInfo title={pageTitle} />
                    </div>
                    <motion.div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6" variants={listVariants} initial="hidden" animate="show">
                        {isLoading
                            ? Array.from({ length: 8 }).map((_, idx) => (
                                <VerticalCardSkeleton key={idx} />
                            ))
                            : categories.length === 0
                                ? <EmptyStatus className="col-span-full" />
                                : categories?.map((cate, idx) => (
                                    <motion.div key={idx} variants={itemVariants}>
                                        <CategoryCard category={cate} onClick={() => handleSetCategory(cate)} guestModeKey={guestModeKey} />
                                    </motion.div>
                                ))}
                        {gridRemainder !== 0 && <AdZone style={{ gridColumn: 'auto / -1' }} minWidth={140} minHeight={140} />}
                    </motion.div>
                </div>
            </section>

            <LevelModal
                category={activeCategory}
                currentLevel={currentLevel}
                open={!isSelfChallengePage && !!activeCategory && activeCategory.has_level && !hasSubCategories(activeCategory)}
                onOpenChange={(o) => !o && setActiveCategory(null)}
                onSelectLevel={handleSelectLevel}
                guestModeKey={guestModeKey}
            />

            <UnlockModal
                message={`Use ${activeCategory?.coins ?? 0} ${t('coins')}?`}
                open={!isSelfChallengePage && !!activeCategory && isLocked(activeCategory!)}
                onOpenChange={(o) => !o && setActiveCategory(null)}
                onConfirm={() => { dispatch(setSelectedLevelNo(1)); goToPlay(`cate=${activeCategory?.id}&level=1`) }}
            />

            <SubCategoryModal
                category={activeCategory}
                open={isSelfChallengePage
                    ? !!activeCategory && hasSubCategories(activeCategory)
                    : !!activeCategory && isFreeSub(activeCategory!)}
                onOpenChange={(o) => !o && setActiveCategory(null)}
                onSelectLevel={isSelfChallengePage ? (subCategoryId) => handleSelfChallengeSubCategorySelect(subCategoryId) : handleSubSelectLevel}
                onPlaySubCategory={isSelfChallengePage ? handleSelfChallengeSubCategorySelect : handlePlaySubCategory}
                hideLevels={isSelfChallengePage}
            />
            <DifficultyModal
                open={isSelfChallengePage && difficultyModal}
                onClose={(o) => { setDifficultyModal(o); if (!o) setSelfChallengeCategoryId(null); }}
                onStart={handleStartSelfChallenge}
            />
            <MyAttemptsModal open={attemptsModal} onClose={setAttemptsModal} />

            <AuthModal open={authModalOpen} onClose={setAuthModalOpen} />
            <LoginRequiredModal
                open={loginRequiredOpen}
                onClose={setLoginRequiredOpen}
                onGuestClick={() => setLoginRequiredOpen(false)}
                onLoginClick={() => { setLoginRequiredOpen(false); setAuthModalOpen(true); }}
            />
        </Layout>
    )
}

export default QuizZone