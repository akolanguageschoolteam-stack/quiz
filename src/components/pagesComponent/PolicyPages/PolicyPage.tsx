'use client'
import { useQuery } from '@tanstack/react-query'
import EmptyStatus from '@/components/common/EmptyStatus'
import PageLoader from '@/components/common/PageLoader'
import RichTextContent from '@/components/common/RichText'
import Layout from '@/components/layout/Layout'
import { Typography } from '@/components/storybook/atoms/Typography'
import { pageQueryOptions } from '@/api/queries/pages'

interface PolicyPageProps {
    apiSlug: string
    title?: string
    desc?: string
}

const PolicyPage = ({ apiSlug, title: titleOverride, desc }: PolicyPageProps) => {
    const { data, isLoading } = useQuery(pageQueryOptions(apiSlug))

    const title = titleOverride ?? data?.data?.title
    const content = data?.data?.page_content ?? ''

    return (
        <Layout>
            {
                isLoading
                    ? <PageLoader />
                    : <section className='surfaceContainerLowestBg commonPY'>
                        <div className="container commonTextContentGap">
                            {
                                title && content &&
                                <div className="flexCol gap-1">
                                    <Typography variant="h1" weight="bold">{title}</Typography>
                                    <Typography variant="subtitle2" weight='medium' className="onSurfaceVarColor! font-nunito!">{desc}</Typography>
                                </div>
                            }
                            {
                                content
                                    ? <div className='commonBg rounded-[32px] max-md:p-4 p-6'>
                                        <RichTextContent content={content} />
                                    </div>
                                    : <EmptyStatus />
                            }
                        </div>
                    </section>
            }
        </Layout>
    )
}

export default PolicyPage