import { ContestPlayType } from '@/types/GlobalTypes';

export interface ContestCardProps {
    contest: ContestPlayType;
    /** Overlay badge text shown on top of the banner, e.g. "Starting in 12 Days" */
    badgeLabel?: string;
    entryFeeLabel: string;
    playersLabel: string;
    joinNowLabel: string;
    checkResultLabel: string;
    viewLeaderboardLabel: string;
    isCompleted?: boolean;
    isUpcoming?: boolean;
    isJoining?: boolean;
    joinedSuccessfullyLabel?: string;
    onJoin?: () => void;
    onCheckResult?: () => void;
    onCardClick?: () => void;
    className?: string;
}
