// NEXT_PUBLIC_ vars are build-time-inlined — flipping NEXT_PUBLIC_ADS_ENABLED
// on an already-built deployment requires a rebuild unless the host injects env at runtime.
export const ADS_CLIENT = process.env.NEXT_PUBLIC_DATA_AD_CLIENT ?? "";
export const ADS_SLOT = process.env.NEXT_PUBLIC_DATA_AD_SLOT ?? "";

function isKillSwitchOff(): boolean {
  const v = process.env.NEXT_PUBLIC_ADS_ENABLED;
  return v === "0" || v === "false";
}

export function isAdsEnabled(): boolean {
  return Boolean(ADS_CLIENT && ADS_SLOT) && !isKillSwitchOff();
}

export const ADSENSE_SCRIPT_SRC = ADS_CLIENT
  ? `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADS_CLIENT}`
  : "";
