import CryptoJS from "crypto-js";

interface EncryptedPayload {
  ciphertext: string;
  iv: string;
}

export const decryptAnswer = (
  encrypted_json_string: EncryptedPayload,
  key: string
): string | undefined => {
  const obj_json: EncryptedPayload = encrypted_json_string;
  const encrypted: string = obj_json.ciphertext;
  const iv: CryptoJS.lib.WordArray = CryptoJS.enc.Hex.parse(obj_json.iv);

  const paddedKey: string = key + "0000";
  const parsedKey: CryptoJS.lib.WordArray = CryptoJS.enc.Utf8.parse(paddedKey);

  try {
    const decrypted: string = CryptoJS.AES.decrypt(encrypted, parsedKey, {
      iv: iv,
    }).toString(CryptoJS.enc.Utf8);

    return decrypted;
  } catch (error) {
    console.log(error);
    return undefined;
  }
};



export const formateDate = (iso: string) => {
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2, '0');
  const month = d.toLocaleString('en-US', { month: 'long' });
  const year = d.getFullYear();
  return `${day} - ${month} ${year}`;
}

export const formatRelativeTime = (iso: string) => {
  const diffSec = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);

  if (diffSec < 60) return 'Just Now';

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} ${diffMin === 1 ? 'Minute' : 'Minutes'} Ago`;

  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} ${diffHour === 1 ? 'Hour' : 'Hours'} Ago`;

  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay} ${diffDay === 1 ? 'Day' : 'Days'} Ago`;

  return formateDate(iso);
}

export const getDirection = (): "ltr" | "rtl" => {
  if (typeof document !== "undefined") {
    return (document.documentElement.dir as "ltr" | "rtl") || "ltr";
  }
  return "ltr";
};


export const formatCoins = (coins: number | string): string => {
  const value = Number(coins);

  if (!Number.isFinite(value)) return "0";

  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000).toFixed(1)}m`;
  }

  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}m`;
  }

  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}k`;
  }

  return value.toString();
};