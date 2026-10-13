'use client';
import { useEffect, useRef, useState } from "react";
import { ADS_CLIENT, ADS_SLOT, isAdsEnabled } from "@/lib/ads-config";

declare global { interface Window { adsbygoogle?: unknown[] } }

interface AdSlotProps {
  className?: string;
  style?: React.CSSProperties;
  onUnfilled?: () => void;
}

export function AdSlot({ className, style, onUnfilled }: AdSlotProps) {
  const insRef = useRef<HTMLModElement>(null);
  const pushedRef = useRef(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (!isAdsEnabled() || pushedRef.current) return;
    pushedRef.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {}
    const timer = window.setTimeout(() => {
      const status = insRef.current?.getAttribute("data-ad-status");
      if (status === "unfilled" || !insRef.current) {
        setHidden(true);
        onUnfilled?.();
      }
    }, 2000);
    return () => window.clearTimeout(timer);
  }, [onUnfilled]);

  if (!isAdsEnabled() || hidden) return null;

  return (
    <ins
      ref={insRef}
      className={`adsbygoogle block ${className ?? ""}`}
      style={{ display: "block", ...style }}
      data-ad-client={ADS_CLIENT}
      data-ad-slot={ADS_SLOT}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}
