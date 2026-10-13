'use client'
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Play } from "lucide-react";
import { Typography } from "@/components/storybook/atoms/Typography";
import ImagePreview from "@/components/storybook/atoms/ImagePreview";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { CategoryType } from "@/types/GlobalTypes";
import { LEVEL_PILL_BASE, levelPillClass } from "./levelPillClass";
import { subCategoriesQueryOptions } from "@/api/queries/categories";
import { mapCategoryInterfaceToSubCategoryType } from "@/lib/categoryMapper";
import { useTranslation } from "@/hooks/useTranslation";
import CategoryLevelModalSkeleton from "@/components/skeltons/CategoryLevelModalSkeleton";
import { toast } from "@/lib/toast";
import { getErrorMessage } from "@/utils/errorMessages";

interface SubCategoryModalProps {
    category: CategoryType | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentLevel?: number;
    onSelectLevel: (subCategoryId: number, level: number, levelNo: number) => void;
    onPlaySubCategory: (subCategoryId: number) => void;
    hideLevels?: boolean;
}

const SubCategoryModal = ({ category, open, onOpenChange, currentLevel = 1, onSelectLevel, onPlaySubCategory, hideLevels = false }: SubCategoryModalProps) => {

    const { t } = useTranslation();

    const { data, isLoading, isError, error } = useQuery({
        ...subCategoriesQueryOptions(category?.id ?? 0),
        enabled: open && !!category?.id,
    });

    useEffect(() => {
        if (isError) toast.error(getErrorMessage(error, t('somethingWentWrong')));
    }, [isError, error, t]);

    const subs = (data?.data?.subcategories ?? []).map(mapCategoryInterfaceToSubCategoryType);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} >
                <div className="surfaceContainerLowestBg rounded-2xl shadow-[0px_8px_32px_0px_#0000001A] p-4 sm:p-6 md:p-8 flexCol gap-6 w-162 max-w-[calc(100vw-2rem)] h-150 sm:h-200 max-h-[calc(100vh-2rem)] overflow-y-auto customScrollbar">
                    <div className="shrink-0 surfaceContainerLowestBg rounded-3xl border commonBorderB p-4 flexColCenter gap-2 text-center">

                        <div className="w-16 h-16 md:w-20 md:h-20 aspect-square">
                            <ImagePreview src={category?.img} alt={category?.title ?? 'category'} objectFit="contain" containerClassName="w-full h-full" />
                        </div>
                        <DialogTitle asChild>
                            <Typography variant="h2" className="lg:text-4xl! font-normal! font-candal! leading-10! onSurfaceColor">
                                {category?.title}
                            </Typography>
                        </DialogTitle>
                        <DialogDescription asChild>
                            <Typography variant="h6" className="lg:text-2xl! font-normal! font-nunito! leading-8! onSurfaceVarColor">
                                {isLoading ? t('loading') : `${subs.length} - ${t('subCategories')}`}
                            </Typography>
                        </DialogDescription>
                    </div>
                    {isLoading ? (
                        <CategoryLevelModalSkeleton />
                    ) : (
                        <Accordion
                            type="single"
                            collapsible
                            defaultValue="sub-0"
                            className="flex-1 min-h-0 overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-(--neutral-300)"
                        >
                            {subs.map((sub, idx) => {
                                const levels = Array.from({ length: sub.levels }, (_, i) => {
                                    const display = i + 1;
                                    const match = sub.levelDetails?.find((lvl) => lvl.level === display);
                                    const levelId = match?.id ?? null;
                                    const locked = !match?.is_unlocked;
                                    return { display, levelId, locked };
                                });
                                const subCurrentLevel = sub.levelDetails?.filter((lvl) => lvl.is_unlocked).length || currentLevel;

                                if (!sub.has_level || hideLevels) {
                                    return (
                                        <div key={idx} className="flex items-center gap-4 py-4 border-b border-(--neutral-200) last:border-b-0">
                                            <div className="w-8 h-8 shrink-0 aspect-square">
                                                <ImagePreview src={sub.img} alt={sub.title} objectFit="contain" containerClassName="w-full h-full" />
                                            </div>
                                            <div className="flexCol gap-1 min-w-0 flex-1">
                                                <Typography variant="h4" className="text-lg! md:text-xl! font-bold font-nunito! leading-6 onSurfaceColor truncate">
                                                    {sub.title}
                                                </Typography>
                                                <div className="flex items-center gap-3 onSurfaceVarColor">
                                                    {!hideLevels && sub.levels > 0 &&
                                                        <Typography variant="h6" className="text-sm! md:text-base! font-medium font-nunito! leading-5">
                                                            {sub.levels} {sub.levels == 1 ? t("level") : t("levels")}
                                                        </Typography>
                                                    }
                                                    <Typography variant="h6" className="text-sm! md:text-base! font-medium font-nunito! leading-5">
                                                        {sub.questions} {sub.questions == 1 ? t('question') : t('questions')}
                                                    </Typography>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                aria-label={`Play ${sub.title}`}
                                                onClick={() => onPlaySubCategory(sub.id)}
                                                className="w-10 h-10 shrink-0 rounded-full primaryBg flexCenter cursor-pointer hover:opacity-90"
                                            >
                                                <Play className="w-4  h-4 text-white fill-current ml-0.5" />
                                            </button>
                                        </div>
                                    );
                                }

                                return (
                                    <AccordionItem key={idx} value={`sub-${idx}`}>
                                        <AccordionTrigger>
                                            <div className="flex items-center gap-4 min-w-0 flex-1">
                                                <div className="w-9 h-9 shrink-0 aspect-square">
                                                    <ImagePreview src={sub.img} alt={sub.title} objectFit="contain" containerClassName="w-full h-full" />
                                                </div>
                                                <div className="flexCol gap-1 min-w-0">
                                                    <Typography variant="h4" className="text-lg! md:text-xl! font-bold font-nunito! leading-6 onSurfaceColor">
                                                        {sub.title}
                                                    </Typography>
                                                    <div className="flex items-center gap-3 onSurfaceVarColor">
                                                        {sub.levels > 0 &&
                                                            <Typography variant="h6" className="text-sm! md:text-base! font-medium font-nunito! leading-5">
                                                                {sub.levels} {sub.levels == 1 ? t("level") : t("levels")}
                                                            </Typography>
                                                        }
                                                        <Typography variant="h6" className="text-sm! md:text-base! font-medium font-nunito! leading-5">
                                                            {sub.questions} {sub.questions == 1 ? t('question') : t('questions')}
                                                        </Typography>
                                                    </div>
                                                </div>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                                {levels.map(({ display, levelId, locked }) => {
                                                    return (
                                                        <button
                                                            key={display}
                                                            disabled={locked}
                                                            onClick={() => levelId !== null && onSelectLevel(sub.id, levelId, display)}
                                                            className={`${LEVEL_PILL_BASE} ${levelPillClass(display, subCurrentLevel)} ${locked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:opacity-90'}`}
                                                        >
                                                            {t('level')} {display}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                );
                            })}
                        </Accordion>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default SubCategoryModal;
