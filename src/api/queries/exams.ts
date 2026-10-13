import { queryOptions } from "@tanstack/react-query";
import { fetchExamAnswerKey, fetchExamModuleQuestions } from "@/api/apiRoutes";
import type { ExamModuleQuestionsPayload } from "@/types/GlobalTypes";

export const examModuleQuestionsQueryOptions = (payload: ExamModuleQuestionsPayload) =>
  queryOptions({
    queryKey: ["exam-module-questions", payload],
    queryFn: () => fetchExamModuleQuestions(payload),
    // fetchExamModuleQuestions already toasts its own error — a retry would just replay it.
    retry: false,
  });

export const examAnswerKeyQueryOptions = (examModuleId: number) =>
  queryOptions({
    queryKey: ["exam-answer-key", examModuleId],
    queryFn: () => fetchExamAnswerKey(examModuleId),
  });
