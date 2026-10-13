// Shared styling for level pills used in the level / sub-category modals.

export const LEVEL_PILL_BASE =
    'px-6 py-3 rounded-[100px] text-lg! font-medium font-nunito! leading-normal transition-all duration-300 flexCenter gap-2';

export const levelPillClass = (level: number, currentLevel: number) => {
    if (level === currentLevel)
        return 'bg-(--primary) bg-gradient-to-b from-(--neutral-50)/0 to-white/25 shadow-[inset_0px_-4px_12px_0px_rgba(0,0,0,0.04)] border-b-4 border-(--primary)! onPrimaryColor';
    if (level < currentLevel)
        return 'primaryContainerBg shadow-[inset_0px_-4px_12px_0px_rgba(0,0,0,0.04)] primaryColor';
    return 'surfaceContainerLowBg onSurfaceVarColor border-transparent';
};

export const levelLockState = (level: number, currentLevel: number) => level > currentLevel;
