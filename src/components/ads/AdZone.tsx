'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AdSlot } from "./AdSlot";
import { isAdsEnabled } from "@/lib/ads-config";
import { useIsAdExcludedRoute } from "@/hooks/useIsAdExcludedRoute";

const MAX_CONCURRENT_ADS = 3;

interface AdDensityContextValue { tryClaim: () => boolean; release: () => void }
const AdDensityContext = createContext<AdDensityContextValue | null>(null);

export function AdZoneProvider({ children }: { children: React.ReactNode }) {
  const countRef = useRef(0);
  const tryClaim = useCallback(() => {
    if (countRef.current >= MAX_CONCURRENT_ADS) return false;
    countRef.current += 1;
    return true;
  }, []);
  const release = useCallback(() => { countRef.current = Math.max(0, countRef.current - 1); }, []);
  const value = useMemo(() => ({ tryClaim, release }), [tryClaim, release]);
  return <AdDensityContext.Provider value={value}>{children}</AdDensityContext.Provider>;
}

function useAdDensityGuard() {
  const ctx = useContext(AdDensityContext);
  if (!ctx) throw new Error("AdZone must be rendered under AdZoneProvider");
  return ctx;
}

interface AdZoneProps { className?: string; style?: React.CSSProperties; minWidth?: number; minHeight?: number }

export function AdZone({ className, style, minWidth = 200, minHeight = 200 }: AdZoneProps) {
  const isExcludedRoute = useIsAdExcludedRoute();
  const { tryClaim, release } = useAdDensityGuard();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const claimedRef = useRef(false);
  const [eligible, setEligible] = useState(false);

  const adsActive = isAdsEnabled();

  useEffect(() => {
    if (isExcludedRoute || !adsActive || !wrapperRef.current) return;
    const el = wrapperRef.current;
    const evaluate = (width: number, height: number) => {
      const bigEnough = width >= minWidth && height >= minHeight;
      if (bigEnough && !claimedRef.current) {
        if (tryClaim()) { claimedRef.current = true; setEligible(true); }
      } else if (!bigEnough && claimedRef.current) {
        claimedRef.current = false; release(); setEligible(false);
      }
    };
    evaluate(el.offsetWidth, el.offsetHeight);
    const observer = new ResizeObserver(([entry]) => evaluate(entry.contentRect.width, entry.contentRect.height));
    observer.observe(el);
    return () => {
      observer.disconnect();
      if (claimedRef.current) { claimedRef.current = false; release(); }
    };
  }, [isExcludedRoute, adsActive, minWidth, minHeight, tryClaim, release]);

  if (isExcludedRoute || !adsActive) return null;

  return (
    <div ref={wrapperRef} className={className} style={style} data-ad-zone>
      {eligible && (
        <AdSlot className="w-full h-full" onUnfilled={() => { claimedRef.current = false; release(); setEligible(false); }} />
      )}
    </div>
  );
}

interface ColumnBreakpoint { minWidthPx: number; columns: number }

export function useAdGridColumns(breakpoints: ColumnBreakpoint[]): number {
  const sorted = useMemo(() => [...breakpoints].sort((a, b) => a.minWidthPx - b.minWidthPx), [breakpoints]);
  const [columns, setColumns] = useState(sorted[0]?.columns ?? 1);
  useEffect(() => {
    const mqls = sorted.map((bp) => window.matchMedia(`(min-width: ${bp.minWidthPx}px)`));
    const recompute = () => {
      let current = sorted[0]?.columns ?? 1;
      sorted.forEach((bp, i) => { if (mqls[i].matches) current = bp.columns; });
      setColumns(current);
    };
    recompute();
    mqls.forEach((mql) => mql.addEventListener("change", recompute));
    return () => mqls.forEach((mql) => mql.removeEventListener("change", recompute));
  }, [sorted]);
  return columns;
}
