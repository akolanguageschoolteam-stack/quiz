export enum QuizType {
  QuizZone = 1,
  FunLearn = 2,
  GuessWord = 3,
  Audio = 4,
  Math = 5,
  MultiMatch = 6
}

export enum AnswerType {
  Single = 0,
  Rearrange = 1,
  MultiSelect = 2
}

export enum MediaType {
  YoutubeId = 1,
  Pdf = 2
}


export const SLUG_MODULE_TYPE_MAP: Record<string, QuizType> = {
  "quiz-zone": QuizType.QuizZone,
  "true-or-false": QuizType.QuizZone,
  "guess-the-word": QuizType.GuessWord,
  "audio-quiz": QuizType.Audio,
  "multi-match": QuizType.MultiMatch,
  "math-mania": QuizType.Math
}

export const getSlugFromModuleType = (moduleType: QuizType): string =>
  Object.keys(SLUG_MODULE_TYPE_MAP).find((slug) => SLUG_MODULE_TYPE_MAP[slug] === moduleType) ?? "true-or-false";

export const getModuleTypeName = (moduleType: QuizType): string => QuizType[moduleType];

export const SLUG_QUESTIONS_ENDPOINT_MAP: Record<string, string> = {
  "true-or-false": "true-false-quiz",
  "math-mania": "math",
  "self-challenge": "self-challenge",
  "audio-quiz": "audio",
}

// every value ever used for the /play-area/[slug] route segment (base, /play, /result)
export const PLAY_AREA_SLUGS: string[] = Array.from(
  new Set([
    ...Object.keys(SLUG_MODULE_TYPE_MAP),
    ...Object.keys(SLUG_QUESTIONS_ENDPOINT_MAP),
    "fun-and-learn",
    "bookmarks",
    "daily-quiz",
  ])
)

// web-settings guest-mode key per /play-area/[slug] route segment — each quiz type has its
// own independent guest_mode_play toggle, not a single shared one.
export const SLUG_GUEST_MODE_KEY_MAP: Record<string, string> = {
  "quiz-zone": "quiz_zone_guest_mode",
  "true-or-false": "true_false_quiz_guest_mode",
  "guess-the-word": "guess_the_word_guest_mode",
  "audio-quiz": "audio_quiz_guest_mode",
  "multi-match": "multi_match_quiz_guest_mode",
  "math-mania": "math_quiz_guest_mode",
  "self-challenge": "self_challenge_guest_mode",
  "daily-quiz": "daily_quiz_guest_mode",
}
