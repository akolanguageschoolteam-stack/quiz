import cateIcon from "@/assets/cateIcon.png";
import { CategoryInterface, CategoryType, SubCategoryType } from "@/types/GlobalTypes";

export const mapCategoryInterfaceToCategoryType = (category: CategoryInterface): CategoryType => ({
    id: category.id,
    img: category.image || cateIcon,
    title: category.name,
    desc: category.subcategories_count > 0
        ? `${category.subcategories_count} Sub Categories`
        : `${category.questions_count ?? category.comprehension_counts} Questions`,
    coins: category.is_premium ? category.coins_required : undefined,
    levels: category.levels ?? undefined,
    level_count: category.level_count,
    subcategories_count: category.subcategories_count,
    has_level: category.has_level,
    has_unlocked: category.has_unlocked,
    comprehensions: category.comprehensions ?? undefined,
});

export const mapCategoryInterfaceToSubCategoryType = (category: CategoryInterface): SubCategoryType => ({
    id: category.id,
    img: category.image || cateIcon,
    title: category.name,
    levels: category.level_count,
    levelDetails: category.levels ?? undefined,
    questions: category.questions_count,
    has_level: category.has_level,
});
