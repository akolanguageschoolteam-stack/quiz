'use client'
import React, { useCallback, useEffect, useRef, useState } from "react"
import { z } from 'zod'
import { useDispatch, useSelector } from "react-redux"
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Typography } from "../storybook/atoms/Typography";
import Input from "../storybook/atoms/Input/Input";
import { Button } from "../storybook/atoms/Button";
import ImagePreview from "../storybook/atoms/ImagePreview/ImagePreview";
import { Camera, Mail, User } from "../common/Icons";
import { useTranslation } from "@/hooks/useTranslation";
import avtar from '@/assets/avtars/Avatar.svg'
import avtar1 from '@/assets/avtars/Avatar-1.svg'
import avtar2 from '@/assets/avtars/Avatar-2.svg'
import avtar3 from '@/assets/avtars/Avatar-3.svg'
import avtar4 from '@/assets/avtars/Avatar-4.svg'
import avtar7 from '@/assets/avtars/Avatar-7.svg'
import avtar8 from '@/assets/avtars/Avatar-8.svg'
import avtar9 from '@/assets/avtars/Avatar-9.svg'
import avtar10 from '@/assets/avtars/Avatar-10.svg'
import avtar13 from '@/assets/avtars/Avatar-13.svg'
import avtar14 from '@/assets/avtars/Avatar-14.svg'
import { convertGuest, fetchUserProfile, signup, updateProfileData } from "@/api/apiRoutes";
import { loginSuccess, profileSelector, setProfile } from "@/redux/reducers/userSlice";
import { setPromptSystemLanguage } from "@/redux/reducers/languageSlice";
import { getErrorMessage } from "@/utils/errorMessages";
import { toast } from "@/lib/toast"

type CompleteProfileErrors = Partial<Record<string, string>>

interface CompleteProfileModalProps {
  isEditProfile?: boolean,
  isConvertGuest?: boolean,
  open: boolean,
  onClose: (open: boolean) => void
  firebaseId?: string
  fcmToken?: string | null
  type?: string
  mobile?: string
  email?: string
  onSuccess?: () => void
}

const CompleteProfileModal = ({ open, onClose, firebaseId, fcmToken, type = 'mobile', mobile, email, onSuccess, isEditProfile = false, isConvertGuest = false }: CompleteProfileModalProps) => {

  const { t } = useTranslation();
  const dispatch = useDispatch();
  const userData = useSelector(profileSelector);

  const [formData, setFormData] = useState({
    name: userData?.name,
    referralCode: userData?.refer_code,
    email: userData?.email ?? '',
    mobile: userData?.mobile ?? '',
  });

  const avtars = [
    {
      id: 0,
      avtar: avtar
    },
    {
      id: 1,
      avtar: avtar1
    },
    {
      id: 2,
      avtar: avtar2
    },
    {
      id: 3,
      avtar: avtar3
    },
    {
      id: 4,
      avtar: avtar4
    },
    {
      id: 7,
      avtar: avtar7
    },
    {
      id: 8,
      avtar: avtar8
    },
    {
      id: 9,
      avtar: avtar9
    },
    {
      id: 10,
      avtar: avtar10
    },
    {
      id: 13,
      avtar: avtar13
    },
    {
      id: 14,
      avtar: avtar14
    }
  ]

  const [selectedAvtarId, setSelectedAvtarId] = useState<number>(avtars[0].id)
  const [uploadedAvtarFile, setUploadedAvtarFile] = useState<File | null>(null)
  const [uploadedAvtarPreview, setUploadedAvtarPreview] = useState<string | null>(null)
  const [avatarChanged, setAvatarChanged] = useState(false)
  const [errors, setErrors] = useState<CompleteProfileErrors>({})
  const [loading, setLoading] = useState<boolean>(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const selectedAvtar = avtars.find((avtar) => avtar.id === selectedAvtarId) ?? avtars[0]


  const isMobileLocked = isEditProfile && userData?.type === 'mobile'
  const isEmailLocked = isEditProfile && !!userData?.type && userData.type !== 'mobile'
  // A guest has no real email/mobile identity yet — editing is limited to name and avatar.
  const isGuestEditing = isEditProfile && userData?.type === 'guest'

  useEffect(() => {
    return () => {
      if (uploadedAvtarPreview) URL.revokeObjectURL(uploadedAvtarPreview)
    }
  }, [uploadedAvtarPreview])

  const handleAvtarUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleAvtarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadedAvtarFile(file)
    setAvatarChanged(true)
    setUploadedAvtarPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return URL.createObjectURL(file)
    })
    e.target.value = ""
  }

  const handleSelectAvtar = (id: number) => {
    setSelectedAvtarId(id)
    setUploadedAvtarFile(null)
    setAvatarChanged(true)
    setUploadedAvtarPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
  }



  const completeProfileSchema = isEditProfile
    ? z.object({
      name: z.string().min(1, t('nameRequired')),
      email: z.union([z.literal(''), z.string().email(t('invalidEmail'))]),
      mobile: z.union([z.literal(''), z.string().min(10, t('phoneMinLength'))]),
    })
    : z.object({
      name: z.string().min(1, t('nameRequired')),
      referralCode: z.string().optional(),
    })

  const handleValidateForm = useCallback((): boolean => {
    const result = completeProfileSchema.safeParse(formData)
    if (!result.success) {
      const fieldErrors: CompleteProfileErrors = {}
      result.error.issues.forEach((err: z.ZodIssue) => {
        const field = err.path[0] as string
        if (!fieldErrors[field]) fieldErrors[field] = err.message
      })
      setErrors(fieldErrors)
      return false
    }
    setErrors({})
    return true
  }, [formData, completeProfileSchema])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const isValid = handleValidateForm()
    if (!isValid) return

    if (isEditProfile) {
      try {
        setLoading(true)
        setErrors({})

        let profileImage: File | undefined
        if (avatarChanged) {
          if (uploadedAvtarFile) {
            profileImage = uploadedAvtarFile
          } else {
            const avatarBlob = await fetch(selectedAvtar.avtar.src).then((r) => r.blob())
            profileImage = new File([avatarBlob], `avatar-${selectedAvtar.id}.svg`, { type: avatarBlob.type || 'image/svg+xml' })
          }
        }



        const res = await updateProfileData({
          name: formData.name ?? '',
          email: formData.email,
          mobile: formData.mobile,
          ...(profileImage ? { profile_image: profileImage } : { profile_url: userData?.profile ?? undefined }),
        })

        if (res.success) {
          dispatch(setProfile(res.data))
          onClose(false)
          onSuccess?.()
        }
      } catch (error) {
        toast.error(getErrorMessage(error, t('nameRequired')))
      } finally {
        setLoading(false)
      }
      return
    }

    if (isConvertGuest) {
      try {
        setLoading(true)
        setErrors({})

        const res = await convertGuest({
          type,
          name: formData.name ?? '',
          email: email ?? null,
          mobile: mobile ? mobile.replace(/\D/g, '').slice(-10) : null,
        })
        dispatch(setProfile(res.data))
        onClose(false)
        onSuccess?.()
      } catch (error) {
        setErrors({ name: getErrorMessage(error, t('nameRequired')) })
      } finally {
        setLoading(false)
      }
      return
    }

    if (!firebaseId) return

    try {
      setLoading(true)
      setErrors({})

      let avatarFile = uploadedAvtarFile
      if (!avatarFile) {
        const avatarBlob = await fetch(selectedAvtar.avtar.src).then((r) => r.blob())
        avatarFile = new File([avatarBlob], `avatar-${selectedAvtar.id}.svg`, { type: avatarBlob.type || 'image/svg+xml' })
      }

      const formPayload = new FormData()
      formPayload.append('firebase_id', firebaseId)
      formPayload.append('type', type)
      formPayload.append('name', formData.name ?? '')
      formPayload.append('profile_image', avatarFile)
      if (fcmToken) formPayload.append('fcm_token', fcmToken)
      if (formData.referralCode) formPayload.append('friends_code', formData.referralCode)
      if (mobile) formPayload.append('mobile', mobile.replace(/\D/g, '').slice(-10))
      if (email) formPayload.append('email', email)

      const res = await signup(formPayload)
      if (res.data.is_new && res.data.token) {
        dispatch(loginSuccess(res.data.token))
        const profileRes = await fetchUserProfile()
        dispatch(setProfile(profileRes.data))
        onClose(false)
        onSuccess?.()

        dispatch(setPromptSystemLanguage(true))
      } else {
        toast.error("Something went wrong")
      }
    } catch (error) {
      setErrors({ name: getErrorMessage(error, t('nameRequired')) })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} className="">
        <div className="surfaceBrightBg rounded-[42px] p-6 md:p-8 gap-8 max-h-[calc(100vh-2rem)] overflow-y-auto customScrollbar flexCol disabled:commonBg!">
          <div className="flexColCenter text-center gap-2">
            <Typography variant="h2">
              {t(isEditProfile ? 'editProfile' : 'completeProfile')}
            </Typography>
            <Typography variant="h4" className="font-nunito! onSurfaceVarColor!" weight="medium">
              {t(isEditProfile ? 'editProfileDesc' : 'completeProfileDesc')}
            </Typography>
          </div>

          <div className="relative w-fit mx-auto">
            <div className="w-25 md:w-31.5 h-25 md:h-31.5 rounded-full p-1 primaryBorder border-2">
              <ImagePreview
                src={uploadedAvtarPreview ?? (avatarChanged ? selectedAvtar.avtar : (userData?.profile ?? selectedAvtar.avtar))}
                alt="selected avatar"
                rounded="full"
                className="w-full h-full"
              />
            </div>
            <button
              type="button"
              aria-label={t('uploadPhoto')}
              onClick={handleAvtarUploadClick}
              className="absolute -bottom-4 inset-x-0 m-auto w-10 h-10 rounded-full bg-black flexCenter cursor-pointer"
            >
              <Camera />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvtarFileChange}
            />
          </div>

          <div className="surfaceContainerLowBg rounded-3xl p-4 sm:overflow-x-auto customScrollbar">
            <div className="grid grid-cols-4 sm:grid-rows-2 sm:grid-flow-col gap-3 w-full sm:w-fit">
              {avtars.map((avtar) => {
                const isSelected = !uploadedAvtarPreview && avtar.id === selectedAvtarId
                return (
                  <button
                    key={avtar.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => handleSelectAvtar(avtar.id)}
                    className={`w-16 md:w-20 h-16 md:h-20 rounded-full p-0.5 shrink-0 transition-colors duration-200 ${isSelected ? 'primaryBorder border-2' : 'border-2 border-transparent'}`}
                  >
                    <ImagePreview
                      src={avtar.avtar}
                      alt={`avatar ${avtar.id}`}
                      rounded="full"
                      className="w-full h-full"
                    />
                  </button>
                )
              })}
            </div>
          </div>

          <form onSubmit={handleSave} className="flexCol gap-3">
            <Input
              fullWidth
              required
              type="text"
              variant="default"
              leftIcon={<User />}
              placeholder={t('enterYourName')}
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              error={errors.name}
            />
            {
              isEditProfile ?
                <>
                  {!isGuestEditing && (
                    <Input
                      fullWidth
                      type="email"
                      variant="default"
                      leftIcon={<Mail />}
                      placeholder={t('enterYourEmail')}
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      error={errors.email}
                      disabled={isEmailLocked}
                    />
                  )}
                  {!isGuestEditing && (
                    <Input
                      fullWidth
                      type="tel"
                      variant="default"
                      placeholder={t('phoneNumber')}
                      value={formData.mobile}
                      onChange={(e) => setFormData(prev => ({ ...prev, mobile: e.target.value }))}
                      error={errors.mobile}
                      disabled={isMobileLocked}
                      maxLength={15}
                    />
                  )}
                </>
                :
                !isConvertGuest &&
                <Input
                  fullWidth
                  type="text"
                  variant="filled"
                  placeholder={t('referralCodeOptional')}
                  value={formData.referralCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, referralCode: e.target.value }))}
                />
            }
            <div className='flexCenter mt-2'>
              <Button fullWidth type="submit" loading={loading}>
                {t('save')}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default CompleteProfileModal
