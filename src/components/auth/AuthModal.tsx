'use client'
import { Dialog, DialogContent } from "@/components/ui/dialog";
import ImagePreview from "@/components/storybook/atoms/ImagePreview";
import heroBg from '@/assets/homePage/heroBg.svg'
import logo from '@/assets/Logo.svg'
import LoginModal from "./LoginModal";
import PhoneModal from "./PhoneModal";
import OptModal from "./OtpModal";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { AnimatePresence, motion } from "motion/react";
import RegisterModal from "./RegisterModal";
import ForgotPassModal from "./ForgotPassModal";
import LinkSentModal from "./LinkSentModal";
import { ConfirmationResult, signInWithPhoneNumber, RecaptchaVerifier } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase";
import { webSettingsSelector } from "@/redux/reducers/settingsSlice";

interface AuthModalProps {
    open: boolean,
    onClose: (open: boolean) => void,
    initialView?: 'login' | 'register'
}

const stepTransition = {
    initial: { opacity: 0, x: 24 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -24 },
    transition: { duration: 0.25, ease: 'easeInOut' as const },
}

const AuthModal = ({ open, onClose, initialView = 'login' }: AuthModalProps) => {

    const webSettings = useSelector(webSettingsSelector)
    const authMethods = useMemo(() => ({
        email: webSettings?.email_login_mode === '1',
        phone: webSettings?.phone_login_mode === '1',
        apple: webSettings?.apple_login_mode === '1',
        google: webSettings?.google_login_mode === '1',
    }), [webSettings])

    const [optModal, setOptModal] = useState(false)
    const [loginModal, setLogintModal] = useState(true)
    const [phoneModal, setPhoneModal] = useState(false)
    const [registerModal, setRegisterModal] = useState(false)
    const [forgotPassModal, setForgotPass] = useState(false)
    const [linkSentModal, setLinkSentModal] = useState(true)

    const confirmationResultRef = useRef<ConfirmationResult | null>(null)
    const phoneNumberRef = useRef<string>('')
    const resendHandlerRef = useRef<() => Promise<void>>(async () => { })
    const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null)
    const [linkEmail, setLinkEmail] = useState('')

    const sendOtp = async (fullPhoneNumber: string) => {
        if (!recaptchaVerifierRef.current) {
            recaptchaVerifierRef.current = new RecaptchaVerifier(firebaseAuth, 'recaptcha-container', { size: 'invisible' })
        }
        const result = await signInWithPhoneNumber(firebaseAuth, fullPhoneNumber, recaptchaVerifierRef.current)
        confirmationResultRef.current = result
        phoneNumberRef.current = fullPhoneNumber
    }

    const onResendOtp = async () => {
        await sendOtp(phoneNumberRef.current)
    }

    const openLinkSent = (email: string, onResend: () => Promise<void>) => {
        setLinkEmail(email)
        resendHandlerRef.current = onResend
        setForgotPass(false)
        setLinkSentModal(true)
    }

    useEffect(() => {
        const defaultToRegister = initialView === 'register'
        const defaultToPhone = !defaultToRegister && !authMethods.email && authMethods.phone
        setRegisterModal(defaultToRegister)
        setLogintModal(!defaultToRegister && !defaultToPhone)
        setPhoneModal(defaultToPhone)
        setOptModal(false)
        setForgotPass(false)
        setLinkSentModal(false)
    }, [open, initialView, authMethods.email, authMethods.phone])

    const step = optModal ? 'otp' : phoneModal ? 'phone' : 'login'

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <div id="recaptcha-container" className="hidden" />
            {
                optModal || forgotPassModal || linkSentModal ?
                    <DialogContent className="">
                        <div className="surfaceBrightBg rounded-[42px] p-8 gap-8 max-h-[calc(100vh-2rem)] overflow-y-auto customScrollbar">

                            <div className="overflow-hidden">
                                <AnimatePresence mode="wait">
                                    <motion.div key={step} {...stepTransition}>
                                        {
                                            optModal &&
                                            <OptModal confirmationResultRef={confirmationResultRef} onResendOtp={onResendOtp} onAuthSuccess={() => onClose(false)} mobile={phoneNumberRef.current} />
                                        }
                                        {
                                            forgotPassModal &&
                                            <ForgotPassModal openLinkSent={openLinkSent} />
                                        }
                                        {
                                            linkSentModal &&
                                            <LinkSentModal email={linkEmail} onResend={() => resendHandlerRef.current()} />
                                        }
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                        </div>
                    </DialogContent>
                    :
                    <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} className="max-w-[94%] sm:max-w-[80%] lg:max-w-256.25!">
                        <div className="surfaceBrightBg rounded-[42px] p-6 md:p-8 gap-8 grid grid-cols-1 lg:grid-cols-2 max-h-[calc(100vh-2rem)] overflow-y-auto customScrollbar">

                            <div className="primaryBg rounded-3xl hidden lg:flexCenter! relative">
                                <div
                                    style={{
                                        backgroundImage: `url(${heroBg.src})`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                    }}
                                    className="absolute inset-0"
                                >
                                </div>
                                <div className="w-85.5 h-33.75">
                                    <ImagePreview src={logo} alt="hero" objectFit="cover" className="invert  brightness-0" />
                                </div>
                            </div>

                            <div className="overflow-hidden md:px-2">
                                <AnimatePresence mode="wait">
                                    <motion.div key={step} {...stepTransition}>
                                        {
                                            registerModal &&
                                            <RegisterModal setLogintModal={setLogintModal} setRegisterModal={setRegisterModal} loginModal={loginModal} openLinkSent={openLinkSent} />
                                        }
                                        {
                                            loginModal &&
                                            <LoginModal setRegisterModal={setRegisterModal} setPhoneModal={setPhoneModal} setLogintModal={setLogintModal} loginModal={loginModal} phoneModal={phoneModal} setForgotPass={setForgotPass} onAuthSuccess={() => onClose(false)} authMethods={authMethods} openLinkSent={openLinkSent} />
                                        }
                                        {
                                            phoneModal &&
                                            <PhoneModal setRegisterModal={setRegisterModal} setOptModal={setOptModal} setPhoneModal={setPhoneModal} setLogintModal={setLogintModal} loginModal={loginModal} phoneModal={phoneModal} sendOtp={sendOtp} onAuthSuccess={() => onClose(false)} authMethods={authMethods} />
                                        }
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                        </div>
                    </DialogContent>
            }
        </Dialog >
    )
}

export default AuthModal
