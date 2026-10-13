import ImagePreview from "@/components/storybook/atoms/ImagePreview";
import MathContent from "@/components/common/MathContent";
import { Typography } from "@/components/storybook/atoms/Typography";
import RichTextContent from "@/components/common/RichText";

interface QuestionCardProps {
    questionId: number;
    question?: string;
    image?: string | null;
    audio?: string | null;
    isMathManiaPage: boolean;
    isExamPage?: boolean;
    onAudioEnded?: () => void;
}

const QuestionCard = ({ questionId, question, image, audio, isMathManiaPage, isExamPage, onAudioEnded }: QuestionCardProps) => (
    <div className="surfaceContainerLowestBg rounded-[42px] p-6 md:p-8 flexCol gap-4 shadow-[0px_8px_32px_0px_#0000000A]">
        {image && (
            <ImagePreview
                src={image}
                alt={question ?? ''}
                objectFit="contain"
                rounded="2xl"
                containerClassName="w-full h-48 md:h-64"
            />
        )}
        {audio && (
            <audio key={questionId} src={audio} controls onEnded={onAudioEnded} className="w-full" />
        )}
        {isMathManiaPage || isExamPage ? (
            <MathContent
                content={question ?? ''}
                className="tracking-tight text-base! md:text-2xl! font-semibold md:font-normal font-nunito! md:leading-8 onSurfaceColor"
            />
        ) : (
            <Typography variant="h4" className="text-base! md:text-2xl! font-semibold md:font-normal font-nunito! md:leading-8 onSurfaceColor">
                <RichTextContent content={question || ''} />
            </Typography>
        )}
    </div>
);

export default QuestionCard;
