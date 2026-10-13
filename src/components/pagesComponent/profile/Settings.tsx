'use client'
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "@/hooks/useTranslation";
import ProfileLayout from "./ProfileLayout";
import { Typography } from "@/components/storybook/atoms/Typography";
import { NewArrow } from "@/components/common/Icons";
import { Switch } from "@/components/ui/switch";
import LanguageModal from "@/components/modals/LanguageModal";
import LogoutDeleAccConfirmationModal from "@/components/modals/LogoutDeleAccConfirmationModal";
import { webSettingsSelector } from "@/redux/reducers/settingsSlice";
import { setSoundEffectsEnabled, soundEffectsEnabledSelector } from "@/redux/reducers/preferencesSlice";
import { getDirection } from "@/lib/helper";

const Settings = () => {

    const { t } = useTranslation();
    const dispatch = useDispatch();
    const webSettings = useSelector(webSettingsSelector);
    const contentTypeModeOn = webSettings?.content_type_mode === '1';

    const soundEffects = useSelector(soundEffectsEnabledSelector);
    const [languageModal, setLanguageModal] = useState(false);
    const [quizLangModal, setQuizLangModal] = useState(false);
    const [logoutModal, setLogoutModal] = useState(false);
    const [deleteAccModal, setDeleteAccModal] = useState(false);

    const PREFERENCE_ROWS = [
        ...(contentTypeModeOn ? [{ key: 'quizLanguage', label: t('quizLanguage'), type: 'link' as const, onClick: () => setQuizLangModal(true) }] : []),
        { key: 'displayLanguage', label: t('displayLanguage'), type: 'link' as const, onClick: () => setLanguageModal(true) },
        { key: 'soundEffects', label: t('soundEffects'), type: 'toggle' as const },
    ]

    const ACCOUNT_ROWS = [
        { key: 'logout', label: t('logout'), type: 'link' as const, onClick: () => setLogoutModal(true) },
        { key: 'deleteAccount', label: t('deleteAccount'), type: 'link' as const, onClick: () => setDeleteAccModal(true) },
    ]

    return (
        <ProfileLayout title={t('settings')} desc={t('settingsDesc')}>
            <div className="flexCol gap-6">
                <div className="surfaceContainerLowestBg rounded-2xl overflow-hidden">
                    {PREFERENCE_ROWS.map((row) => (
                        row.type === 'toggle' ? (
                            <div
                                key={row.key}
                                className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b last:border-b-0"
                            >
                                <Typography variant="h6" weight="medium" className="font-nunito!">
                                    {row.label}
                                </Typography>
                                <Switch checked={soundEffects} dir={getDirection()} onCheckedChange={(checked) => dispatch(setSoundEffectsEnabled(checked))} />
                            </div>
                        ) : (
                            <button
                                key={row.key}
                                type="button"
                                onClick={row.onClick}
                                className="w-full flex items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b last:border-b-0"
                            >
                                <Typography variant="h6" weight="medium" className="font-nunito!">
                                    {row.label}
                                </Typography>
                                <NewArrow width={7} height={12} />
                            </button>
                        )
                    ))}
                </div>

                <div className="surfaceContainerLowestBg rounded-2xl overflow-hidden">
                    {ACCOUNT_ROWS.map((row) => (
                        <button
                            key={row.key}
                            type="button"
                            onClick={row.onClick}
                            className="w-full flex items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b last:border-b-0"
                        >
                            <Typography variant="h6" weight="medium" className="font-nunito!">
                                {row.label}
                            </Typography>
                            <NewArrow width={7} height={12} />
                        </button>
                    ))}
                </div>
            </div>
            <LanguageModal open={languageModal} onClose={setLanguageModal} />
            <LanguageModal open={quizLangModal} onClose={setQuizLangModal} quizModal={true} />
            <LogoutDeleAccConfirmationModal open={logoutModal} onClose={setLogoutModal} />
            <LogoutDeleAccConfirmationModal open={deleteAccModal} onClose={setDeleteAccModal} deleteAcc={true} />

        </ProfileLayout>
    )
}

export default Settings
