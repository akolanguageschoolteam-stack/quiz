'use client'
import { useState } from "react"
import { createPortal } from "react-dom"
import { Hamburg, NewArrow } from "@/components/common/Icons"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import LocalizedLink from "@/components/common/LocalizedLink"
import { NavItem } from "./Header"
import { useTranslation } from "@/hooks/useTranslation"
import { Switch } from "@/components/ui/switch"
import { useDispatch, useSelector } from 'react-redux'
import { isDarkThemeSelector, setDarkTheme, setLightTheme } from '@/redux/reducers/themeSlice'
import { setQuizReviewAnswers, setReviewQuizQuestions } from '@/redux/reducers/quizSlice'
import { getDirection } from "@/lib/helper"

interface MobileNavProps {
  navItems: NavItem[]
}

const MobileNav = ({ navItems }: MobileNavProps) => {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const dispatch = useDispatch()
  const isDark = useSelector(isDarkThemeSelector)

  return (
    <>
      {open && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 bg-black/40"
          style={{ zIndex: 45 }}
          onClick={() => setOpen(false)}
        />,
        document.body
      )}
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger className="focus:outline-none!">
          <Hamburg />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          sideOffset={16}
          style={{ zIndex: 55 }}
          className="w-60 px-2 pt-2 pb-3 rounded-2xl shadow-[0px_8px_32px_0px_rgba(0,0,0,0.08)] border-0! ring-0! overflow-x-visible! overflow-y-visible! surfaceContainerLowestBg flex flex-col gap-2"
        >
          {/* Up arrow caret — points toward hamburger trigger */}
          <div className="absolute -top-[8px] right-[16px] w-[18px] h-[18px] rotate-45 surfaceContainerLowestBg border-t border-l border-(--neutral-200) dark:border-(--neutral-700)" />

          {navItems.map((item) => (
            <LocalizedLink
              key={item.href}
              href={item.href}
              onClick={() => {
                setOpen(false)
                // Leaving a quiz review via this nav link skips PlayScreen's own close-button
                // cleanup — clear the stashed review snapshot here too.
                if (item.href.includes('play-area')) {
                  dispatch(setQuizReviewAnswers(null))
                  dispatch(setReviewQuizQuestions(null))
                }
              }}
            >
              <div className="px-4 py-3 rounded-2xl flex rtl:flex-row-reverse rtl:text-right justify-between items-center gap-2.5 hover:surfaceContainerLowBg transition-colors">
                <span className="flex-1 text-xl font-medium font-nunito leading-7">{item.label}</span>
                <NewArrow width={12} height={12} />
              </div>
            </LocalizedLink>
          ))}

          <div className="px-4 py-3 rounded-2xl flex justify-between items-center gap-2.5">
            <span className="flex-1 text-xl font-medium font-nunito leading-7">{t('darkMode')}</span>
            <Switch
              checked={isDark}
              dir={getDirection()}
              onCheckedChange={(checked) => dispatch(checked ? setDarkTheme() : setLightTheme())}
            />
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}

export default MobileNav
