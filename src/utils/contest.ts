export const toOrdinal = (rank: number) => {
    const mod100 = rank % 100
    if (mod100 >= 11 && mod100 <= 13) return `${rank}th`
    switch (rank % 10) {
        case 1: return `${rank}st`
        case 2: return `${rank}nd`
        case 3: return `${rank}rd`
        default: return `${rank}th`
    }
}

export const formatContestDate = (dateStr: string) => {
    const d = new Date(dateStr)
    if (Number.isNaN(d.getTime())) return dateStr
    return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`
}

export const daysUntil = (dateStr: string) => {
    const diffMs = new Date(dateStr).getTime() - Date.now()
    return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))
}
