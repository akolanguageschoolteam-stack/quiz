'use client'
import Lottie from "lottie-react";
import resultAnimation from '@/components/common/resultLottie.json'

const ResultLottiesAnimation = () => {
    return (
        <Lottie
            animationData={resultAnimation}
            loop
            autoplay
        />
    )
}

export default ResultLottiesAnimation