import { StaticImageData } from "next/image";

export interface VerticalCardProps {
    title: string;
    desc: string;
    img: StaticImageData | string;
    imgAlt?: string;
    className?: string;
    onClick?: () => void;
    size?: 'sm' | 'lg'
    btnLabel?: string
    showBtn?: boolean
    smallDesc?: boolean
    loading?: boolean
    disabled?: boolean
}
