'use client'
import { useTranslation } from '@/hooks/useTranslation';
import ProfileLayout from './ProfileLayout'
import { useIsMobile } from '@/hooks/useMobile';
import { Button } from '@/components/storybook/atoms/Button';
import { useEffect, useState } from 'react';
import { Dollar, PremiumCoin } from '@/components/common/Icons';
import { Typography } from '@/components/storybook/atoms/Typography';
import Input from '@/components/storybook/atoms/Input/Input';
import ImagePreview from '@/components/storybook/atoms/ImagePreview';
import { ArrowLeftRight, Banknote, CreditCard, Smartphone, Wallet as WalletIcon } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { itemVariants, listVariants } from '@/lib/motionVariants';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { fetchPaymentMethods, fetchTransactions, submitPaymentRequests } from '@/api/apiRoutes';
import type { PaymentMethodFieldType } from '@/types/GlobalTypes';
import { useSelector } from 'react-redux';
import { webSettingsSelector } from '@/redux/reducers/settingsSlice';
import { profileSelector } from '@/redux/reducers/userSlice';
import { toast } from '@/lib/toast';
import { getErrorMessage } from '@/utils/errorMessages';
import { formatCoins, formateDate } from '@/lib/helper';
import EmptyStatus from '@/components/common/EmptyStatus';
import HorizontalCardSkeleton from '@/components/skeltons/HorizontalCardSkeleton';

const TRANSACTIONS_LIMIT = 10;

const CARD_CLASS = 'surfaceContainerLowestBg p-4 sm:p-6 rounded-3xl border shadow-[0px_8px_32px_0px_#0000000A] w-full'

const stepTransition = {
    initial: { opacity: 0, x: 24 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -24 },
    transition: { duration: 0.25, ease: 'easeInOut' as const },
}

const FALLBACK_METHOD_ICONS = [CreditCard, Smartphone, Banknote, WalletIcon]

const COINS_AMOUNT_PATTERN = /^\d*$/

const FIELD_INPUT_TYPE: Record<PaymentMethodFieldType, string> = {
    text: 'text',
    number: 'number',
    email: 'email',
    textarea: 'text',
}

const STATUS_STYLES = {
    success: { labelKey: 'success', pillBg: 'successContainerBg', pillColor: 'successColor!' },
    pending: { labelKey: 'pending', pillBg: 'warningContainerBg', pillColor: 'warningColor!' },
    failed: { labelKey: 'failed', pillBg: 'bg-[#FFEEEF]', pillColor: 'errorColor!' },
} as const

const getTransactionStatusStyle = (statusLabel: string | null) => {
    const normalized = (statusLabel ?? '').toLowerCase();
    if (normalized.includes('reject') || normalized.includes('fail') || normalized.includes('decline')) return STATUS_STYLES.failed;
    if (normalized.includes('approve') || normalized.includes('success') || normalized.includes('complete') || normalized.includes('paid')) return STATUS_STYLES.success;
    return STATUS_STYLES.pending;
}

const MyWallet = () => {

    type Tabs = 'withdraw' | 'transactions'

    const { t } = useTranslation();
    const isMobile = useIsMobile();

    const settingsData = useSelector(webSettingsSelector);
    const userData = useSelector(profileSelector)

    const [activeTab, setActiveTab] = useState<Tabs>('withdraw');
    const [selectedMethodId, setSelectedMethodId] = useState<number | null>(null);
    const [coinsAmount, setCoinsAmount] = useState(userData?.redeemable_coins?.toString());
    const [fieldValues, setFieldValues] = useState<Record<string, string>>({});

    const { data: paymentMethodsData, isLoading, isError, error } = useQuery({
        queryKey: ['paymentMethods'],
        queryFn: async () => (await fetchPaymentMethods()).data,
        staleTime: 5 * 60 * 1000, // 5 min
    })

    useEffect(() => {
        if (isError) {
            console.log("paymentMethods Error => ", error?.message);
        }
    }, [isError]);

    const paymentMethods = paymentMethodsData ?? [];
    const effectiveMethodId = selectedMethodId ?? paymentMethods[0]?.id ?? null;
    const selectedMethod = paymentMethods.find((method) => method.id === effectiveMethodId);

    useEffect(() => {
        if (effectiveMethodId) {
            setSelectedMethodId(effectiveMethodId)
        }
    }, [effectiveMethodId]);
    const [fieldsResetKey, setFieldsResetKey] = useState(effectiveMethodId);
    if (fieldsResetKey !== effectiveMethodId) {
        setFieldsResetKey(effectiveMethodId);
        setFieldValues({});
    }

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleConvertNow = async () => {
        if (!selectedMethod || !coinsAmount || coinsExceedBalance || isBelowMinCoins || hasMissingRequiredField) return;
        setIsSubmitting(true);
        try {
            const fields: Record<string, string> = {};
            selectedMethod.fields.forEach((field) => {
                fields[String(field.id)] = fieldValues[field.key] ?? '';
            });
            const response = await submitPaymentRequests({
                payment_method_id: selectedMethod.id,
                coin_used: Number(coinsAmount) || 0,
                fields,
            });
            if (response?.success) {
                setCoinsAmount('');
                setFieldValues({});
                toast.error(response?.message)
            } else {
                toast.error(response?.message || t('somethingWentWrong'))
            }
        } catch (error) {
            toast.error(getErrorMessage(error, t('somethingWentWrong')))
        } finally {
            setIsSubmitting(false);
        }
    }

    const paymentPerCoin = Number(settingsData?.payment_per_coin ?? 0);
    const paymentCoinAmount = Number(settingsData?.payment_coin_amount ?? 0);
    const currencySymbol = settingsData?.payment_currency_symbol ?? '';
    // paymentPerCoin coins convert to paymentCoinAmount currency units (e.g. 10 coins = $1)
    const coinToAmountRate = paymentPerCoin > 0 ? paymentCoinAmount / paymentPerCoin : 0;
    const convertedAmount = (Number(coinsAmount) || 0) * coinToAmountRate;

    const userCoins = Number(userData?.redeemable_coins ?? 0);
    const requestedCoins = Number(coinsAmount) || 0;
    const coinsExceedBalance = requestedCoins > userCoins;
    const minCoinLimit = Number(settingsData?.payment_coin_limit ?? 0);
    const isBelowMinCoins = minCoinLimit > 0 && requestedCoins > 0 && requestedCoins < minCoinLimit;
    const hasMissingRequiredField = (selectedMethod?.fields ?? []).some(
        (field) => field.is_required && !fieldValues[field.key]?.trim()
    );

    const {
        data: transactionData,
        isLoading: transactionLoading,
        isError: isTransactionErr,
        error: transactionErr,
        hasNextPage: hasMoreTransactions,
        isFetchingNextPage: isFetchingMoreTransactions,
        fetchNextPage: fetchMoreTransactions,
    } = useInfiniteQuery({
        queryKey: ['transactions'],
        queryFn: async ({ pageParam }) => (await fetchTransactions(pageParam, TRANSACTIONS_LIMIT)).data,
        initialPageParam: 0,
        getNextPageParam: (lastPage) => {
            const nextOffset = lastPage.pagination.offset + lastPage.pagination.limit
            return nextOffset < lastPage.pagination.total ? nextOffset : undefined
        },
        staleTime: 5 * 60 * 1000, // 5 min
    })

    useEffect(() => {
        if (isTransactionErr) {
            console.log("transactions Error => ", transactionErr?.message);
        }
    }, [isTransactionErr]);

    const transactions = transactionData?.pages.flatMap((page) => page.requests) ?? [];
    const totalEarned = transactionData?.pages[0]?.total_earned ?? 0;


    return (
        <ProfileLayout title={t('myWallet')} desc={t('myWalletDesc')}
            headerActions={
                <div className="flexCenter md:justify-end">
                    <div className="max-md:commonBg surfaceContainerLowestBg rounded-3xl p-2 inline-flex flex-wrap border gap-1">
                        <Button
                            type="button"

                            variant={activeTab === 'withdraw' ? 'secondary' : 'outline'}
                            className={activeTab === 'withdraw' ? 'px-6! border-none! shadow-none!' : 'px-6! border-none! bg-transparent!'}
                            onClick={() => setActiveTab('withdraw')}
                        >
                            {t('withdraw')}
                        </Button>
                        <Button
                            type="button"
                            variant={activeTab === 'transactions' ? 'secondary' : 'outline'}
                            className={activeTab === 'transactions' ? 'px-6! border-none! shadow-none!' : 'px-6! border-none! bg-transparent!'}
                            onClick={() => setActiveTab('transactions')}
                        >
                            {t('transactions')}
                        </Button>
                    </div>
                </div>
            }
        >
            <AnimatePresence mode="wait">
                <motion.div key={activeTab} {...stepTransition}>
                    {
                        activeTab === 'withdraw' ?
                            <div className="flexCol items-center gap-6 max-w-xl mx-auto commonPY">
                                <div className='flexColCenter gap-2'>
                                    <PremiumCoin width={isMobile ? 56 : 72} height={isMobile ? 56 : 72} />
                                    <div className="flexColCenter text-center gap-1">
                                        <Typography variant="h2" weight="bold">{userCoins} {t('redeemable')} {t('coins')}</Typography>
                                        <Typography variant="subtitle2" weight='medium' className="onSurfaceVarColor! font-nunito!">{t('enoughCoinsConvert')}</Typography>
                                    </div>
                                </div>

                                <div className={`${CARD_CLASS} flexCol gap-6`}>
                                    <Input
                                        fullWidth
                                        type="number"
                                        variant="default"
                                        inputMode="numeric"
                                        placeholder={t('enterCoinsAmount')}
                                        value={coinsAmount}
                                        min={0}
                                        step={1}
                                        onChange={(e) => {
                                            if (COINS_AMOUNT_PATTERN.test(e.target.value)) {
                                                setCoinsAmount(e.target.value);
                                            }
                                        }}
                                        onWheel={(e) => e.currentTarget.blur()}
                                        error={
                                            coinsExceedBalance
                                                ? t('insufficientCoins')
                                                : isBelowMinCoins
                                                    ? t('minCoinsRequired').replace('{count}', String(minCoinLimit))
                                                    : undefined
                                        }
                                    />
                                    <div className="flex items-center justify-center gap-4 sm:gap-12 flex-wrap">
                                        <div className="flex items-center gap-2">
                                            <PremiumCoin width={32} height={32} />
                                            <div>
                                                <Typography variant="h4" weight="extrabold">{formatCoins(coinsAmount ?? 0)}</Typography>
                                                <Typography variant="caption" className="onSurfaceVarColor! font-nunito!">{t('coins')}</Typography>
                                            </div>
                                        </div>
                                        <ArrowLeftRight className="w-5 h-5 onSurfaceVarColor shrink-0" />
                                        <div className="flex items-center gap-2">
                                            <Dollar />
                                            <div>
                                                <Typography variant="h4" weight="extrabold">{currencySymbol}{formatCoins(convertedAmount.toFixed(2))}</Typography>
                                                <Typography variant="caption" className="onSurfaceVarColor! font-nunito!">{t('realMoney')}</Typography>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className={`${CARD_CLASS} flexCol gap-6`}>
                                    <div className='flexCenter'>
                                        <div className="flexCenter gap-4 commonBg rounded-2xl p-2">
                                            {paymentMethods.map((method, idx) => {
                                                const FallbackIcon = FALLBACK_METHOD_ICONS[idx % FALLBACK_METHOD_ICONS.length]
                                                return (
                                                    <button
                                                        key={method.id}
                                                        type="button"
                                                        title={method.name}
                                                        onClick={() => setSelectedMethodId(method.id)}
                                                        className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flexCenter transition-colors duration-200 ${selectedMethodId === method.id ? 'border surfaceContainerLowestBg' : 'border-transparent'}`}
                                                    >
                                                        {method.icon_url ? (
                                                            <ImagePreview
                                                                src={method.icon_url}
                                                                alt={method.name}
                                                                objectFit="contain"
                                                                containerClassName="w-8 h-8"
                                                            />
                                                        ) : (
                                                            <FallbackIcon className="w-6 h-6" />
                                                        )}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    {selectedMethod?.fields.map((field) => (
                                        <Input
                                            key={field.id}
                                            fullWidth
                                            variant="default"
                                            type={FIELD_INPUT_TYPE[field.field_type]}
                                            inputMode={field.field_type === 'number' ? 'numeric' : undefined}
                                            label={field.label}
                                            required={field.is_required}
                                            placeholder={field.placeholder ?? undefined}
                                            value={fieldValues[field.key] ?? ''}
                                            onChange={(e) => setFieldValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                                        />
                                    ))}

                                    <Button
                                        type="button"
                                        variant="primary"
                                        fullWidth
                                        onClick={handleConvertNow}
                                        disabled={isSubmitting || !selectedMethod || !coinsAmount || coinsExceedBalance || isBelowMinCoins || hasMissingRequiredField}
                                    >
                                        {isSubmitting ? t('loading') : t('convertNow')}
                                    </Button>

                                    <ul className="list-disc pl-5 flexCol gap-1">
                                        <li>
                                            <Typography variant="caption" className="onSurfaceVarColor! font-nunito!">{t('payoutDuration')}</Typography>
                                        </li>
                                        <li>
                                            <Typography variant="caption" className="onSurfaceVarColor! font-nunito!">
                                                {t('minRedeemable')
                                                    .replace('{currency}', currencySymbol)
                                                    .replace('{amount}', (minCoinLimit * coinToAmountRate).toFixed(2))
                                                    .replace('{coins}', String(minCoinLimit))}
                                            </Typography>
                                        </li>
                                        <li>
                                            <Typography variant="caption" className="onSurfaceVarColor! font-nunito!">{t('redeemCoinsDesc')}</Typography>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            :
                            <div className="flexCol gap-6">
                                <div className="surfaceContainerLowestBg rounded-2xl p-4 flex items-center gap-4">
                                    <Dollar />
                                    <div>
                                        <Typography variant="h4" weight="extrabold">{currencySymbol}{formatCoins(totalEarned)}</Typography>
                                        <Typography variant="caption" weight='semibold' className="onSurfaceVarColor! font-nunito!">{t('totalCashEarned')}</Typography>
                                    </div>
                                </div>

                                <div className="flexCol gap-4">
                                    <Typography variant="h4" weight="extrabold">{t('allTransactions')}</Typography>
                                    {
                                        transactionLoading ?
                                            Array.from({ length: 5 }).map((_, idx) => (
                                                <HorizontalCardSkeleton examCard key={idx} />
                                            ))
                                            :
                                            transactions.length > 0 ?
                                                <motion.div
                                                    className="flexCol gap-4"
                                                    variants={listVariants}
                                                    initial="hidden"
                                                    whileInView="show"
                                                    viewport={{ once: true, amount: 0.2 }}
                                                >
                                                    {transactions.map((txn) => {
                                                        const status = getTransactionStatusStyle(txn.status_label)
                                                        return (
                                                            <motion.div key={txn.id} variants={itemVariants} className="surfaceContainerLowestBg rounded-2xl p-3 sm:p-4 flex items-center justify-between gap-3">
                                                                <div className="flex items-center gap-3 min-w-0">
                                                                    <div className="w-11 h-11 rounded-xl commonBg flexCenter shrink-0">
                                                                        {txn.payment_method.icon_url ? (
                                                                            <ImagePreview
                                                                                src={txn.payment_method.icon_url}
                                                                                alt={txn.payment_method.name}
                                                                                objectFit="contain"
                                                                                containerClassName="w-6 h-6"
                                                                            />
                                                                        ) : (
                                                                            <WalletIcon className="w-5 h-5" />
                                                                        )}
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <Typography variant="h6" weight="bold" className="truncate">{txn.status_label ?? t(status.labelKey)}</Typography>
                                                                        <Typography variant="caption" className="onSurfaceVarColor! font-nunito!">{txn.created_at ? formateDate(txn.created_at) : '-'}</Typography>
                                                                    </div>
                                                                </div>
                                                                <div className={`${status.pillBg} py-1.5 px-3 shrink-0`}>
                                                                    <Typography variant="caption" weight="bold" className={status.pillColor}>{currencySymbol}{formatCoins(txn.payment_amount)}</Typography>
                                                                </div>
                                                            </motion.div>
                                                        )
                                                    })}
                                                </motion.div>
                                                :
                                                <EmptyStatus />
                                    }
                                    {hasMoreTransactions && (
                                        <div className="flexCenter mt-2">
                                            <Button
                                                variant="secondary"
                                                onClick={() => fetchMoreTransactions()}
                                                disabled={isFetchingMoreTransactions}
                                            >
                                                {isFetchingMoreTransactions ? t('loading') : t('loadMore')}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                    }
                </motion.div>
            </AnimatePresence>
        </ProfileLayout>
    )
}

export default MyWallet
