'use client'
import { Suspense } from "react"
import Layout from "@/components/layout/Layout"
import EmptyStatus from "@/components/common/EmptyStatus"

const NotFound = () => {
    return (
        <Suspense fallback={null}>
            <Layout>
                <section className='surfaceContainerLowestBg commonPY'>
                    <div className="container">
                        <EmptyStatus type="pageNotFound" />
                    </div>
                </section>
            </Layout>
        </Suspense>
    )
}

export default NotFound