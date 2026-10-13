'use client'

const PageLoader = () => {
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-(--neutral-50) dark:bg-(--neutral-950)">
            <span className="shadow-rolling-loader" />
        </div>
    )
}

export default PageLoader
