import { PremiumCoin } from '@/components/common/Icons'
import React from 'react'
import { Typography } from '../Typography'
import { CoinBadgeProps } from './CoinBadge.type'

const CoinBadge: React.FC<CoinBadgeProps> = ({ coins = 0 }) => {
    return (
        <div className='warningContainerBg py-1 px-2 md:px-3 rounded-xl flexCenter gap-2'>
            <PremiumCoin className='mt-1'/>
            <Typography variant='h5' weight='semibold' className='font-nunito!'>
                {coins}
            </Typography>
        </div>
    )
}

export default CoinBadge