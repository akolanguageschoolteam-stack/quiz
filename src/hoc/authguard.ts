'use client'
import { ComponentType, createElement, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { tokenSelector } from '@/redux/reducers/userSlice'

export function withAuthGuard<P extends object>(Component: ComponentType<P>) {
    const Guarded = (props: P) => {
        const router = useRouter()
        const token = useSelector(tokenSelector)

        useEffect(() => {
            if (!token) {
                router.replace('/')
            }
        }, [token, router])

        if (!token) return null

        return createElement(Component, props)
    }

    Guarded.displayName = `withAuthGuard(${Component.displayName || Component.name || 'Component'})`
    return Guarded
}
