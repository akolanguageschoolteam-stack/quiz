'use client'

import { useSelector } from "react-redux"
import { webSettingsSelector } from "@/redux/reducers/settingsSlice"
import { useTranslation } from "@/hooks/useTranslation"
import { Typography } from "@/components/storybook/atoms/Typography"

export type BattleRulesMode = 'one_vs_one' | 'group_battle' | 'random_battle'

interface BattleRulesProps {
    mode: BattleRulesMode
    className?: string
}

const toPositiveNumber = (value: string | undefined): number | null => {
    const parsed = Number(value)
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

const BattleRules = ({ mode, className = '' }: BattleRulesProps) => {
    const { t } = useTranslation()
    const webSettings = useSelector(webSettingsSelector)

    const totalQuestions = toPositiveNumber(webSettings?.[`${mode}_total_question_limit`])
    const duration = toPositiveNumber(webSettings?.[`${mode}_duration`])
    const correctAnswerCredit = toPositiveNumber(webSettings?.[`${mode}_correct_answer_credit`])
    const wrongAnswerDeduct = toPositiveNumber(webSettings?.[`${mode}_wrong_answer_deduct`])
    const entryCoin = toPositiveNumber(webSettings?.[`${mode}_entry_coin`])
    const bonusQuickest = toPositiveNumber(webSettings?.[`${mode}_extra_score_quickest`])
    const bonusQuickestSeconds = toPositiveNumber(webSettings?.[`${mode}_extra_score_quickest_in_seconds`])
    const bonusSecondQuickest = toPositiveNumber(webSettings?.[`${mode}_extra_score_second_quickest`])
    const bonusSecondQuickestSeconds = toPositiveNumber(webSettings?.[`${mode}_extra_score_second_quickest_in_seconds`])
    const opponentSearchDuration = mode === 'random_battle'
        ? toPositiveNumber(webSettings?.random_battle_opponent_search_duration)
        : null

    const rules: string[] = []

    if (totalQuestions) {
        rules.push(t('battleRuleQuestions').replace('{count}', String(totalQuestions)))
    }
    if (duration) {
        rules.push(t('battleRuleDuration').replace('{count}', String(duration)))
    }
    if (correctAnswerCredit) {
        rules.push(t('battleRuleCorrectAnswer').replace('{count}', String(correctAnswerCredit)))
    }
    if (wrongAnswerDeduct) {
        rules.push(t('battleRuleWrongAnswer').replace('{count}', String(wrongAnswerDeduct)))
    }
    if (entryCoin) {
        rules.push(t('battleRuleEntryCoin').replace('{count}', String(entryCoin)))
    }
    if (bonusQuickest && bonusQuickestSeconds) {
        rules.push(
            t('battleRuleBonus')
                .replace('{seconds}', String(bonusQuickestSeconds))
                .replace('{count}', String(bonusQuickest))
        )
    }
    if (bonusSecondQuickest && bonusSecondQuickestSeconds) {
        rules.push(
            t('battleRuleBonus')
                .replace('{seconds}', String(bonusSecondQuickestSeconds))
                .replace('{count}', String(bonusSecondQuickest))
        )
    }
    if (opponentSearchDuration) {
        rules.push(t('battleRuleOpponentSearch').replace('{count}', String(opponentSearchDuration)))
    }

    if (!rules.length) return null

    return (
        <div className={`commonBg rounded-3xl p-4 md:p-6 flexCol gap-3 ${className}`}>
            <Typography variant="h6" weight="extrabold" className="font-nunito!">
                {t('battleRules')}
            </Typography>
            <ul className="list-disc pl-5 flexCol gap-2 marker:onSurfaceVarColor">
                {rules.map((rule, idx) => (
                    <li key={idx}>
                        <Typography as="span" variant="desc2" weight="semibold" className="onSurfaceVarColor! font-nunito!">
                            {rule}
                        </Typography>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default BattleRules
