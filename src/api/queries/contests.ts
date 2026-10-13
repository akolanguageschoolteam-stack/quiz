import { queryOptions } from "@tanstack/react-query";
import { fetchContests, fetchContestQuestions, fetchContestLeaderboard } from "@/api/apiRoutes";

export const contestsQueryOptions = (type: string, offset: number = 0, limit: number = 10) =>
  queryOptions({
    queryKey: ["contests", type, offset, limit],
    queryFn: () => fetchContests(type, offset, limit),
  });

export const contestQuestionsQueryOptions = (contestId: number) =>
  queryOptions({
    queryKey: ["contest-questions", contestId],
    queryFn: () => fetchContestQuestions(contestId),
    // fetchContestQuestions already toasts its own error — a retry would just replay it.
    retry: false,
  });

export const contestLeaderboardQueryOptions = (contestId: number, offset: number = 0, limit: number = 20) =>
  queryOptions({
    queryKey: ["contest-leaderboard", contestId, offset, limit],
    queryFn: () => fetchContestLeaderboard(contestId, offset, limit),
  });
