'use client'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { DarkThemIcon, LightThemIcon } from './Icons'
import { isDarkThemeSelector, setDarkTheme, setLightTheme } from '@/redux/reducers/themeSlice'

const ThemeToggler = () => {

    const dispatch = useDispatch();
    const isDark = useSelector(isDarkThemeSelector);

    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        setIsClient(true)
    }, [])

    useEffect(() => {
        const root = document.documentElement
        root.classList.add('theme-transition-off')

        if (isDark) {
            root.classList.add('dark')
        } else {
            root.classList.remove('dark')
        }

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                root.classList.remove('theme-transition-off')
            })
        })
    }, [isDark])

    return (
        isClient &&
        <div className="flex items-center gap-4 commonBg rounded-3xl p-2 border">
            <button
                aria-label="Light mode"
                onClick={() => dispatch(setLightTheme())}
                className={`w-8.5 sm:w-11 h-8.5 sm:h-11 flexCenter rounded-2xl ${isDark ? '' : 'bg-white'}`}
            >
                <LightThemIcon className={isDark ? 'invert' : ''} />
            </button>
            <button
                aria-label="Dark mode"
                onClick={() => dispatch(setDarkTheme())}
                className={`w-8.5 sm:w-11 h-8.5 sm:h-11 flexCenter rounded-2xl ${isDark ? 'bg-white' : ''}`}
            >
                <DarkThemIcon />
            </button>
        </div>
    )
}

export default ThemeToggler
