'use client'
import { useTranslation } from "@/hooks/useTranslation"
import Layout from "../../../layout/Layout"
import PlayLearn from "../sections/PlayLearn"
import PlayWin from "../sections/PlayWin"
import WaysToFun from "../sections/WaysToFun"
import waysToFunImg from '@/assets/playArea/waysToFun.png'
import { useSelector } from "react-redux"
import { webSettingsSelector } from "@/redux/reducers/settingsSlice"
import { tokenSelector } from "@/redux/reducers/userSlice"

const PlayArea = () => {

  const { t } = useTranslation();
  const webSettings = useSelector(webSettingsSelector);
  const token = useSelector(tokenSelector);
  const isLoggedIn = !!token;
  const isExamModuleVisible = webSettings?.exam_module_visible_mode === '1';
  const isSelfChallengeVisible = webSettings?.self_challenge_visible_mode === '1';
  const isDailyQuizVisible = !!(webSettings?.daily_quiz_mode === '1' && webSettings?.is_daily_quiz_scheduled_today);
  const isQuizZoneVisible = webSettings?.quiz_zone_visible_mode === '1';
  const isContestModeVisible = webSettings?.contest_visible_mode === '1';

  const isOneVsOneBattleVisible = webSettings?.one_vs_one_visible_mode === '1';
  const isGroupBattleVisible = webSettings?.group_battle_visible_mode === '1';
  const isRandomBattleVisible = webSettings?.random_battle_visible_mode === '1';

  const isFunLearnVisible = webSettings?.fun_n_learn_visible_mode === '1';
  const isTrueFalseVisible = webSettings?.true_false_quiz_visible_mode === '1';
  const isGuessWordVisible = webSettings?.guess_the_word_visible_mode === '1';
  const isAudioQuizVisible = webSettings?.audio_quiz_visible_mode === '1';
  const isMultiMatchVisible = webSettings?.multi_match_quiz_visible_mode === '1';
  const isMathManiaVisible = webSettings?.math_quiz_visible_mode === '1';


  const isExamAndSelfChallengeMode = isExamModuleVisible && isSelfChallengeVisible;
  const isExamOrSelfChallengeMode = isExamModuleVisible || isSelfChallengeVisible;


  const dailyQuizContestQuiz = [
    {
      img: webSettings?.daily_zone_icon ?? waysToFunImg,
      title: "Daily Quiz",
      desc: "Quick warmup for your little brain before getting started",
      btnLabel: t('playNow'),
      href: 'daily-quiz',
      isVisible: isDailyQuizVisible
    },
    {
      img: webSettings?.contest_play_icon ?? waysToFunImg,
      title: "Quiz Contests",
      desc: isContestModeVisible ? "Quick warmup for your little brain before getting started" : "",
      btnLabel: t('exploreContests'),
      href: 'contest-play',
      isVisible: isContestModeVisible
    },
  ];

  const quizs = [
    ...(isExamModuleVisible ? [{
      img: webSettings?.exam_module_icon,
      title: t('examZone'),
      desc: t('examZoneDesc'),
      bg: "blueContainerBg",
      href: 'exams',
      isVisible: true
    }] : []),
    ...(isSelfChallengeVisible ? [{
      img: webSettings?.self_challenge_icon,
      title: t('selfChallenge'),
      desc: t('selfChallengeDesc'),
      bg: "purpleContainerBg",
      href: 'self-challenge',
      isVisible: true
    }] : []),
  ];

  const visiblePlayLearnQuiz = dailyQuizContestQuiz.filter((quiz) => quiz.isVisible !== false);
  const hasPlayLearnContent = isLoggedIn || isExamOrSelfChallengeMode || visiblePlayLearnQuiz.length > 0 || isQuizZoneVisible;
  const showPlayWinSection = isOneVsOneBattleVisible || isGroupBattleVisible || isRandomBattleVisible;
  const showWaysToFunSection = isFunLearnVisible || isTrueFalseVisible || isGuessWordVisible || isAudioQuizVisible || isMultiMatchVisible || isMathManiaVisible;

  return (
    <Layout>
      <PlayLearn quizs={quizs} dailyQuizContestQuiz={dailyQuizContestQuiz} isExamAndSelfChallengeMode={isExamAndSelfChallengeMode} isExamOrSelfChallengeMode={isExamOrSelfChallengeMode} />
      {showPlayWinSection && <PlayWin isFirstSection={!hasPlayLearnContent} />}
      {showWaysToFunSection && <WaysToFun dailyQuizContestQuiz={dailyQuizContestQuiz} isExamOrSelfChallengeMode={isExamOrSelfChallengeMode} />}
    </Layout>
  )
}

export default PlayArea