'use client';
import { usePathname } from "next/navigation";

const AD_EXCLUDED_ROUTE = /\/play-area\/[^/]+\/play\/?$/;

export function useIsAdExcludedRoute(): boolean {
  const pathname = usePathname();
  return AD_EXCLUDED_ROUTE.test(pathname);
}
