import { queryOptions } from "@tanstack/react-query";
import { fetchHomeSettings } from "@/api/apiRoutes";

export const homeSettingsQueryOptions = () =>
  queryOptions({
    queryKey: ["homeSettings"],
    queryFn: async () => (await fetchHomeSettings()).data,
    staleTime: 5 * 60 * 1000, // 5 min — content can be edited in admin panel any time
  });
