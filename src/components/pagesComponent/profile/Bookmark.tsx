'use client'
import { useTranslation } from "@/hooks/useTranslation";
import ProfileLayout from "./ProfileLayout"
import { Button } from "@/components/storybook/atoms/Button";
import { Typography } from "@/components/storybook/atoms/Typography";
import { Check, X } from "lucide-react";
import { Hamburg, Trash } from "@/components/common/Icons";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState } from "react";
import { useLocalizedRouter } from "@/hooks/useLocalizedRouter";
import { useDispatch } from "react-redux";
import { motion } from "motion/react";
import { useIsMobile } from "@/hooks/useMobile";
import { itemVariants, listVariants } from "@/lib/motionVariants";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { fetchBookmarksList, submitBookmark } from "@/api/apiRoutes";
import { QuizType } from "@/lib/constants";
import { BookmarkListItem } from "@/types/GlobalTypes";
import EmptyStatus from "@/components/common/EmptyStatus";
import HorizontalCardSkeleton from "@/components/skeltons/HorizontalCardSkeleton";
import { formateDate } from "@/lib/helper";
import { setBookmarksPlaySession } from "@/redux/reducers/quizSlice";

const LIMIT = 10;

const stripHtml = (html: string) =>
    html.replace(/<[^>]*>/g, '').replace(/&nbsp;/gi, ' ').trim();

const CATEGORY_FILTERS = [
    { key: 'funLearn', labelKey: 'funLearn', quizType: QuizType.FunLearn },
    { key: 'quizZone', labelKey: 'quizZone', quizType: QuizType.QuizZone },
    { key: 'guessTheWord', labelKey: 'guessTheWord', quizType: QuizType.GuessWord },
    { key: 'multiMatch', labelKey: 'multiMatch', quizType: QuizType.MultiMatch },
    { key: 'mathMania', labelKey: 'mathMania', quizType: QuizType.Math },
    { key: 'audio', labelKey: 'audio', quizType: QuizType.Audio }
]

const Bookmark = () => {

    const { t } = useTranslation();
    const isMobile = useIsMobile();
    const queryClient = useQueryClient();
    const router = useLocalizedRouter();
    const dispatch = useDispatch();

    const [menuOpen, setMenuOpen] = useState(false);
    const [activeFilter, setActiveFilter] = useState<string>('quizZone');
    const [removingKey, setRemovingKey] = useState<string | null>(null);
    const [playLoading, setPlayLoading] = useState(false);

    const selectFilter = (key: string) => {
        setActiveFilter(key);
        setMenuOpen(false);
    }

    const activeQuizType = CATEGORY_FILTERS.find((filter) => filter.key === activeFilter)?.quizType ?? QuizType.FunLearn;

    const {
        data,
        isLoading,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
    } = useInfiniteQuery({
        queryKey: ['bookmarks', activeQuizType],
        queryFn: async ({ pageParam }) => (await fetchBookmarksList(activeQuizType, pageParam, LIMIT)).data,
        initialPageParam: 0,
        getNextPageParam: (lastPage) => {
            const nextOffset = lastPage.pagination.offset + lastPage.pagination.limit;
            return nextOffset < lastPage.pagination.total ? nextOffset : undefined;
        },
    });

    const bookmarks: BookmarkListItem[] = data?.pages.flatMap((page) => page.bookmarks) ?? [];

    const getFilterLabel = (quizType: number) => CATEGORY_FILTERS.find((filter) => filter.quizType === quizType)?.labelKey;

    const handleRemoveBookmark = async (bookmark: BookmarkListItem) => {
        const key = `${bookmark.quiz_type}-${bookmark.question_id}`;
        if (removingKey) return;

        try {
            setRemovingKey(key);
            const isFunLearn = bookmark.quiz_type === QuizType.FunLearn;
            await submitBookmark({
                quiz_type: bookmark.quiz_type,
                question_id: bookmark.question_id,
                status: false,
                ...(isFunLearn ? {} : {
                    was_correct_at_bookmark: !!bookmark.was_correct_at_bookmark,
                    attempted_answer: bookmark.attempted_answer ?? { answer_mode: 'text' },
                }),
            });
            await queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
        } catch (error) {
            console.error("Failed to remove bookmark:", error);
        } finally {
            setRemovingKey(null);
        }
    }

    const handleOpenFunLearnBookmark = (bookmark: BookmarkListItem) => {
        if (bookmark.quiz_type !== QuizType.FunLearn) return;
        router.push(`/play-area/fun-and-learn/play?cate=${bookmark.question.category_id}&fun_n_learn_id=${bookmark.question_id}`);
    }

    const handlePlayBookmarks = async () => {
        if (playLoading || activeFilter === 'funLearn') return;

        try {
            setPlayLoading(true);
            const first = await fetchBookmarksList(activeQuizType, 0, LIMIT);
            const total = first.data?.pagination?.total ?? 0;
            let allBookmarks = first.data?.bookmarks ?? [];
            let offset = allBookmarks.length;

            while (offset < total && allBookmarks.length < total) {
                const page = await fetchBookmarksList(activeQuizType, offset, LIMIT);
                const items = page.data?.bookmarks ?? [];
                if (!items.length) break;
                allBookmarks = allBookmarks.concat(items);
                offset += items.length;
            }

            if (!allBookmarks.length) return;

            dispatch(setBookmarksPlaySession({ quizType: activeQuizType, questions: allBookmarks }));
            router.push(`/play-area/bookmarks/play`);
        } catch (error) {
            console.error("Failed to load bookmarks for play:", error);
        } finally {
            setPlayLoading(false);
        }
    }

    return (
        <ProfileLayout title={t('bookmark')} desc={t('bookmarkDesc')}
            headerActions={
                <div className="max-md:justify-between! max-md:w-full flexCenter flex-wrap gap-3">
                    <div className="surfaceContainerLowestBg rounded-full py-3 px-6 shadow-[0px_8px_32px_0px_#0000000A] max-w-52 sm:max-w-none">
                        <Typography variant="h6" weight="medium" className="font-nunito! truncate">
                            {t(CATEGORY_FILTERS.find((filter) => filter.key === activeFilter)?.labelKey ?? '')}
                        </Typography>
                    </div>
                    <Popover open={menuOpen} onOpenChange={setMenuOpen}>
                        <PopoverTrigger asChild>
                            <button type="button" aria-label="Filter categories">
                                <Hamburg width={isMobile ? 36 : 48} height={isMobile ? 36 : 48} />
                            </button>
                        </PopoverTrigger>
                        <PopoverContent
                            side="bottom"
                            align="end"
                            sideOffset={12}
                            className="bg-white text-black w-56 rounded-3xl shadow-[0px_8px_32px_0px_rgba(0,0,0,0.15)] p-4 flexCol gap-1"
                        >
                            {CATEGORY_FILTERS.map((filter) => (
                                <button
                                    key={filter.key}
                                    type="button"
                                    onClick={() => selectFilter(filter.key)}
                                    className="w-full flex items-center justify-between gap-6 py-2"
                                >
                                    <Typography variant="h6" weight="medium" className="font-nunito!">
                                        {t(filter.labelKey)}
                                    </Typography>
                                    <span className={`w-6 h-6 rounded-full border-2 flexCenter shrink-0 ${activeFilter === filter.key ? 'primaryBorder' : 'border-(--neutral-200)'}`}>
                                        {activeFilter === filter.key && <span className="w-3 h-3 rounded-full primaryBg" />}
                                    </span>
                                </button>
                            ))}
                        </PopoverContent>
                    </Popover>
                    <Button
                        type="button"
                        variant="primary"
                        disabled={activeFilter === 'funLearn' || !bookmarks.length || playLoading}
                        onClick={handlePlayBookmarks}
                    >
                        {playLoading ? t('loading') : t('playBookmarks')}
                    </Button>
                </div>
            }
        >
            <div className="flexCol gap-20">
                {
                    isLoading ?
                        <div className="flexCol gap-4">
                            {Array.from({ length: 5 }).map((_, idx) => (
                                <HorizontalCardSkeleton key={idx} />
                            ))}
                        </div>
                        : (bookmarks.length && bookmarks?.length > 0) ?
                            <motion.div className="flexCol gap-4" variants={listVariants} initial="hidden" animate="show">
                                {bookmarks.map((bookmark) => {
                                    const isFunLearn = bookmark.quiz_type === QuizType.FunLearn;
                                    const key = `${bookmark.quiz_type}-${bookmark.question_id}`;

                                    return (
                                        <motion.div
                                            key={key}
                                            variants={itemVariants}
                                            onClick={isFunLearn ? () => handleOpenFunLearnBookmark(bookmark) : undefined}
                                            className={`surfaceContainerLowestBg rounded-2xl p-4 sm:p-5 shadow-[0px_8px_32px_0px_#0000000A] flex items-center justify-between gap-3 sm:gap-4 ${isFunLearn ? 'cursor-pointer' : ''}`}
                                        >
                                            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                                                {
                                                    !isFunLearn && bookmark.was_correct_at_bookmark !== null &&
                                                    <div className={`w-10 h-10 sm:w-15 sm:h-15 rounded-full flexCenter shrink-0 ${bookmark.was_correct_at_bookmark ? 'successBg' : 'errorBg'}`}>
                                                        {bookmark.was_correct_at_bookmark ? <Check className="w-5 h-5 text-white" /> : <X className="w-5 h-5 text-white" />}
                                                    </div>
                                                }
                                                <div className="flexCol gap-2">
                                                    <Typography variant="h5" weight="bold" className="line-clamp-2">
                                                        {isFunLearn ? bookmark.question?.title : bookmark.question?.question}
                                                    </Typography>
                                                    {isFunLearn ? (
                                                        bookmark.question?.detail && (
                                                            <Typography variant="caption" weight="semibold" className="onSurfaceVarColor! font-nunito! line-clamp-2">
                                                                {stripHtml(bookmark.question.detail)}
                                                            </Typography>
                                                        )
                                                    ) : (
                                                        <Typography variant="caption" weight="semibold" className="onSurfaceVarColor! font-nunito!">
                                                            {t(getFilterLabel(bookmark.quiz_type) ?? '')}
                                                            {bookmark.bookmarked_at ? ` • ${formateDate(bookmark.bookmarked_at)}` : ''}
                                                        </Typography>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                aria-label="Remove bookmark"
                                                disabled={removingKey === key}
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    handleRemoveBookmark(bookmark);
                                                }}
                                                className="w-9 h-9 sm:w-12 sm:h-12 rounded-full commonBg flexCenter shrink-0 disabled:opacity-50"
                                            >
                                                <Trash className="dark:fill-white"/>
                                            </button>
                                        </motion.div>
                                    )
                                })}
                            </motion.div>
                            :
                            <EmptyStatus />
                }

                {
                    hasNextPage && (
                        <div className="flexCenter">
                            <Button
                                variant="secondary"
                                onClick={() => fetchNextPage()}
                                disabled={isFetchingNextPage}
                            >
                                {isFetchingNextPage ? t('loading') : t('loadMore')}
                            </Button>
                        </div>
                    )
                }
            </div>
        </ProfileLayout>
    )
}

export default Bookmark
