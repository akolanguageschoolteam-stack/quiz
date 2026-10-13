'use client'
import Link from 'next/link'
import LocalizedLink from '@/components/common/LocalizedLink'
import { useTranslation } from '@/hooks/useTranslation'
import { Typography } from '../storybook/atoms/Typography'
import ImagePreview from '../storybook/atoms/ImagePreview/ImagePreview'
import { usePathname } from 'next/navigation'
import { useSelector } from 'react-redux'
import { Call, Location, ThemeColoredMail } from '../common/Icons'
import { webSettingsSelector } from '@/redux/reducers/settingsSlice'


const Footer = () => {

  const webSettings = useSelector(webSettingsSelector);
  const { t } = useTranslation();

  const pathname = usePathname();

  const isHomePage = pathname === '/'


  const contactItems = [
    {
      icon: <Location />,
      content: webSettings?.company_address,
      href: null,
    },
    {
      icon: <ThemeColoredMail width={32} height={32} />,
      content: webSettings?.company_email,
      href: webSettings?.company_email ? `mailto:${webSettings?.company_email}` : null,
    },
    {
      icon: <Call className="" />,
      content: webSettings?.company_phone,
      href: webSettings?.company_phone ? `tel:${webSettings?.company_phone}` : null,
    },
  ]


  const legalLinks = [
    { label: t("privacyPolicy"), href: `/privacy-policy` },
    { label: t("termCondition"), href: `/terms-conditions` },
  ]

  const companyLinks = [
    { label: t("aboutUs"), href: `/about-us` },
    { label: t("contactUs"), href: `/contact-us` },
  ]

  const socialLinks = webSettings?.social_media || []

  return (
    <footer className={`bg-(--neutral-900) text-white ${isHomePage ? 'commonMT' : ''}`}>
      <div className="container py-8 md:py-10 lg:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Reach Us at */}
          <div className="flex flex-col gap-8">
            <h4 className="text-white text-lg lg:text-3xl">{t('reachUsAt')}</h4>
            <div className="flex flex-col gap-4">
              {contactItems.filter((item) => item?.content).map((item, index) => (
                <div key={index} className="flex gap-3">
                  <div>
                    {item?.icon}
                  </div>
                  <Link
                    href={item?.href || ''}
                    className="font-nunito! lg:text-xl"
                  >
                    {item?.content}
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Legal Info */}
          <div className="flex flex-col gap-8">
            <h4 className="text-white text-lg lg:text-3xl">{t('legalInfo')}</h4>
            <div className="flex flex-col gap-4">
              {legalLinks.map(({ label, href }) => (
                <LocalizedLink
                  key={label}
                  href={href}
                  className="font-nunito! lg:text-xl"
                >
                  {label}
                </LocalizedLink>
              ))}
            </div>
          </div>

          {/* Company */}
          <div className="flex flex-col gap-8">
            <h4 className="text-white text-lg lg:text-3xl">{t('company')}</h4>
            <div className="flex flex-col gap-4">
              {companyLinks.map(({ label, href }) => (
                <LocalizedLink
                  key={label}
                  href={href}
                  className="font-nunito! lg:text-xl"
                >
                  {label}
                </LocalizedLink>
              ))}
            </div>
          </div>

          {/* Follow Us */}
          {socialLinks?.length > 0 && (
            <div className="flex flex-col gap-8">
              <h4 className="text-white text-lg lg:text-3xl">{t('followUs')}</h4>
              <div className="flex gap-8">
                {socialLinks.map((media, index) => (
                  <Link
                    key={media?.link ?? index}
                    href={media?.link || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 shrink-0"
                  >
                    <ImagePreview src={media?.icon} alt="" objectFit="contain" containerClassName="w-full h-full" />
                  </Link>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Copyright bar */}
      {webSettings?.footer_text && (
        <div className="container py-4 flexCenter">
          <Typography variant='subtitle1' className='font-nunito!'>
            <span dangerouslySetInnerHTML={{ __html: webSettings.footer_text }} />
          </Typography>
        </div>
      )}
    </footer>
  )
}

export default Footer
