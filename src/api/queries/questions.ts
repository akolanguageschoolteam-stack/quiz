import { queryOptions } from "@tanstack/react-query";
import { fetchQuizQuestions } from "@/api/apiRoutes";

export const quizQuestionsQueryOptions = (moduleEndpoint: string, payload: Record<string, unknown>) =>
  queryOptions({
    queryKey: ["quiz-questions", moduleEndpoint, payload],
    queryFn: () => fetchQuizQuestions(moduleEndpoint, payload),
    staleTime: 0,
    // fetchQuizQuestions already toasts its own error — a retry would just replay it.
    retry: false,
  });
