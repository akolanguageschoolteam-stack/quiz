import { queryOptions } from "@tanstack/react-query";
import { fetchPage } from "@/api/apiRoutes";

export const pageQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: ["page", slug],
    queryFn: () => fetchPage(slug),
  });
