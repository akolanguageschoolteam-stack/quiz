'use client'
import { useState } from "react";
import { useLocalizedRouter } from "@/hooks/useLocalizedRouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { useTranslation } from "@/hooks/useTranslation";
import Layout from "@/components/layout/Layout"
import { Breadcrumb } from "@/components/storybook/molecules/Breadcrumb"
import { useIsDark } from "@/hooks/useIsDark";
import SectionInfo from "@/components/storybook/molecules/SectionInfo";
import CategoryCard from "@/components/storybook/molecules/categoryCard/CategoryCard";
import UnlockModal from "../UnlockModal";
import SubComprehensiveModal from "../SubComprehensiveModal";
import ComprehensiveModal from "./../ComprehensiveModal";
import { FunLearnComprehension, CategoryType } from "@/types/GlobalTypes";
import { categoriesQueryOptions } from "@/api/queries/categories";
import { funLearnQuestionsQueryOptions } from "@/api/queries/funLearn";
import { mapCategoryInterfaceToCategoryType } from "@/lib/categoryMapper";
import { QuizType } from "@/lib/constants";
import { selectedTitleSelector } from "@/redux/reducers/quizSlice";
import VerticalCardSkeleton from "@/components/skeltons/VerticalCardSkeleton";
import EmptyStatus from "@/components/common/EmptyStatus";
import { toast } from "@/lib/toast";
import { getErrorMessage } from "@/utils/errorMessages";

const hasSubCategories = (cate: CategoryType) => (cate.subcategories_count ?? 0) > 0;
const isLocked = (cate: CategoryType) => hasSubCategories(cate) && !!cate.coins && !cate.has_unlocked;
const isFreeSub = (cate: CategoryType) => hasSubCategories(cate) && (!cate.coins || !!cate.has_unlocked);
const isComprehensive = (cate: CategoryType) => !hasSubCategories(cate);

const FunLearn = () => {

    const { t } = useTranslation();
    const router = useLocalizedRouter();
    const queryClient = useQueryClient();
    const isDark = useIsDark();

    const selectedTitle = useSelector(selectedTitleSelector);

    const [activeCategory, setActiveCategory] = useState<CategoryType | null>(null);
    const [navigatingFunLearnId, setNavigatingFunLearnId] = useState<number | null>(null);

    const moduleType = QuizType.FunLearn;
    const { data, isLoading } = useQuery(categoriesQueryOptions(moduleType));
    const categories: CategoryType[] = (data?.data?.categories ?? []).map(mapCategoryInterfaceToCategoryType);

    const handleSetCategory = (category: CategoryType) => {
        setActiveCategory(category)
    }

    const goToPlay = async (categoryId: number | undefined, funLearnId: number) => {
        if (navigatingFunLearnId) return;
        setNavigatingFunLearnId(funLearnId);
        try {
            await queryClient.fetchQuery(funLearnQuestionsQueryOptions(funLearnId));
            router.push(`/play-area/fun-and-learn/play?cate=${categoryId}&fun_n_learn_id=${funLearnId}`);
        } catch (error) {
            toast.error(getErrorMessage(error, t('somethingWentWrong')));
        } finally {
            setNavigatingFunLearnId(null);
        }
    }

    return (
        <Layout>
            <Breadcrumb firstElement={t('playArea')} secondElement={selectedTitle || t('funLearn')} />
            <section className={`${isDark ? 'onPrimaryBg' : 'bg-linear-to-b from-(--neutral-100) to-(--neutral-50)'} commonPY`}>
                <div className="container commonTextContentGap">
                    <div>
                        <SectionInfo title={selectedTitle || t('funLearn')} />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                        {isLoading
                            ? Array.from({ length: 6 }).map((_, idx) => (
                                <VerticalCardSkeleton key={idx} />
                            ))
                            : categories.length === 0
                                ? <EmptyStatus className="col-span-full" />
                                : categories?.map((cate, idx) => {
                                    return <CategoryCard key={idx} category={cate} onClick={() => handleSetCategory(cate)} guestModeKey="fun_n_learn_guest_mode" />
                                })
                        }
                    </div>
                </div>
            </section>

            <ComprehensiveModal
                category={activeCategory}
                open={!!activeCategory && isComprehensive(activeCategory!)}
                onOpenChange={(o) => !o && setActiveCategory(null)}
                onSelectComprehensive={(comprehension: FunLearnComprehension) => goToPlay(activeCategory?.id, comprehension.id)}
            />

            <UnlockModal
                message={`Use ${activeCategory?.coins ?? 0} ${t('coins')}?`}
                open={!!activeCategory && isLocked(activeCategory!)}
                onOpenChange={(o) => !o && setActiveCategory(null)}
                onConfirm={() => router.push(`/play-area/fun-and-learn/play?cate=${activeCategory?.id}&level=1`)}
            />

            <SubComprehensiveModal
                category={activeCategory}
                open={!!activeCategory && isFreeSub(activeCategory!)}
                onOpenChange={(o) => !o && setActiveCategory(null)}
                onSelectComprehensive={(subCategory, comprehension) => goToPlay(subCategory.id, comprehension.id)}
            />
        </Layout>
    )
}

export default FunLearn
