'use client'
import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import PlayScreen from '@/components/storybook/organisms/playSreen'
import GameInstruction from './GameInstruction';

const FunLearnPlay = () => {

    const searchParams = useSearchParams();
    const isReviewMode = searchParams.get('review') === '1';

    const [isInstructions, setIsInstructions] = useState(!isReviewMode);

    return (
        isInstructions ?
            <GameInstruction onStartQuiz={() => setIsInstructions(false)} /> :
            <PlayScreen />
    )
}

export default FunLearnPlay
