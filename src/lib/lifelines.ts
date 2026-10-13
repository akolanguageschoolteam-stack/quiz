export type LifelineTier = "full" | "limited" | "none";

/** Route slug -> lifeline tier. Independent of QuizType so slugs sharing a module type (e.g. true-or-false / quiz-zone) can still differ. */
export const SLUG_LIFELINE_TIER_MAP: Record<string, LifelineTier> = {
  "quiz-zone": "full",
  "daily-quiz": "full",
  "audio-quiz": "full",
  "fun-and-learn": "full",
  "math-mania": "full",
  "true-or-false": "limited",
  "multi-match": "limited",
  "guess-the-word": "none",
};

export const getLifelineTier = (slug?: string | null): LifelineTier =>
  SLUG_LIFELINE_TIER_MAP[slug ?? ""] ?? "none";
