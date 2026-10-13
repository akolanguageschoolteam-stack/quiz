import React from 'react';
import { IconLabelProps } from './IconLabel.type';

const IconLabel: React.FC<IconLabelProps> = ({
    icon,
    label,
    active = false,
    className = '',
    showHoverEffect = false
}) => {
    return (
        <div
            className={`w-full flex gap-2 items-center ${showHoverEffect && 'hover:primaryLightBg p-2.5'} rounded-md transition-all duration-300 ${active ? 'primaryLightBg' : ''} ${className}`}
        >
            {icon}
            <span className='first-letter:capitalize! font-nunito! font-medium'>{label}</span>
        </div>
    );
};

export default IconLabel;
