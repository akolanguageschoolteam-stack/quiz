import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Typography } from "@/components/storybook/atoms/Typography";
import type { LifelineItem } from "./types";
import { PremiumCoin } from "@/components/common/Icons";

interface LifelineBarProps {
    items: LifelineItem[];
    layout?: 'vertical' | 'horizontal';
}

const COIN_REVEAL_DURATION = 2000;

const LifelineBar = ({ items, layout = 'vertical' }: LifelineBarProps) => {
    const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set());
    const timeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

    useEffect(() => {
        const timeouts = timeoutsRef.current;
        return () => {
            timeouts.forEach((timeoutId) => clearTimeout(timeoutId));
        };
    }, []);

    const revealCoin = (key: string) => {
        const existingTimeout = timeoutsRef.current.get(key);
        if (existingTimeout) clearTimeout(existingTimeout);

        setRevealedKeys((prev) => new Set(prev).add(key));

        const timeoutId = setTimeout(() => {
            setRevealedKeys((prev) => {
                const next = new Set(prev);
                next.delete(key);
                return next;
            });
            timeoutsRef.current.delete(key);
        }, COIN_REVEAL_DURATION);

        timeoutsRef.current.set(key, timeoutId);
    };

    const handleItemClick = (item: LifelineItem) => {
        if (item.costsCoin !== false) revealCoin(item.key);
        item.onClick();
    };

    if (layout == 'horizontal') {
        return (
            <div className="flexCenter commonMT">
                <div className="flexCenter gap-6 flex-wrap">
                    {items.map((item) => (
                        <div
                            key={item.key}
                            className={`w-49.25 flexCenter gap-2 surfaceContainerLowestBg py-3 px-4 rounded-3xl ${item.disabled ? 'opacity-40 pointer-events-none' : 'cursor-pointer'}`}
                            onClick={item.disabled ? undefined : () => handleItemClick(item)}
                        >
                            <div className="relative flexCenter">
                                <AnimatePresence mode="wait" initial={false}>
                                    {revealedKeys.has(item.key) ? (
                                        <motion.div
                                            key="coin"
                                            initial={{ opacity: 0, y: 12 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -12 }}
                                            transition={{ duration: 0.3, ease: 'easeOut' }}
                                        >
                                            <PremiumCoin />
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="icon"
                                            initial={{ opacity: 0, y: 12 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -12 }}
                                            transition={{ duration: 0.3, ease: 'easeOut' }}
                                        >
                                            {item.icon}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                            <Typography variant="h6" className="font-nunito!" weight="semibold">
                                {item.label}
                            </Typography>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="flexCenter commonMT">
            <div className="flexCenter surfaceContainerLowestBg  py-3 px-6 rounded-3xl gap-6">
                {items.map((item) => (
                    <div
                        key={item.key}
                        className={`flexCol items-center gap-2 ${item.disabled ? 'opacity-40 pointer-events-none' : 'cursor-pointer'}`}
                        onClick={item.disabled ? undefined : () => handleItemClick(item)}
                    >
                        <div className="relative flexCenter rounded-full p-3 border surfaceContainerLowBg">
                            <AnimatePresence mode="wait" initial={false}>
                                {revealedKeys.has(item.key) ? (
                                    <motion.div
                                        key="coin"
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -12 }}
                                        transition={{ duration: 0.3, ease: 'easeOut' }}
                                    >
                                        <PremiumCoin />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="icon"
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -12 }}
                                        transition={{ duration: 0.3, ease: 'easeOut' }}
                                    >
                                        {item.icon}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        <Typography variant="caption" className="text-sm! font-nunito!" weight="semibold">
                            {item.label}
                        </Typography>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LifelineBar;
