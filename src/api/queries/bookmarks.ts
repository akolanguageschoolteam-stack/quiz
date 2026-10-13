import { queryOptions } from "@tanstack/react-query";
import { fetchBookmarksList } from "@/api/apiRoutes";

export const bookmarksListQueryOptions = (quizType: number, offset: number = 0, limit: number = 20) =>
  queryOptions({
    queryKey: ["bookmarks", quizType, offset, limit],
    queryFn: () => fetchBookmarksList(quizType, offset, limit),
  });
