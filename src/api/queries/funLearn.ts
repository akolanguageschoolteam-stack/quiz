import { queryOptions } from "@tanstack/react-query";
import { fetchFunLearnContent, fetchFunLearnQuestions } from "@/api/apiRoutes";

export const funLearnContentQueryOptions = (categoryId: number, funLearnId: number) =>
  queryOptions({
    queryKey: ["fun-learn-content", categoryId, funLearnId],
    queryFn: () => fetchFunLearnContent(categoryId, funLearnId),
    enabled: !!categoryId && !!funLearnId,
    // fetchFunLearnContent already toasts its own error — a retry would just replay it.
    retry: false,
  });

export const funLearnQuestionsQueryOptions = (funLearnId: number) =>
  queryOptions({
    queryKey: ["fun-learn-questions", funLearnId],
    queryFn: () => fetchFunLearnQuestions(funLearnId),
    enabled: !!funLearnId,
    // fetchFunLearnQuestions already toasts its own error — a retry would just replay it.
    retry: false,
  });
