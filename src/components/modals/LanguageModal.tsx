'use client'
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Typography } from "../storybook/atoms/Typography";
import { Button } from "../storybook/atoms/Button";
import { useTranslation } from "@/hooks/useTranslation";
import { contentTypesSelector, languagesSelector, quizLanguageSlugSelector, setQuizLanguage, setSystemLanguage, systemLanguageCodeSelector } from "@/redux/reducers/languageSlice";

interface LanguageModalProps {
    open: boolean,
    quizModal?: boolean,
    onClose: (open: boolean) => void
}

const LanguageModal = ({ open, onClose, quizModal = false }: LanguageModalProps) => {

    const { t } = useTranslation();
    const dispatch = useDispatch();

    const languages = useSelector(languagesSelector)
    const contentTypes = useSelector(contentTypesSelector)
    const systemLanguageCode = useSelector(systemLanguageCodeSelector)
    const quizLanguageSlug = useSelector(quizLanguageSlugSelector)
    const activeLanguageCode = quizModal ? quizLanguageSlug : systemLanguageCode

    const items = quizModal
        ? contentTypes.map((contentType) => ({ value: contentType.slug, label: contentType.name }))
        : languages.map((language) => ({ value: language.code, label: language.name }))

    const [selectedLanguage, setSelectedLanguage] = useState(activeLanguageCode)

    useEffect(() => {
        if (open) {
            setSelectedLanguage(activeLanguageCode)
        }
    }, [open, activeLanguageCode]);

    const handleApply = () => {
        dispatch(quizModal ? setQuizLanguage(selectedLanguage) : setSystemLanguage(selectedLanguage))
        onClose(false)
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} className="">
                <div className="surfaceBrightBg rounded-[42px] p-8 gap-8 max-h-[calc(100vh-2rem)] overflow-y-auto customScrollbar flexCol">
                    <div className="flexColCenter text-center gap-2">
                        <Typography variant="h2" weight="semibold">
                            {t(quizModal ? 'selectQuizLanguage' : 'selectSystemLanguage')}
                        </Typography>
                        <Typography variant="h4" className="font-nunito! onSurfaceVarColor!" weight="medium">
                            {t(quizModal ? 'selectQuizLanguageDesc' : 'selectSystemLanguageDesc')}
                        </Typography>
                    </div>

                    <div className="flexCol gap-3">
                        {items.map((item) => {
                            const isSelected = selectedLanguage === item.value
                            return (
                                <button
                                    key={item.value}
                                    type="button"
                                    role="radio"
                                    aria-checked={isSelected}
                                    onClick={() => setSelectedLanguage(item.value)}
                                    className={`flex items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl transition-colors duration-200 ${isSelected ? 'primaryContainerBg' : 'surfaceContainerLowBg'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="surfaceContainerLowestBg w-10 h-10 sm:w-12 sm:h-12 rounded-xl flexCenter shrink-0">
                                            <Typography variant="h6" className="font-bold" as="span">
                                                {item.label.slice(0, 2).toUpperCase()}
                                            </Typography>
                                        </div>
                                        <Typography variant="h6" weight="medium" className="font-nunito!">
                                            {item.label}
                                        </Typography>
                                    </div>

                                    <div className={`w-6 h-6 rounded-full flexCenter shrink-0 border-2 ${isSelected ? 'primaryBorder' : 'border-(--neutral-300)'}`}>
                                        {isSelected && <div className="w-2.5 h-2.5 rounded-full primaryBg" />}
                                    </div>
                                </button>
                            )
                        })}
                    </div>

                    <Button fullWidth onClick={handleApply}>
                        {t('apply')}
                    </Button>

                </div>
            </DialogContent>
        </Dialog>
    )
}

export default LanguageModal
