import { StaticImageData } from "next/image";

export interface RankCardProps {
    avatar: StaticImageData | string;
    name: string;
    streak: number;
    rank: number;
    className?: string;
    coins?: number;
    contestModal?: boolean;
    leaderboard?: boolean;
}
