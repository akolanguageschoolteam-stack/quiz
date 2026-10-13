import { queryOptions } from "@tanstack/react-query";
import { fetchWebSliders } from "@/api/apiRoutes";

export const webSlidersQueryOptions = () =>
  queryOptions({
    queryKey: ["webSliders"],
    queryFn: async () => (await fetchWebSliders()).data,
    staleTime: 5 * 60 * 1000, // 5 min — sliders can be edited in admin panel any time
  });
