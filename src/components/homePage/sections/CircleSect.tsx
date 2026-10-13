'use client'
import { CircleTextArrIcon } from '@/components/common/Icons';
import CircularText from '@/components/react-bits/CircleText'
import { useTranslation } from '@/hooks/useTranslation';

const CircleSect = () => {
    const { t } = useTranslation();
    return (
        // <div className='absolute -bottom-10 inset-x-0 mx-auto w-max  dark:bg-black bg-white rounded-full p-6'>
        <div className='mx-auto w-max  dark:bg-black bg-white rounded-full p-6 -mt-30 relative max-399:overflow-hidden'>
            <div className='absolute bg-primary bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.24)_0%)] bottom-[128px] max-375:-left-[280px] -left-[288px] inset-x-0 mx-auto max-375:w-10 w-12 h-12 z-2 rounded-br-[30px]' />
            <div className='absolute  dark:bg-black bg-white bottom-[128px] max-375:-left-[280px] -left-[288px] inset-x-0 mx-auto max-375:w-10 w-12 h-12 z-1' />

            <div className='absolute bg-primary bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.24)_0%)] bottom-[128px] ltr:left-[244px] rtl:-right-[288px] inset-x-0 mx-auto max-375:w-10 w-12 h-12 z-2 rounded-bl-[30px]' />
            <div className='absolute  dark:bg-black bg-white bottom-[128px] ltr:left-[244px] rtl:-right-[288px] inset-x-0 mx-auto max-375:w-10 w-12 h-12 z-1' />
            <div className='relative'>
                <div className='absolute inset-0 z-2 m-auto rounded-full overflow-hidden flexCenter h-14 w-14 bg-[linear-gradient(180deg,#FFFFFF_0%,rgba(255,255,255,0.7)_100%)] group'>
                    {/* exits toward top-right on hover (top-left in rtl) */}
                    <CircleTextArrIcon className='absolute transition-all duration-400 ltr:group-hover:translate-x-7 rtl:group-hover:-translate-x-7 group-hover:-translate-y-7 group-hover:opacity-0 rtl:rotate-270' />
                    {/* enters from bottom-left on hover (bottom-right in rtl) */}
                    <CircleTextArrIcon className='absolute transition-all duration-400 ltr:-translate-x-7 rtl:translate-x-7 translate-y-7 opacity-0 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100 rtl:rotate-270' />
                </div>
                <CircularText
                    text={`${t('getStart')} `}
                    onHover="speedUp"
                    spinDuration={20}
                    className="custom-class"
                />
            </div>
        </div>
    )
}

export default CircleSect