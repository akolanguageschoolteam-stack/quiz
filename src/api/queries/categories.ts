import { queryOptions } from "@tanstack/react-query";
import { fetchCategories, fetchSubCategories } from "@/api/apiRoutes";
import { getContentTypeId } from "@/api/apiMiddleware";

export const categoriesQueryOptions = (module_type: number) =>
  queryOptions({
    queryKey: ["categories", module_type, getContentTypeId()],
    queryFn: () => fetchCategories(module_type),
  });

export const subCategoriesQueryOptions = (categoryId: number) =>
  queryOptions({
    queryKey: ["subcategories", categoryId],
    queryFn: () => fetchSubCategories(categoryId),
    staleTime: 0,
  });
