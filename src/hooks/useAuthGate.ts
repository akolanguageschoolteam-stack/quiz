'use client'
import { useState } from 'react'
import { useSelector } from 'react-redux'
import { webSettingsSelector } from '@/redux/reducers/settingsSlice'
import { tokenSelector } from '@/redux/reducers/userSlice'

export const useAuthGate = () => {
    const webSettings = useSelector(webSettingsSelector)
    const isLoggedIn = !!useSelector(tokenSelector)
    const [authModalOpen, setAuthModalOpen] = useState(false)
    const [loginRequiredOpen, setLoginRequiredOpen] = useState(false)

    const openAuthGate = (guestModeKey: string) => {
        const isGuestModeEnabled = webSettings?.guest_mode === '1' && webSettings?.[guestModeKey] === '1'
        if (isGuestModeEnabled) {
            setLoginRequiredOpen(true)
        } else {
            setAuthModalOpen(true)
        }
    }

    // Guard for the actual "start playing" action. Guest-mode play-limit enforcement
    // (guest_mode_play_limit) is handled by the backend on the play/join request itself.
    const guardPlay = (guestModeKey: string) => {
        if (!isLoggedIn) {
            openAuthGate(guestModeKey)
            return false
        }
        return true
    }

    return { authModalOpen, setAuthModalOpen, loginRequiredOpen, setLoginRequiredOpen, openAuthGate, guardPlay }
}
