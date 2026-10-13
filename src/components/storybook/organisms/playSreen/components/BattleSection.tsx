import { PlayerCard } from "@/components/storybook/molecules/playerCard";
import { LightFlash } from "@/components/common/Icons";
import avtar1 from '@/assets/avtars/Avatar.svg'
import guestAvtar from '@/assets/avtars/guest.svg'

export interface BattlePlayerView {
    uid: string;
    name: string;
    avatarUrl: string | null;
    attendQuestions: number;
    totalQuestions: number;
    muted?: boolean;
    bubble?: string;
}

interface BattleSectionProps {
    isGroupBattlePage: boolean;
    players: BattlePlayerView[];
}

const resolveAvatar = (player: BattlePlayerView) => player.avatarUrl || (player.muted ? guestAvtar : avtar1);

const BattleSection = ({ isGroupBattlePage, players }: BattleSectionProps) => {

    if (isGroupBattlePage) {
        return (
            <section className="max-md:px-4 md:w-161 mx-auto commonMT">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 relative">
                    {players.map((player) => (
                        <PlayerCard
                            key={player.uid}
                            avatar={resolveAvatar(player)}
                            name={player.name}
                            attendQuestions={player.attendQuestions}
                            totalQuestions={player.totalQuestions}
                            muted={player.muted}
                            bubble={player.bubble}
                        />
                    ))}
                </div>
            </section>
        );
    }

    const [me, opponent] = players;
    if (!me || !opponent) return null;

    return (
        <section className="max-md:px-4 md:w-161 mx-auto commonMT">
            <div className="grid md:grid-cols-2 gap-4 md:gap-6 relative">
                <PlayerCard
                    avatar={resolveAvatar(me)}
                    name={me.name}
                    attendQuestions={me.attendQuestions}
                    totalQuestions={me.totalQuestions}
                    bubble={me.bubble}
                    horizontalCard
                />

                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                    <LightFlash width={56} height={78} />
                </div>

                <PlayerCard
                    avatar={resolveAvatar(opponent)}
                    name={opponent.name}
                    attendQuestions={opponent.attendQuestions}
                    totalQuestions={opponent.totalQuestions}
                    muted={opponent.muted}
                    bubble={opponent.bubble}
                    horizontalCard
                />
            </div>
        </section>
    );
};

export default BattleSection;
