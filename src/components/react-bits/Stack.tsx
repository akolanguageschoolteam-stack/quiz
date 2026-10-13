'use client'
import { useIsMobile } from '@/hooks/useMobile';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, useMotionValue, useTransform, type PanInfo } from 'motion/react';
import { useState, useEffect } from 'react';

const SKELETON_CARD_COUNT = 4;

const buildSkeletonStack = () =>
  Array.from({ length: SKELETON_CARD_COUNT }, (_, index) => ({
    id: index + 1,
    content: <Skeleton className="absolute inset-0 rounded-[32px]" />
  }));

interface CardRotateProps {
  children: React.ReactNode;
  onSendToBack: () => void;
  sensitivity: number;
  disableDrag?: boolean;
}

function CardRotate({ children, onSendToBack, sensitivity, disableDrag = false }: CardRotateProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [60, -60]);
  const rotateY = useTransform(x, [-100, 100], [-60, 60]);

  function handleDragEnd(_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
    if (Math.abs(info.offset.x) > sensitivity || Math.abs(info.offset.y) > sensitivity) {
      onSendToBack();
    } else {
      x.set(0);
      y.set(0);
    }
  }

  if (disableDrag) {
    return (
      <motion.div className="absolute inset-0 cursor-pointer" style={{ x: 0, y: 0 }}>
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      className="absolute inset-0 cursor-grab"
      style={{ x, y, rotateX, rotateY }}
      drag
      dragConstraints={{ top: 0, right: 0, bottom: 0, left: 0 }}
      dragElastic={0.6}
      whileTap={{ cursor: 'grabbing' }}
      onDragEnd={handleDragEnd}
    >
      {children}
    </motion.div>
  );
}

interface StackProps {
  randomRotation?: boolean;
  sensitivity?: number;
  sendToBackOnClick?: boolean;
  cards?: React.ReactNode[];
  animationConfig?: { stiffness: number; damping: number };
  autoplay?: boolean;
  autoplayDelay?: number;
  pauseOnHover?: boolean;
  mobileClickOnly?: boolean;
  mobileBreakpoint?: number;
  onTopCardChange?: (index: number) => void;
  isLoading?: boolean;
}

export default function Stack({
  randomRotation = false,
  sensitivity = 200,
  cards = [],
  animationConfig = { stiffness: 260, damping: 20 },
  sendToBackOnClick = false,
  autoplay = false,
  autoplayDelay = 3000,
  pauseOnHover = false,
  mobileClickOnly = false,
  mobileBreakpoint = 768,
  onTopCardChange,
  isLoading = false
}: StackProps) {

  const isMobile = useIsMobile();
  const [isPaused, setIsPaused] = useState(false);
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, [])

  // No cards yet means there's no real data to show — always render the loading
  // skeleton rather than falling back to placeholder stock images.
  const isEffectivelyLoading = isLoading || cards.length === 0;

  const shouldDisableDrag = (mobileClickOnly && isMobile) || isEffectivelyLoading;
  const shouldEnableClick = (sendToBackOnClick || shouldDisableDrag) && !isEffectivelyLoading;

  const [stack, setStack] = useState<{ id: number; content: React.ReactNode }[]>(() => {
    if (isEffectivelyLoading) {
      return buildSkeletonStack();
    }
    return cards.map((content, index) => ({ id: index + 1, content }));
  });

  useEffect(() => {
    if (isEffectivelyLoading) {
      setStack(buildSkeletonStack());
    } else {
      setStack(cards.map((content, index) => ({ id: index + 1, content })));
    }
  }, [cards, isEffectivelyLoading]);

  const sendToBack = (id: number) => {
    setStack(prev => {
      const newStack = [...prev];
      const index = newStack.findIndex(card => card.id === id);
      const [card] = newStack.splice(index, 1);
      newStack.unshift(card);
      return newStack;
    });
  };

  useEffect(() => {
    if (!isEffectivelyLoading && stack.length) {
      onTopCardChange?.(stack[stack.length - 1].id - 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stack, isEffectivelyLoading]);

  useEffect(() => {
    if (!isEffectivelyLoading && autoplay && stack.length > 1 && !isPaused) {
      const interval = setInterval(() => {
        const topCardId = stack[stack.length - 1].id;
        sendToBack(topCardId);
      }, autoplayDelay);

      return () => clearInterval(interval);
    }
  }, [autoplay, autoplayDelay, stack, isPaused, isEffectivelyLoading]);

  return (
    isClient &&
    <div
      className="relative w-full h-full"
      style={{
        perspective: 600
      }}
      onMouseEnter={() => pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => pauseOnHover && setIsPaused(false)}
    >
      {stack.map((card, index) => {
        const randomRotate = randomRotation ? Math.random() * 10 - 5 : 0;
        return (
          <CardRotate
            key={card.id}
            onSendToBack={() => sendToBack(card.id)}
            sensitivity={sensitivity}
            disableDrag={shouldDisableDrag}
          >
            <motion.div
              className="relative w-full h-full rounded-[42px] overflow-hidden commonBg p-4 shadow-[20px_14px_142px_0px_#0000001F]"
              onClick={() => shouldEnableClick && sendToBack(card.id)}
              animate={{
                rotateZ: (stack.length - index - 1) * 12 + randomRotate,
                scale: 1 + index * 0.06 - stack.length * 0.06,
                transformOrigin: '90% 90%'
              }}
              initial={false}
              transition={{
                type: 'spring',
                stiffness: animationConfig.stiffness,
                damping: animationConfig.damping
              }}
            >
              {card.content}
            </motion.div>
          </CardRotate>
        );
      })}
    </div>
  );
}

