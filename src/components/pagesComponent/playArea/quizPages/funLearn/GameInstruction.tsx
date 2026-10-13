'use client'
import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Bookmark } from "lucide-react"
import RichTextContent from "@/components/common/RichText"
import Layout from "@/components/layout/Layout"
import { Button } from "@/components/storybook/atoms/Button"
import { Typography } from "@/components/storybook/atoms/Typography"
import ImagePreview from "@/components/storybook/atoms/ImagePreview"
import { useTranslation } from "@/hooks/useTranslation"
import { funLearnContentQueryOptions } from "@/api/queries/funLearn"
import { checkBookmarks, submitBookmark } from "@/api/apiRoutes"
import { MediaType, QuizType } from "@/lib/constants"
import { useIsDark } from "@/hooks/useIsDark"

const isImageUrl = (url: string) => /\.(png|jpe?g|gif|webp|svg)$/i.test(url)
const isVideoUrl = (url: string) => /\.(mp4|webm|ogg|mov)$/i.test(url)
const isAudioUrl = (url: string) => /\.(mp3|wav|m4a|aac)$/i.test(url)

const hasVisibleText = (html?: string | null) =>
    !!html?.replace(/<[^>]*>/g, '').replace(/&nbsp;/gi, ' ').trim()

interface GameInstructionProps {
    onStartQuiz: () => void;
}

const GameInstruction = ({ onStartQuiz }: GameInstructionProps) => {

    const { t } = useTranslation()
    const searchParams = useSearchParams()
    const isDarkMode = useIsDark();

    const categoryId = Number(searchParams.get('cate')) || 0
    const funLearnId = Number(searchParams.get('fun_n_learn_id')) || 0

    const { data, isLoading, isError } = useQuery(funLearnContentQueryOptions(categoryId, funLearnId))
    const queryClient = useQueryClient()

    const content = data?.data
    const hasContent = !!content && (!!content.media_data || hasVisibleText(content.detail))

    const { data: bookmarkCheckData } = useQuery({
        queryKey: ['bookmarkCheck', QuizType.FunLearn, funLearnId],
        queryFn: () => checkBookmarks({ quiz_type: QuizType.FunLearn, question_ids: [funLearnId] }),
        enabled: funLearnId > 0,
        staleTime: 0,
        refetchOnMount: 'always',
    })

    const [bookmarkOverride, setBookmarkOverride] = useState<boolean | null>(null)
    const [isBookmarking, setIsBookmarking] = useState(false)

    const comprehensionKey = `${categoryId}-${funLearnId}`
    const [trackedKey, setTrackedKey] = useState(comprehensionKey)
    if (trackedKey !== comprehensionKey) {
        setTrackedKey(comprehensionKey)
        setBookmarkOverride(null)
    }

    const checkedBookmark = bookmarkCheckData?.data?.bookmarks.find((b) => b.question_id === funLearnId)
    const isBookmarked = bookmarkOverride ?? !!checkedBookmark?.is_bookmarked

    const handleToggleBookmark = async () => {
        if (!content || isBookmarking) return

        const nextStatus = !isBookmarked
        setIsBookmarking(true)

        try {
            const response = await submitBookmark({
                quiz_type: QuizType.FunLearn,
                question_id: content.id,
                status: nextStatus,
            })
            setBookmarkOverride(response.data.is_bookmarked)
            await queryClient.invalidateQueries({ queryKey: ['bookmarks'] })
        } catch (error) {
            console.error("Failed to bookmark comprehension:", error)
        } finally {
            setIsBookmarking(false)
        }
    }

    return (
        <Layout>
            <section className="commonPY bg-linear-to-b from-(--primary-100) to-(--neutral-50)">
                <div className="container commonTextContentGap">
                    <div className="flex items-center justify-between gap-4">
                        <div className="space-y-1 min-w-0">
                            <Typography variant="h3" className="truncate">
                                {content?.title ?? ''}
                            </Typography>
                            <Typography variant="h5" className="onSurfaceVarColor! font-nunito!">
                                {content?.questions_count ?? 0} {t('questions')}
                            </Typography>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                            <button
                                type="button"
                                onClick={handleToggleBookmark}
                                disabled={!content || isBookmarking}
                                aria-label={isBookmarked ? "Remove bookmark" : "Bookmark comprehension"}
                                className="w-10 h-10 md:w-12 md:h-12 rounded-full commonBg flexCenter cursor-pointer disabled:opacity-50 shrink-0"
                            >
                                {isBookmarked ? (
                                    <Bookmark className="w-5 h-5 md:w-6 md:h-6" fill={isDarkMode ? 'white' : "black"} />
                                ) : (
                                    <Bookmark className="w-5 h-5 md:w-6 md:h-6" fill="none" />
                                )}
                            </button>
                            <Button disabled={!content} onClick={onStartQuiz}>
                                {t('startQuiz')}
                            </Button>
                        </div>
                    </div>

                    {isLoading && (
                        <Typography variant="h5" className="text-center onSurfaceVarColor py-10">
                            {t('loading')}
                        </Typography>
                    )}

                    {isError && (
                        <Typography variant="h5" className="text-center onSurfaceVarColor py-10">
                            {t('somethingWentWrong')}
                        </Typography>
                    )}



                    {hasContent && (
                        <div className="surfaceBg p-6 rounded-[32px] flexCol gap-6">
                            {content.media_data && (() => {
                                switch (content.media_type) {
                                    case MediaType.YoutubeId:
                                        return (
                                            <iframe
                                                src={`https://www.youtube.com/embed/${content.media_data}`}
                                                title={content.title}
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                                className="w-full h-64 md:h-100 rounded-2xl"
                                            />
                                        )
                                    case MediaType.Pdf:
                                        return (
                                            <a
                                                href={content.media_data}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-full text-center py-3 rounded-xl border commonBorderB primaryColor font-nunito font-bold"
                                            >
                                                {t('viewPdf')}
                                            </a>
                                        )
                                    default:
                                        if (isImageUrl(content.media_data)) {
                                            return (
                                                <ImagePreview
                                                    src={content.media_data}
                                                    alt={content.title}
                                                    objectFit="contain"
                                                    rounded="2xl"
                                                    containerClassName="w-full h-64 md:h-100"
                                                />
                                            )
                                        }
                                        if (isVideoUrl(content.media_data)) {
                                            return <video src={content.media_data} controls className="w-full rounded-2xl" />
                                        }
                                        if (isAudioUrl(content.media_data)) {
                                            return <audio src={content.media_data} controls className="w-full" />
                                        }
                                        return null
                                }
                            })()}
                            <div className="overflow-auto">
                                <RichTextContent content={content.detail} />
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </Layout>
    )
}

export default GameInstruction
