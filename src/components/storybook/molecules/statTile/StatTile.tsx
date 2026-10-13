import { Typography } from '@/components/storybook/atoms/Typography';
import { StatTileProps } from './StatTile.type';

const StatTile = ({ icon, bg, value, label, labelColor }: StatTileProps) => (
    <div className={`${bg} rounded-2xl p-3 md:p-4 flex items-center gap-3`}>
        <span className="shrink-0 flexCenter">{icon}</span>
        <div className="flexCol min-w-0">
            <Typography variant="h5" className={`text-sm! md:text-base! xl:text-xl! font-extrabold xl:font-normal! font-nunito! xl:font-candal! leading-5 xl:leading-7! onSurfaceColor truncate ${labelColor === 'successColor' ? 'dark:text-white!' : 'dark:text-white!'}`}>
                {value}
            </Typography>
            <Typography variant="h6" className={`text-xs! md:text-sm! xl:text-base! font-medium xl:font-semibold! font-nunito! leading-4 ${labelColor} truncate`}>
                {label}
            </Typography>
        </div>
    </div>
);

export default StatTile;
