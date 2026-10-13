import { StaticImageData } from "next/image";

export interface HorizontalCardProps {
    title: string;
    desc: string;
    img: StaticImageData | string;
    imgAlt?: string;
    className?: string;
    onClick?: () => void;
    size?: 'sm' | 'lg'
    btnLabel?: string
    loading?: boolean
    disabled?: boolean
}
