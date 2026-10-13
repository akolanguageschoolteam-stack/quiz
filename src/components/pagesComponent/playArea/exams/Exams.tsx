'use client'
import Layout from "@/components/layout/Layout"
import { Button } from "@/components/storybook/atoms/Button"
import { Breadcrumb } from "@/components/storybook/molecules/Breadcrumb"
import SectionInfo from "@/components/storybook/molecules/SectionInfo"
import { ExamCard } from "@/components/storybook/molecules/examCard"
import { useTranslation } from "@/hooks/useTranslation"
import { useEffect, useState } from "react"
import { useLocalizedRouter } from "@/hooks/useLocalizedRouter"
import { useQueryClient } from "@tanstack/react-query"
import { AnimatePresence, motion } from "motion/react"
import RegisterExamModal from "./RegisterExamModal"
import MyAttemptsModal from "@/components/modals/MyAttemptsModal"
import { fetchExams } from "@/api/apiRoutes"
import { examAnswerKeyQueryOptions } from "@/api/queries/exams"
import type { ExamItem, Pagination } from "@/types/GlobalTypes"
import AuthModal from "@/components/auth/AuthModal"
import LoginRequiredModal from "@/components/auth/LoginRequiredModal"
import { useAuthGate } from "@/hooks/useAuthGate"
import { useSelector } from "react-redux"
import { tokenSelector } from "@/redux/reducers/userSlice"
import { toast } from "@/lib/toast"
import { getErrorMessage } from "@/utils/errorMessages"
import EmptyStatus from "@/components/common/EmptyStatus"
import ExamCardSkeleton from "@/components/skeltons/ExamCardSkeleton"

type ExamsTab = 'upcoming' | 'today' | 'completed'

const isPastDate = (dateStr: string) => {
    const d = new Date(dateStr)
    const now = new Date()
    return d.getFullYear() !== now.getFullYear() || d.getMonth() !== now.getMonth() || d.getDate() !== now.getDate()
}

const stepTransition = {
    initial: { opacity: 0, x: 24 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -24 },
    transition: { duration: 0.25, ease: 'easeInOut' as const },
}

const Exams = () => {

    const { t } = useTranslation();
    const router = useLocalizedRouter();
    const queryClient = useQueryClient();

    const LIMIT = 10;

    const token = useSelector(tokenSelector);
    const isLoggedIn = !!token;

    const [activeTab, setActiveTab] = useState<ExamsTab>('today');
    const [registerModal, setRegisterModal] = useState(false);
    const [selectedExam, setSelectedExam] = useState<ExamItem | null>(null);
    const [attemptsModal, setAttemptsModal] = useState(false)
    const { authModalOpen, setAuthModalOpen, loginRequiredOpen, setLoginRequiredOpen, openAuthGate, guardPlay } = useAuthGate()
    const [exams, setExams] = useState<ExamItem[]>([])
    const [pagination, setPagination] = useState<Pagination>({ total: 0, offset: 0, limit: LIMIT })
    const [isLoading, setIsLoading] = useState(false)
    const [isLoadingMore, setIsLoadingMore] = useState(false)
    const [navigatingReviewId, setNavigatingReviewId] = useState<number | null>(null)

    useEffect(() => {
        setExams([])
        setPagination({ total: 0, offset: 0, limit: LIMIT })
        handleFetchExams(0)
    }, [activeTab])

    const handleFetchExams = async (offset: number) => {
        try {
            if (offset === 0) setIsLoading(true)
            const response = await fetchExams(activeTab, offset, LIMIT)
            if (response?.success) {
                setExams(prev => offset === 0 ? response.data.exams : [...prev, ...response.data.exams])
                setPagination(response.data.pagination)
            }
        } catch (error) {
            console.log("error", error)
        } finally {
            if (offset === 0) setIsLoading(false)
        }
    }

    const handleLoadMore = async () => {
        const nextOffset = pagination.offset + LIMIT
        setIsLoadingMore(true)
        await handleFetchExams(nextOffset)
        setIsLoadingMore(false)
    }



    const hasMore = exams.length < pagination.total


    return (
        <Layout>
            <Breadcrumb firstElement={t('playArea')} secondElement={t('exams')} />
            <section className={`commonPY surfaceContainerLowestBg`}>
                <div className="container commonTextContentGap">
                    <div className="flex items-center justify-center sm:justify-between flex-wrap gap-4">
                        <div className="max-md:mx-auto">
                            <SectionInfo title={t('exams')} isCenter={false} />
                        </div>
                        <div className="flexCenter md:justify-end">
                            <div className="commonBg rounded-3xl p-2 inline-flex border gap-1">
                                <Button
                                    type="button"
                                    variant={activeTab === 'upcoming' ? 'secondary' : 'outline'}
                                    className={activeTab === 'upcoming' ? 'px-3 sm:px-6! border-none! shadow-none!' : 'px-3 sm:px-6! border-none! bg-transparent!'}
                                    onClick={() => setActiveTab('upcoming')}
                                >
                                    {t('upcoming')}
                                </Button>
                                <Button
                                    type="button"
                                    variant={activeTab === 'today' ? 'secondary' : 'outline'}
                                    className={activeTab === 'today' ? 'px-3 sm:px-6! border-none! shadow-none!' : 'px-3 sm:px-6! border-none! bg-transparent!'}
                                    onClick={() => setActiveTab('today')}
                                >
                                    {t('today')}
                                </Button>
                                <Button
                                    type="button"

                                    variant={activeTab === 'completed' ? 'secondary' : 'outline'}
                                    className={activeTab === 'completed' ? 'px-3 sm:px-6! border-none! shadow-none!' : 'px-3 sm:px-6! border-none! bg-transparent!'}
                                    onClick={() => setActiveTab('completed')}
                                >
                                    {t('completed')}
                                </Button>
                            </div>
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            {...stepTransition}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 "
                        >
                            {isLoading ? (
                                Array.from({ length: LIMIT }).map((_, idx) => <ExamCardSkeleton key={idx} />)
                            ) : exams.length === 0 ? (
                                <EmptyStatus className="col-span-full" />
                            ) : exams.map((exam) => (
                                <ExamCard
                                    key={exam.id}
                                    marks={exam.total_marks}
                                    marksLabel={t('marks')}
                                    title={exam.title}
                                    date={exam.starts_at}
                                    questionsCount={exam.questions_count}
                                    canPlayExam={activeTab === 'today'}
                                    onPlayClick={() => {
                                        if (!guardPlay('exam_module_guest_mode')) return
                                        setSelectedExam(exam)
                                        setRegisterModal(true)
                                    }}
                                    canReviewExam={activeTab === 'completed' && isPastDate(exam.starts_at) && !!exam.my_attempt}
                                    onReviewClick={async () => {
                                        if (!isLoggedIn) {
                                            openAuthGate('exam_module_guest_mode')
                                            return
                                        }
                                        if (navigatingReviewId) return
                                        setNavigatingReviewId(exam.id)
                                        try {
                                            // Fetch the answer key first so a failure keeps the user
                                            // here instead of landing them on a broken review screen.
                                            await queryClient.fetchQuery(examAnswerKeyQueryOptions(exam.id))
                                            router.push(`/play-area/exams/play?id=${exam.id}&review=1`)
                                        } catch (error) {
                                            toast.error(getErrorMessage(error, t('somethingWentWrong')))
                                        } finally {
                                            setNavigatingReviewId(null)
                                        }
                                    }}
                                />
                            ))}
                        </motion.div>
                    </AnimatePresence>
                    {hasMore && (
                        <div className="flexCenter">
                            <Button
                                variant="secondary"
                                onClick={handleLoadMore}
                                disabled={isLoadingMore}
                            >
                                {isLoadingMore ? t('loading') : t('loadMore')}
                            </Button>
                        </div>
                    )}
                </div>
                <RegisterExamModal open={registerModal} onClose={setRegisterModal} exam={selectedExam} />
                <MyAttemptsModal open={attemptsModal} onClose={setAttemptsModal} />
                <AuthModal open={authModalOpen} onClose={setAuthModalOpen} />
                <LoginRequiredModal
                    open={loginRequiredOpen}
                    onClose={setLoginRequiredOpen}
                    onGuestClick={() => setLoginRequiredOpen(false)}
                    onLoginClick={() => { setLoginRequiredOpen(false); setAuthModalOpen(true); }}
                />
            </section>
        </Layout>
    )
}

export default Exams
