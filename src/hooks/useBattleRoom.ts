'use client'

import { useCallback, useEffect, useRef, useState } from "react"
import { useSelector } from "react-redux"
import {
    get,
    onChildAdded,
    onDisconnect,
    onValue,
    push,
    ref,
    remove,
    runTransaction,
    serverTimestamp,
    set,
    update,
    type Unsubscribe,
} from "firebase/database"
import { realtimeDb } from "@/lib/firebase"
import { createBattleRoom, deleteBattleRoom, fetchBattleRoomQuestions, joinBattleRoom, submitBattleResult } from "@/api/apiRoutes"
import { getContentTypeId } from "@/api/apiMiddleware"
import { webSettingsSelector } from "@/redux/reducers/settingsSlice"
import type { BattleQuestion, BattleResultResponse, BattleSubmitAnswer, BattleSubmitResultEntry } from "@/types/GlobalTypes"

export type BattleMode = 'group' | '1v1'

export interface BattleAnswerEntry {
    id: string
    answer: string
    second: string
}

export interface BattlePlayer {
    uid: string

    userId: number
    name: string
    profile: string
    points?: number
    answers?: BattleAnswerEntry[]
}

export interface BattleRoomDoc {
    roomCode: string
    categoryId: number
    categoryName: string
    categoryImage: string | null
    entryFee: number
    createdBy: string
    readyToPlay: boolean
    users: BattlePlayer[]
    backendRoomId: number | null
    maxPlayers: number | null
    durationSeconds: number | null
    currentQuestionIndex: number
    answeredUsers: string[]
    finished: boolean
    winnerUid: string | null
}

export type BattleRoomError = 'NOT_FOUND' | 'ROOM_FULL' | 'ALREADY_STARTED' | 'NOT_ENOUGH_COINS' | 'NEED_PLAYER' | 'BACKEND_ERROR' | 'UNKNOWN'

export interface BattleChatMessage {
    id: string
    by: string
    message: string
    isTextMessage: boolean
    sentAt: number
}

interface RtdbChatMessage {
    by?: string
    message?: string
    isTextMessage?: boolean
    sentAt?: number
}

// Codes we throw deliberately as validation results — anything else caught alongside
// them is an unexpected error (e.g. RTDB permission-denied) worth logging.
const KNOWN_ERROR_CODES = new Set<string>(['NOT_FOUND', 'ROOM_FULL', 'ALREADY_STARTED', 'NOT_ENOUGH_COINS', 'NEED_PLAYER', 'BACKEND_ERROR', 'UNKNOWN'])

// All battle rooms (1v1 and group) live under a single "battleRooms" node in Realtime
// Database, shared with the Flutter app — `type` tells the two modes apart. Each room is
// keyed directly by its human-shareable roomCode (battleRooms/{roomCode}), not an opaque
// Firebase push id — the app does this too, so "roomId" and "roomCode" are the same
// string everywhere in this file. This is a hard dependency: the node name, key scheme,
// and every field below must match the mobile app's schema exactly, or web/mobile players
// silently stop matching with each other.
const ROOMS_PATH = 'battleRooms'

// In-battle quick-chat lives in its own top-level node (same roomCode key as
// battleRooms) so this lines up with the Flutter app's battleMessages/{roomCode} node.
// A push key under each room code keeps concurrent sends from different players
// collision-free without
// ever touching the game-state listeners on ROOMS_PATH.
const MESSAGES_PATH = 'battleMessages'

// Reverse index the mobile app maintains alongside battleRooms: userBattleRooms/{uid}/
// {roomId} -> joinedAt. Lets a client look up "which rooms am I in" without scanning
// every room. Best-effort — a stale/missing entry never blocks gameplay, only lookups.
const USER_ROOMS_PATH = 'userBattleRooms'

// Random-1v1 matchmaking stubs only — battleQueue/{bucketKey}/{roomCode}. Mirrors the
// Flutter app's schema exactly (bucketKey = "category_<id>" | "contentType_<id>" | "any"),
// so web and mobile players search the same bucket and can match each other.
const QUEUE_PATH = 'battleQueue'

const markUserInRoom = (uid: string, roomId: string) =>
    update(ref(realtimeDb, `${USER_ROOMS_PATH}/${uid}`), { [roomId]: serverTimestamp() })

const unmarkUserInRoom = (uid: string, roomId: string) =>
    update(ref(realtimeDb, `${USER_ROOMS_PATH}/${uid}`), { [roomId]: null })

// Category always wins over content type when both would otherwise apply; "any" is the
// sentinel bucket for an unscoped search. No entryFee dimension — random_battle_entry_coin
// is a single global value from web settings, not chosen per search.
const getRandomBucketKey = (categoryId: number | null | undefined, contentTypeId: number | null | undefined) =>
    categoryId ? `category_${categoryId}` : contentTypeId ? `contentType_${contentTypeId}` : 'any'

const removeQueueStub = (bucketKey: string, roomCode: string) =>
    remove(ref(realtimeDb, `${QUEUE_PATH}/${bucketKey}/${roomCode}`)).catch(() => { })


export const sweepUserBattleRooms = async (myUid: string, skipBackendDeleteRoomCode?: string) => {
    const idxSnap = await get(ref(realtimeDb, `${USER_ROOMS_PATH}/${myUid}`)).catch(() => null)
    if (!idxSnap?.exists()) return
    const roomCodes = Object.keys(idxSnap.val() as Record<string, number>)

    await Promise.all(roomCodes.map(async (code) => {
        const roomSnap = await get(ref(realtimeDb, `${ROOMS_PATH}/${code}`)).catch(() => null)
        const data = (roomSnap?.val() ?? null) as RtdbRoomData | null

        if (data) {
            const othersConnected = Object.entries(data.players ?? {})
                .some(([uid, p]) => uid !== myUid && p?.connected !== false)
            if (data.status === 'inProgress' && othersConnected) return
        }

        if (code !== skipBackendDeleteRoomCode) {
            await deleteBattleRoom({ room_code: code }).catch(() => { })
        }
        if (data?.type === 'individual') {
            removeQueueStub(getRandomBucketKey(data.categoryId ?? null, data.contentTypeId ?? null), code)
        }
        await remove(ref(realtimeDb, `${ROOMS_PATH}/${code}`)).catch(() => { })
        await remove(ref(realtimeDb, `${MESSAGES_PATH}/${code}`)).catch(() => { })
        await unmarkUserInRoom(myUid, code).catch(() => { })
    }))
}

const SLOTS_BY_MODE: Record<BattleMode, number> = {
    group: 4,
    '1v1': 2,
}

const EMPTY_PLAYER: BattlePlayer = { uid: '', userId: 0, name: '', profile: '' }

// Matches the mobile app's answer shape exactly (snake_case, numeric ids) — same field
// names it both writes and reads, so answers land readable on either platform.
interface RtdbAnswer {
    question_id?: number
    selected_option_id?: number | null
    seconds?: number
}

// battleQueue/{bucketKey}/{roomCode} stub shape — matches the app's schema exactly.
interface RtdbQueueEntry {
    createdAt?: number
    createdBy?: string
}

interface RtdbPlayer {
    userId?: number
    name?: string
    profileUrl?: string
    joinedAt?: number
    connected?: boolean
    ready?: boolean
    score?: number
    answeredCount?: number
    answers?: Record<string, RtdbAnswer> | RtdbAnswer[]
}

interface RtdbRoomData {
    // "individual" = random-matchmaking room, "one_vs_one" = friend-code room, "group" =
    // group battle. Random matching scans by type === 'individual'; friend rooms are only
    // ever found by their exact roomCode, never scanned.
    type?: 'individual' | 'one_vs_one' | 'group'
    userLimit?: number
    createdBy?: string
    categoryId?: number
    // Group only — 1v1/random don't store display metadata in RTDB (matches the app);
    // web resolves the category name/image for those by looking up categoryId locally.
    categoryName?: string
    categoryImage?: string | null
    contentTypeId?: number | null
    roomCode?: string
    entryFee?: number
    status?: 'waiting' | 'inProgress' | 'finished'
    createdAt?: number
    currentQuestionIndex?: number
    backendRoomId?: number | null
    durationSeconds?: number | null
    winnerUid?: string | null
    answeredBy?: Record<string, Record<string, boolean>> | Record<string, boolean>[]
    players?: Record<string, RtdbPlayer>
    // Best-effort cache of the last submitResults() response (JSON-stringified
    // BattleResultResponse) — every connected player submits their own call rather than
    // electing a single submitter, so this is purely informational, not a gate.
    finalResult?: string | null
}

// RTDB's JS SDK silently returns objects keyed by consecutive integers ("0","1","2"...)
// as arrays from snapshot.val() instead of objects — answeredBy (by question index) and
// each player's answers (by question index) are written that way, so every read has to
// tolerate either shape.
const normalizeIndexedRecord = <T,>(value: Record<string, T> | T[] | undefined | null): Record<string, T> => {
    if (!value) return {}
    if (Array.isArray(value)) {
        return value.reduce<Record<string, T>>((acc, item, idx) => {
            if (item != null) acc[String(idx)] = item
            return acc
        }, {})
    }
    return value
}

const toBattlePlayer = (uid: string, p: RtdbPlayer): BattlePlayer => {
    const answersByIndex = normalizeIndexedRecord<RtdbAnswer>(p.answers)
    const orderedAnswers = Object.keys(answersByIndex)
        .sort((a, b) => Number(a) - Number(b))
        .map((key) => answersByIndex[key])

    return {
        uid,
        userId: p.userId ?? 0,
        name: p.name ?? '',
        profile: p.profileUrl ?? '',
        points: p.score ?? 0,
        answers: orderedAnswers.map((a) => ({
            id: String(a?.question_id ?? ''),
            answer: a?.selected_option_id != null ? String(a.selected_option_id) : '',
            second: String(a?.seconds ?? 0),
        })),
    }
}

const toRoomDoc = (mode: BattleMode, data: RtdbRoomData): BattleRoomDoc => {
    const slots = SLOTS_BY_MODE[mode]
    const playersRecord = data.players ?? {}

    const activePlayers = Object.entries(playersRecord)
        .filter(([, p]) => p?.connected !== false)
        .sort(([, a], [, b]) => (Number(a?.joinedAt) || 0) - (Number(b?.joinedAt) || 0))
        .map(([uid, p]) => toBattlePlayer(uid, p))

    const users: BattlePlayer[] = Array.from({ length: slots }, (_, i) => activePlayers[i] ?? EMPTY_PLAYER)

    const answeredByQuestion = normalizeIndexedRecord<Record<string, boolean>>(data.answeredBy)
    const currentQuestionIndex = data.currentQuestionIndex ?? 0

    return {
        roomCode: data.roomCode ?? '',
        categoryId: Number(data.categoryId) || 0,
        categoryName: data.categoryName ?? '',
        categoryImage: data.categoryImage ?? null,
        entryFee: data.entryFee ?? 0,
        createdBy: data.createdBy ?? '',
        readyToPlay: data.status !== 'waiting',
        users,
        backendRoomId: data.backendRoomId ?? null,
        maxPlayers: data.userLimit ?? null,
        durationSeconds: data.durationSeconds ?? null,
        currentQuestionIndex,
        answeredUsers: Object.keys(answeredByQuestion[String(currentQuestionIndex)] ?? {}),
        finished: data.status === 'finished',
        winnerUid: data.winnerUid ?? null,
    }
}

export const useBattleRoom = (mode: BattleMode) => {
    const slots = SLOTS_BY_MODE[mode]
    const isOneVsOne = mode === '1v1'

    // Random matchmaking only: whether category is part of the match criteria at all.
    // Read directly here (rather than trusting the categoryId a caller passes in) so
    // matching stays correct even if some future caller forgets to zero it out —
    // content/language is already self-gating this way via getContentTypeId().
    const webSettings = useSelector(webSettingsSelector)
    const isRandomCategoryModeEnabled = webSettings?.random_battle_category_mode === '1'

    const [roomId, setRoomId] = useState<string | null>(null)
    const [room, setRoom] = useState<BattleRoomDoc | null>(null)
    const [status, setStatus] = useState<'idle' | 'busy' | 'waiting' | 'error'>('idle')
    const [error, setError] = useState<BattleRoomError | null>(null)
    const unsubscribeRef = useRef<Unsubscribe | null>(null)

    const [messages, setMessages] = useState<BattleChatMessage[]>([])
    const messagesUnsubRef = useRef<Unsubscribe | null>(null)

    const presenceUnsubRef = useRef<Unsubscribe | null>(null)

    const [randomMatchStatus, setRandomMatchStatus] = useState<'idle' | 'searching' | 'matched'>('idle')
    const [randomSearchQuestions, setRandomSearchQuestions] = useState<BattleQuestion[] | null>(null)
    const createdSearchRoomRef = useRef(false)
    const searchGenerationRef = useRef(0)
    // Stashed so the re-poll effect below can call findOpenRandomRoom/tryJoinRandomRoom
    // again later without the caller having to keep passing them in.
    const searchContextRef = useRef<{
        me: BattlePlayer
        payload: { categoryId: number; categoryName: string; categoryImage: string | null; entryFee: number }
    } | null>(null)

    const subscribe = useCallback((id: string) => {
        unsubscribeRef.current?.()
        unsubscribeRef.current = onValue(ref(realtimeDb, `${ROOMS_PATH}/${id}`), (snap) => {
            if (!snap.exists()) {
                setRoom(null)
                setStatus('idle')
                return
            }
            setRoom(toRoomDoc(mode, snap.val() as RtdbRoomData))
            setStatus('waiting')
        })
    }, [mode])

    useEffect(() => () => {
        unsubscribeRef.current?.()
        presenceUnsubRef.current?.()
    }, [])

    // Chat is keyed by roomCode, which only exists once the backend has assigned one —
    // re-attach whenever it changes (including detaching when it disappears, e.g. reset).
    useEffect(() => {
        messagesUnsubRef.current?.()
        messagesUnsubRef.current = null
        setMessages([])

        const code = room?.roomCode
        if (!code) return

        messagesUnsubRef.current = onChildAdded(ref(realtimeDb, `${MESSAGES_PATH}/${code}`), (snap) => {
            const val = snap.val() as RtdbChatMessage | null
            if (!val) return
            setMessages((prev) => [...prev, {
                id: snap.key ?? '',
                by: val.by ?? '',
                message: val.message ?? '',
                isTextMessage: val.isTextMessage ?? true,
                sentAt: val.sentAt ?? 0,
            }])
        })

        return () => {
            messagesUnsubRef.current?.()
            messagesUnsubRef.current = null
        }
    }, [room?.roomCode])

    const sendBattleMessage = useCallback(async (myUid: string, message: string, isTextMessage = true) => {
        const code = room?.roomCode
        if (!code) return
        await push(ref(realtimeDb, `${MESSAGES_PATH}/${code}`), {
            by: myUid,
            message,
            isTextMessage,
            sentAt: serverTimestamp(),
        })
    }, [room?.roomCode])

    const attachToRoom = useCallback((id: string, myUid?: string) => {
        setRoomId(id)
        subscribe(id)

        presenceUnsubRef.current?.()
        presenceUnsubRef.current = null
        if (myUid) {
            // onDisconnect is armed on whichever socket registers it and does NOT survive
            // a reconnect on its own (network blip, app backgrounded/killed and
            // relaunched, hard page reload) — a stale registration from an earlier
            // connection silently stops protecting this player. Re-arm it every time the
            // connection comes (back) up for as long as this room is attached, so an
            // abrupt close always eventually flips connected:false for the opponent.
            presenceUnsubRef.current = onValue(ref(realtimeDb, '.info/connected'), (snap) => {
                if (snap.val() === true) {
                    const connectedRef = ref(realtimeDb, `${ROOMS_PATH}/${id}/players/${myUid}/connected`)
                    onDisconnect(connectedRef).set(false)
                    // The PREVIOUS connection's onDisconnect (e.g. from a page reload) can
                    // still be queued server-side and flip this back to false after this
                    // new connection is already up — nothing else ever marks a reattaching
                    // player connected again, so without this a refreshed/reconnected
                    // player silently disappears from their own room (filtered out of
                    // toRoomDoc's users) while looking like they left to the opponent.
                    set(connectedRef, true).catch(() => { })
                }
            })
        }
    }, [subscribe])

    const createRoom = useCallback(async (
        me: BattlePlayer,
        payload: { categoryId: number; categoryName: string; categoryImage: string | null; entryFee: number }
    ) => {
        setStatus('busy')
        setError(null)

        // Clear out any open/stale rooms this user left behind before starting a new one.
        await sweepUserBattleRooms(me.uid).catch(() => { })

        // Backend registers the room first — its response is where the roomCode (the
        // RTDB key itself) comes from, so there's nothing to write to RTDB until this
        // succeeds.
        let roomCode: string
        let backendRoomId: number | null = null
        let userLimitFromBackend: number | null = null
        let durationSecondsFromBackend: number | null = null
        try {
            const response = await createBattleRoom({
                room_type: mode === "1v1" ? "one_vs_one" : "group",
                entry_coin: payload.entryFee || null,
                category_id: payload.categoryId || null,
                content_type_id: getContentTypeId(),
            })
            roomCode = response.data.room_code
            backendRoomId = response.data.id
            if (!isOneVsOne) {
                userLimitFromBackend = response.data.max_players
                durationSecondsFromBackend = response.data.duration_seconds
            }
        } catch (err) {
            console.error("Failed to register battle room with backend:", err)
            setStatus('error')
            setError('BACKEND_ERROR')
            throw new Error('BACKEND_ERROR')
        }

        const roomRef = ref(realtimeDb, `${ROOMS_PATH}/${roomCode}`)
        try {
            const contentTypeId = getContentTypeId()
            const initialData: RtdbRoomData = {
                type: isOneVsOne ? 'one_vs_one' : 'group',
                userLimit: userLimitFromBackend ?? slots,
                createdBy: me.uid,
                categoryId: Number(payload.categoryId) || 0,
                contentTypeId: contentTypeId ?? null,
                roomCode,
                entryFee: payload.entryFee,
                status: 'waiting',
                createdAt: serverTimestamp() as unknown as number,
                backendRoomId,
                durationSeconds: durationSecondsFromBackend,
                winnerUid: null,
                players: {
                    [me.uid]: {
                        userId: me.userId,
                        name: me.name,
                        profileUrl: me.profile,
                        joinedAt: serverTimestamp() as unknown as number,
                        connected: true,
                        ready: false,
                        score: 0,
                        answeredCount: 0,
                    },
                },
            }
            // Group only — 1v1/random don't store display metadata or a lock-step
            // question index in RTDB at all (matches the app's schema exactly).
            if (!isOneVsOne) {
                initialData.categoryName = payload.categoryName
                initialData.categoryImage = payload.categoryImage
                initialData.currentQuestionIndex = 0
            }
            await set(roomRef, initialData)
        } catch (err) {
            console.error("Failed to create battle room in Realtime Database:", err)
            await deleteBattleRoom({ room_code: roomCode }).catch(() => { })
            setStatus('error')
            setError('UNKNOWN')
            throw new Error('UNKNOWN')
        }

        onDisconnect(ref(realtimeDb, `${ROOMS_PATH}/${roomCode}/players/${me.uid}/connected`)).set(false)
        markUserInRoom(me.uid, roomCode).catch(() => { })

        setRoomId(roomCode)
        subscribe(roomCode)
        return { roomId: roomCode, roomCode }
    }, [isOneVsOne, mode, slots, subscribe])

    const joinRoom = useCallback(async (me: BattlePlayer, myCoins: number, roomCode: string) => {
        setStatus('busy')
        setError(null)

        // Clear out any open/stale rooms this user left behind before joining a new one.
        await sweepUserBattleRooms(me.uid).catch(() => { })

        // The room is keyed by its own roomCode, so no lookup query is needed — just
        // transact directly on battleRooms/{roomCode}.
        const roomRef = ref(realtimeDb, `${ROOMS_PATH}/${roomCode}`)
        try {
            const txResult = await runTransaction(roomRef, (current: RtdbRoomData | null) => {
                if (!current) return current
                if (current.status !== 'waiting') return undefined
                if (myCoins < (current.entryFee ?? 0)) return undefined
                const activeCount = Object.values(current.players ?? {}).filter((p) => p?.connected !== false).length
                if (activeCount >= (current.userLimit ?? slots)) return undefined

                return {
                    ...current,
                    players: {
                        ...(current.players ?? {}),
                        [me.uid]: {
                            userId: me.userId,
                            name: me.name,
                            profileUrl: me.profile,
                            joinedAt: serverTimestamp() as unknown as number,
                            connected: true,
                            ready: true,
                            score: 0,
                            answeredCount: 0,
                        },
                    },
                }
            })

            // A no-op commit (current was null → returned as-is) still reports
            // committed:true, so a missing room is only detectable via the snapshot.
            if (!txResult.committed || !txResult.snapshot.exists()) {
                const freshData = txResult.snapshot.val() as RtdbRoomData | null
                const code: BattleRoomError = !freshData
                    ? 'NOT_FOUND'
                    : freshData.status !== 'waiting'
                        ? 'ALREADY_STARTED'
                        : myCoins < (freshData.entryFee ?? 0)
                            ? 'NOT_ENOUGH_COINS'
                            : 'ROOM_FULL'
                throw new Error(code)
            }
        } catch (err) {
            const code = (err instanceof Error ? err.message : 'UNKNOWN') as BattleRoomError
            if (!(err instanceof Error) || !KNOWN_ERROR_CODES.has(code)) {
                console.error("Failed to join battle room:", err)
            }
            setStatus('error')
            setError(code)
            throw err
        }

        try {
            await joinBattleRoom({ room_code: roomCode })
        } catch (err) {
            console.error("Failed to register room join with backend:", err)
            await update(ref(realtimeDb, `${ROOMS_PATH}/${roomCode}/players/${me.uid}`), { connected: false })
            setStatus('error')
            setError('BACKEND_ERROR')
            throw new Error('BACKEND_ERROR')
        }

        onDisconnect(ref(realtimeDb, `${ROOMS_PATH}/${roomCode}/players/${me.uid}/connected`)).set(false)
        markUserInRoom(me.uid, roomCode).catch(() => { })

        setRoomId(roomCode)
        subscribe(roomCode)
        return { roomId: roomCode }
    }, [slots, subscribe])

    const startGame = useCallback(async () => {
        if (!roomId || !room) return
        if (room.users.filter((u) => u.uid).length < 2) {
            setError('NEED_PLAYER')
            throw new Error('NEED_PLAYER')
        }
        const roomRef = ref(realtimeDb, `${ROOMS_PATH}/${roomId}`)
        await runTransaction(roomRef, (current: RtdbRoomData | null) => {
            if (!current) return current
            return isOneVsOne
                ? { ...current, status: 'inProgress' }
                : { ...current, status: 'inProgress', currentQuestionIndex: 0, answeredBy: null, winnerUid: null }
        })
    }, [isOneVsOne, roomId, room])

    const cancelRoom = useCallback(async () => {
        if (!roomId) return
        unsubscribeRef.current?.()
        unsubscribeRef.current = null
        presenceUnsubRef.current?.()
        presenceUnsubRef.current = null
        try {
            if (room?.roomCode) await deleteBattleRoom({ room_code: room.roomCode })
        } catch {
            // best-effort: still remove the local room even if the backend delete fails
        }
        await remove(ref(realtimeDb, `${ROOMS_PATH}/${roomId}`))
        if (room?.roomCode) await remove(ref(realtimeDb, `${MESSAGES_PATH}/${room.roomCode}`)).catch(() => { })
        room?.users.filter((u) => u.uid).forEach((u) => { unmarkUserInRoom(u.uid, roomId).catch(() => { }) })
        setRoomId(null)
        setRoom(null)
        setStatus('idle')
    }, [roomId, room])

    const leaveRoom = useCallback(async (myUid: string) => {
        if (!roomId) return
        try {
            const roomRef = ref(realtimeDb, `${ROOMS_PATH}/${roomId}`)
            await runTransaction(roomRef, (current: RtdbRoomData | null) => {
                if (!current?.players?.[myUid]) return current
                const nextPlayers = {
                    ...current.players,
                    [myUid]: { ...current.players[myUid], connected: false },
                }
                const stillActive = Object.entries(nextPlayers).filter(([, p]) => p?.connected !== false)
                if (current.status === 'inProgress' && stillActive.length === 1) {
                    return { ...current, players: nextPlayers, status: 'finished', winnerUid: stillActive[0][0] }
                }
                return { ...current, players: nextPlayers }
            })
            // Deliberately NOT unmarking userBattleRooms here — the room itself isn't
            // deleted (the still-connected opponent needs it to finish/submit), so
            // stripping my own index pointer now would make this room permanently
            // unreachable to my own future sweepUserBattleRooms calls. Left in place, my
            // next create/join/search sweep will delete it once it's actually safe to
            // (its inProgress+othersConnected guard still protects a live opponent match).
        } finally {
            unsubscribeRef.current?.()
            unsubscribeRef.current = null
            presenceUnsubRef.current?.()
            presenceUnsubRef.current = null
            setRoomId(null)
            setRoom(null)
            setStatus('idle')
        }
    }, [roomId])

    const reset = useCallback(() => {
        unsubscribeRef.current?.()
        unsubscribeRef.current = null
        presenceUnsubRef.current?.()
        presenceUnsubRef.current = null
        setRoomId(null)
        setRoom(null)
        setStatus('idle')
        setError(null)
    }, [])


    // Reads the battleQueue/{bucketKey} bucket for this search's scope and returns the
    // oldest stub not created by self, so simultaneous searchers converge on one match per
    // pair instead of everyone racing the same candidate. A stub existing here is enough to
    // attempt a join — the actual capacity/status check happens in tryJoinRandomRoom's
    // transaction on the room itself, since a stub can go stale between this read and then.
    const findOpenRandomRoom = useCallback(async (
        me: BattlePlayer,
        payload: { categoryId: number },
    ) => {
        const contentTypeId = getContentTypeId()
        const bucketKey = getRandomBucketKey(isRandomCategoryModeEnabled ? payload.categoryId : null, contentTypeId)
        const bucketRef = ref(realtimeDb, `${QUEUE_PATH}/${bucketKey}`)
        const snap = await get(bucketRef)
        if (!snap.exists()) return { roomCode: null, bucketKey }

        const stubs: { roomCode: string; createdAt: number }[] = []
        snap.forEach((child) => {
            const val = child.val() as RtdbQueueEntry
            if (val.createdBy !== me.uid) {
                stubs.push({ roomCode: child.key as string, createdAt: val.createdAt ?? 0 })
            }
            return false
        })
        if (!stubs.length) return { roomCode: null, bucketKey }
        stubs.sort((a, b) => a.createdAt - b.createdAt)
        return { roomCode: stubs[0].roomCode, bucketKey }
    }, [isRandomCategoryModeEnabled])

    const createRandomSearchRoom = useCallback(async (
        me: BattlePlayer,
        payload: { categoryId: number; categoryName: string; categoryImage: string | null; entryFee: number },
        generation: number,
    ) => {
        const contentTypeId = getContentTypeId()

        let roomCode: string
        let backendRoomId: number | null = null
        try {
            const response = await createBattleRoom({
                room_type: 'random',
                entry_coin: payload.entryFee || null,
                category_id: isRandomCategoryModeEnabled ? (payload.categoryId || null) : null,
                content_type_id: contentTypeId,
            })
            roomCode = response.data.room_code
            backendRoomId = response.data.id
            if (generation === searchGenerationRef.current) setRandomSearchQuestions(response.data.questions)
        } catch (err) {
            console.error("Failed to register random battle room with backend:", err)
            throw new Error('BACKEND_ERROR')
        }

        const roomRef = ref(realtimeDb, `${ROOMS_PATH}/${roomCode}`)
        const initialData: RtdbRoomData = {
            // "individual" marks this as a random-matchmaking room — distinct from the
            // "one_vs_one" friend-code rooms createRoom writes — see findOpenRandomRoom.
            type: 'individual',
            userLimit: 2,
            createdBy: me.uid,
            contentTypeId: contentTypeId ?? null,
            roomCode,
            entryFee: payload.entryFee,
            status: 'waiting',
            createdAt: serverTimestamp() as unknown as number,
            backendRoomId,
            durationSeconds: null,
            winnerUid: null,
            players: {
                [me.uid]: {
                    userId: me.userId,
                    name: me.name,
                    profileUrl: me.profile,
                    joinedAt: serverTimestamp() as unknown as number,
                    connected: true,
                    ready: false,
                    score: 0,
                    answeredCount: 0,
                },
            },
        }
        // Matches the app: categoryId is only written when a specific category was
        // actually chosen — an "any category" random room has no categoryId field at all.
        if (isRandomCategoryModeEnabled && payload.categoryId) {
            initialData.categoryId = Number(payload.categoryId)
        }
        await set(roomRef, initialData)

        const bucketKey = getRandomBucketKey(isRandomCategoryModeEnabled ? payload.categoryId : null, contentTypeId)
        await set(ref(realtimeDb, `${QUEUE_PATH}/${bucketKey}/${roomCode}`), {
            createdAt: serverTimestamp(),
            createdBy: me.uid,
        })

        onDisconnect(ref(realtimeDb, `${ROOMS_PATH}/${roomCode}/players/${me.uid}/connected`)).set(false)
        markUserInRoom(me.uid, roomCode).catch(() => { })
        return { roomCode, bucketKey }
    }, [isRandomCategoryModeEnabled])

    // Claims a seat in someone else's already-queued room and, in the same transaction,
    // flips status to inProgress — random matches auto-start the instant the 2nd seat is
    // taken, unlike the manual-start friend/group flows above.
    const tryJoinRandomRoom = useCallback(async (me: BattlePlayer, candidateRoomId: string, bucketKey: string) => {
        const roomRef = ref(realtimeDb, `${ROOMS_PATH}/${candidateRoomId}`)
        // This room was only ever seen via the indexed `findOpenRandomRoom` query, never
        // subscribed to directly — so the SDK's synced-data cache has nothing for this
        // exact path yet. A one-shot ({onlyOnce: true}) read detaches immediately on
        // firing, which isn't enough to keep the path warm — the entry gets evicted
        // again before runTransaction's optimistic pass runs, and it sees `current: null`
        // and aborts (our `if (!current) return undefined`) before ever reaching the
        // server. Keeping a REAL listener attached for the transaction's duration keeps
        // the sync cache populated the whole time.
        let resolveWarm: () => void
        const warmPromise = new Promise<void>((resolve) => { resolveWarm = resolve })
        const keepWarmUnsub = onValue(roomRef, () => resolveWarm())
        await warmPromise

        let callbackInvocations = 0
        const txResult = await runTransaction(roomRef, (current: RtdbRoomData | null) => {
            callbackInvocations++
            if (!current) return undefined
            if (current.status !== 'waiting') return undefined
            if (current.players?.[me.uid]) return undefined
            const activeCount = Object.values(current.players ?? {}).filter((p) => p?.connected !== false).length
            if (activeCount >= (current.userLimit ?? 2)) return undefined

            return {
                ...current,
                status: 'inProgress',
                players: {
                    ...(current.players ?? {}),
                    [me.uid]: {
                        userId: me.userId,
                        name: me.name,
                        profileUrl: me.profile,
                        joinedAt: serverTimestamp() as unknown as number,
                        connected: true,
                        ready: true,
                        score: 0,
                        answeredCount: 0,
                    },
                },
            }
        })
        keepWarmUnsub()

        // Stub is stale either way once we get here — the room is full/started/gone, or
        // we've just consumed it ourselves. Self-healing cleanup: whichever client
        // discovers a dead stub removes it (matches the design doc's queue semantics).
        if (!txResult.committed || !txResult.snapshot.exists()) {
            removeQueueStub(bucketKey, candidateRoomId)
            return false
        }
        const joinedRoom = txResult.snapshot.val() as RtdbRoomData
        const roomCode = joinedRoom.roomCode
        if (!roomCode) {
            removeQueueStub(bucketKey, candidateRoomId)
            return false
        }
        removeQueueStub(bucketKey, candidateRoomId)

        try {
            await joinBattleRoom({ room_code: roomCode })
        } catch (err) {
            console.error("Failed to register random battle join with backend:", err)
            await update(ref(realtimeDb, `${ROOMS_PATH}/${candidateRoomId}/players/${me.uid}`), { connected: false })
            await update(roomRef, { status: 'waiting' })
            // Seat released, room is findable again — republish the stub so the original
            // creator's room re-enters the pool instead of going permanently orphaned.
            if (joinedRoom.createdBy) {
                await set(ref(realtimeDb, `${QUEUE_PATH}/${bucketKey}/${candidateRoomId}`), {
                    createdAt: serverTimestamp(),
                    createdBy: joinedRoom.createdBy,
                }).catch(() => { })
            }
            return false
        }

        onDisconnect(ref(realtimeDb, `${ROOMS_PATH}/${candidateRoomId}/players/${me.uid}/connected`)).set(false)
        markUserInRoom(me.uid, candidateRoomId).catch(() => { })
        return true
    }, [])

    const performRandomSearch = useCallback(async (
        me: BattlePlayer,
        payload: { categoryId: number; categoryName: string; categoryImage: string | null; entryFee: number },
        generation: number,
    ): Promise<void> => {
        if (generation !== searchGenerationRef.current) return
        try {
            const { roomCode: candidateId, bucketKey } = await findOpenRandomRoom(me, payload)
            if (generation !== searchGenerationRef.current) return

            if (candidateId) {
                const joined = await tryJoinRandomRoom(me, candidateId, bucketKey)
                if (generation !== searchGenerationRef.current) {
                    // Cancelled/superseded while the join was in flight — I'm actually
                    // seated in their now-inProgress room. Back out cleanly instead of
                    // leaving them stranded waiting on an opponent who never shows up.
                    if (joined) {
                        await update(ref(realtimeDb, `${ROOMS_PATH}/${candidateId}/players/${me.uid}`), { connected: false }).catch(() => { })
                        await update(ref(realtimeDb, `${ROOMS_PATH}/${candidateId}`), { status: 'waiting' }).catch(() => { })
                        unmarkUserInRoom(me.uid, candidateId).catch(() => { })
                    }
                    return
                }
                if (joined) {
                    setRoomId(candidateId)
                    subscribe(candidateId)
                    setRandomMatchStatus('matched')
                    setStatus('waiting')
                    return
                }

                return performRandomSearch(me, payload, generation)
            }

            createdSearchRoomRef.current = true
            const { roomCode: newRoomId, bucketKey: newBucketKey } = await createRandomSearchRoom(me, payload, generation)
            if (generation !== searchGenerationRef.current) {
                removeQueueStub(newBucketKey, newRoomId)
                try {
                    const snap = await get(ref(realtimeDb, `${ROOMS_PATH}/${newRoomId}/roomCode`))
                    const code = snap.val() as string | null
                    if (code) await deleteBattleRoom({ room_code: code }).catch(() => { })
                } catch {
                    // best-effort
                }
                await remove(ref(realtimeDb, `${ROOMS_PATH}/${newRoomId}`)).catch(() => { })
                unmarkUserInRoom(me.uid, newRoomId).catch(() => { })
                return
            }
            setRoomId(newRoomId)
            subscribe(newRoomId)
        } catch (err) {
            console.error("Random battle search failed:", err)
            if (generation === searchGenerationRef.current) {
                setRandomMatchStatus('idle')
                setError('BACKEND_ERROR')
            }
        }
    }, [createRandomSearchRoom, findOpenRandomRoom, subscribe, tryJoinRandomRoom])

    const searchOpponent = useCallback((
        me: BattlePlayer,
        payload: { categoryId: number; categoryName: string; categoryImage: string | null; entryFee: number },
    ) => {
        const generation = ++searchGenerationRef.current
        createdSearchRoomRef.current = false
        searchContextRef.current = { me, payload }
        setRandomSearchQuestions(null)
        setError(null)
        setRandomMatchStatus('searching')
        // Clear out any open/stale rooms this user left behind before searching for a new
        // match — guarded so a fast cancel/re-search while this is in flight doesn't kick
        // off a now-superseded search.
        void sweepUserBattleRooms(me.uid).catch(() => { }).then(() => {
            if (generation !== searchGenerationRef.current) return
            void performRandomSearch(me, payload, generation)
        })
    }, [performRandomSearch])

    // A client that found nothing and created its own room just sits there waiting to
    // be found — but if two clients search at almost the same time, both can race past
    // findOpenRandomRoom before either room exists, and both end up as separate,
    // never-found creators. Re-poll for a candidate every few seconds while still
    // waiting. Only the room with the lexicographically larger code ever initiates a
    // join (into the smaller one) — a cheap, symmetric, always-available tiebreaker
    // that guarantees exactly one side acts, so both sides can never join each other's
    // room at once.
    useEffect(() => {
        if (randomMatchStatus !== 'searching' || !createdSearchRoomRef.current || !roomId) return
        const myRoomId = roomId
        const generation = searchGenerationRef.current

        const interval = setInterval(async () => {
            const ctx = searchContextRef.current
            if (!ctx || generation !== searchGenerationRef.current) return
            try {
                const { roomCode: candidateId, bucketKey } = await findOpenRandomRoom(ctx.me, ctx.payload)
                if (!candidateId || candidateId === myRoomId || candidateId > myRoomId) return
                if (generation !== searchGenerationRef.current) return

                const joined = await tryJoinRandomRoom(ctx.me, candidateId, bucketKey)
                if (!joined) return
                if (generation !== searchGenerationRef.current) {
                    // Cancelled/superseded while the join was in flight — back out of
                    // their now-inProgress room instead of leaving them stranded.
                    await update(ref(realtimeDb, `${ROOMS_PATH}/${candidateId}/players/${ctx.me.uid}`), { connected: false }).catch(() => { })
                    await update(ref(realtimeDb, `${ROOMS_PATH}/${candidateId}`), { status: 'waiting' }).catch(() => { })
                    unmarkUserInRoom(ctx.me.uid, candidateId).catch(() => { })
                    return
                }

                // Abandon my own now-orphaned room — best effort, nobody else was in it.
                const myBucketKey = getRandomBucketKey(isRandomCategoryModeEnabled ? ctx.payload.categoryId : null, getContentTypeId())
                removeQueueStub(myBucketKey, myRoomId)
                try {
                    const snap = await get(ref(realtimeDb, `${ROOMS_PATH}/${myRoomId}/roomCode`))
                    const code = snap.val() as string | null
                    if (code) await deleteBattleRoom({ room_code: code }).catch(() => { })
                } catch {
                    // best-effort
                }
                await remove(ref(realtimeDb, `${ROOMS_PATH}/${myRoomId}`)).catch(() => { })
                unmarkUserInRoom(ctx.me.uid, myRoomId).catch(() => { })

                setRoomId(candidateId)
                subscribe(candidateId)
                setRandomMatchStatus('matched')
                setStatus('waiting')
            } catch (err) {
                console.error("Random battle re-poll failed:", err)
            }
        }, 3000)

        return () => clearInterval(interval)
    }, [randomMatchStatus, roomId, findOpenRandomRoom, tryJoinRandomRoom, subscribe, isRandomCategoryModeEnabled])

    // Cancels an in-progress search (manual "Cancel" or a client-side timeout). Only
    // cleans up a room this device created itself — a search that's still querying, or
    // matched into someone else's room, never created one. Deliberately leaves
    // randomSearchQuestions untouched: the Bot fallback reuses whatever question set
    // this device's own room already fetched.
    const cancelSearch = useCallback(async (myUid: string) => {
        searchGenerationRef.current++
        unsubscribeRef.current?.()
        unsubscribeRef.current = null

        const rid = roomId
        const wasCreator = createdSearchRoomRef.current
        const stillWaiting = !room?.readyToPlay
        createdSearchRoomRef.current = false

        try {
            if (rid && wasCreator && stillWaiting) {
                // Nobody joined me yet — my own throwaway room, delete it outright, plus
                // the matchmaking stub it published (still sitting in battleQueue).
                const ctx = searchContextRef.current
                if (ctx) {
                    const myBucketKey = getRandomBucketKey(isRandomCategoryModeEnabled ? ctx.payload.categoryId : null, getContentTypeId())
                    removeQueueStub(myBucketKey, rid)
                }
                let code: string | null = null
                try {
                    const snap = await get(ref(realtimeDb, `${ROOMS_PATH}/${rid}/roomCode`))
                    code = snap.val() as string | null
                    if (code) await deleteBattleRoom({ room_code: code }).catch(() => { })
                } catch {
                    // best-effort
                }
                await remove(ref(realtimeDb, `${ROOMS_PATH}/${rid}`))
                if (code) await remove(ref(realtimeDb, `${MESSAGES_PATH}/${code}`)).catch(() => { })
                if (myUid) unmarkUserInRoom(myUid, rid).catch(() => { })
            } else if (rid && myUid) {
                // Already matched (as creator or joiner) and backing out before actually
                // playing — leave properly instead of staying a phantom "connected"
                // player that leaves the other side waiting on someone who's already
                // gone. Same shape as leaveRoom's mid-match departure below.
                const roomRef = ref(realtimeDb, `${ROOMS_PATH}/${rid}`)
                await runTransaction(roomRef, (current: RtdbRoomData | null) => {
                    if (!current?.players?.[myUid]) return current
                    const nextPlayers = {
                        ...current.players,
                        [myUid]: { ...current.players[myUid], connected: false },
                    }
                    const stillActive = Object.entries(nextPlayers).filter(([, p]) => p?.connected !== false)
                    if (current.status === 'inProgress' && stillActive.length === 1) {
                        return { ...current, players: nextPlayers, status: 'finished', winnerUid: stillActive[0][0] }
                    }
                    return { ...current, players: nextPlayers }
                })
                // Deliberately NOT unmarking userBattleRooms here — see leaveRoom's
                // matching comment: the room isn't deleted (the still-connected opponent
                // needs it), so my own future sweepUserBattleRooms is what should catch
                // and delete this once it's actually safe to.
            }
        } finally {
            setRoomId(null)
            setRoom(null)
            setStatus('idle')
            setRandomMatchStatus('idle')
            setError(null)
        }
    }, [roomId, room])

    // Bot fallback only: this device never created its own search room (it was still
    // trying to join someone else's when the timeout hit), so there's no already-fetched
    // question set to reuse — fetch one for free with an immediate create+delete.
    const fetchBotQuestions = useCallback(async (payload: { categoryId: number; entryFee: number }) => {
        const response = await createBattleRoom({
            room_type: 'random',
            entry_coin: payload.entryFee || null,
            category_id: payload.categoryId || null,
            content_type_id: getContentTypeId(),
        })
        deleteBattleRoom({ room_code: response.data.room_code }).catch(() => { })
        return response.data.questions
    }, [])

    useEffect(() => {

        if (randomMatchStatus === 'searching' && room?.readyToPlay) setRandomMatchStatus('matched')
    }, [randomMatchStatus, room, roomId])

    // Group battle only: both players must submit the current question before either
    // sees the next one. The last one in flips currentQuestionIndex (or finished, on
    // the last question) for everyone via the room's live subscription.
    // 1v1 derives progress directly from each player's answers.length instead (below).
    const submitAnswerProgress = useCallback(async (myUid: string, questionsCount: number) => {
        if (!roomId || isOneVsOne) return
        const roomRef = ref(realtimeDb, `${ROOMS_PATH}/${roomId}`)
        await runTransaction(roomRef, (current: RtdbRoomData | null) => {
            if (!current) return current
            const qIdx = current.currentQuestionIndex ?? 0
            const answeredByQuestion = normalizeIndexedRecord<Record<string, boolean>>(current.answeredBy)
            const answeredForQ = { ...(answeredByQuestion[String(qIdx)] ?? {}) }
            if (answeredForQ[myUid]) return current
            answeredForQ[myUid] = true

            const activeCount = Object.values(current.players ?? {}).filter((p) => p?.connected !== false).length
            const nextAnsweredBy = { ...answeredByQuestion, [String(qIdx)]: answeredForQ }

            if (Object.keys(answeredForQ).length < activeCount) {
                return { ...current, answeredBy: nextAnsweredBy }
            }

            const nextIndex = qIdx + 1
            const finished = nextIndex >= questionsCount
            return {
                ...current,
                answeredBy: nextAnsweredBy,
                currentQuestionIndex: finished ? qIdx : nextIndex,
                status: finished ? 'finished' : current.status,
            }
        })
    }, [isOneVsOne, roomId])

    const submitOneVsOneAnswer = useCallback(async (myUid: string, answer: BattleAnswerEntry, points: number) => {
        if (!roomId) return
        const roomRef = ref(realtimeDb, `${ROOMS_PATH}/${roomId}`)
        await runTransaction(roomRef, (current: RtdbRoomData | null) => {
            if (!current?.players?.[myUid]) return current
            const player = current.players[myUid]
            const existingAnswers = normalizeIndexedRecord<RtdbAnswer>(player.answers)
            const nextIndex = Object.keys(existingAnswers).length
            const nextAnswers = {
                ...existingAnswers,
                [String(nextIndex)]: {
                    question_id: Number(answer.id) || 0,
                    selected_option_id: answer.answer ? (Number(answer.answer) || null) : null,
                    seconds: Number(answer.second) || 0,
                },
            }
            return {
                ...current,
                players: {
                    ...current.players,
                    [myUid]: {
                        ...player,
                        answers: nextAnswers,
                        answeredCount: nextIndex + 1,
                        score: (player.score ?? 0) + points,
                    },
                },
            }
        })
    }, [roomId])

    const fetchRoomQuestions = useCallback(async () => {
        if (!room?.roomCode) throw new Error('NOT_FOUND')
        const response = await fetchBattleRoomQuestions({ room_code: room.roomCode })
        return response.data
    }, [room])


    const submitResults = useCallback(async (
        myUid: string,
        myUserId = 0,
        fallbackAnswers: BattleSubmitAnswer[] = [],
    ): Promise<BattleResultResponse> => {
        if (!roomId) throw new Error('NOT_FOUND')
        const roomRef = ref(realtimeDb, `${ROOMS_PATH}/${roomId}`)

        const snap = await get(roomRef)
        const data = snap.exists() ? (snap.val() as RtdbRoomData) : null

        let results: BattleSubmitResultEntry[]
        if (data?.players?.[myUid]) {
            const freshRoom = toRoomDoc(mode, data)
            results = freshRoom.users
                .filter((u) => u.uid)
                .map((u) => ({
                    user_id: u.userId || 0,
                    answers: (u.answers ?? []).map((a): BattleSubmitAnswer => ({
                        question_id: Number(a.id) || 0,
                        selected_option_id: a.answer ? Number(a.answer) || null : null,
                        seconds: Number(a.second) || 0,
                    })),
                }))
        } else {
            results = [{ user_id: myUserId, answers: fallbackAnswers }]
        }

        const response = await submitBattleResult({ room_code: roomId, results })

        await update(roomRef, { finalResult: JSON.stringify(response.data) }).catch(() => { })

        setTimeout(() => { void sweepUserBattleRooms(myUid, roomId) }, 3000)

        return response.data
    }, [roomId, mode])

    return {
        roomId,
        room,
        status,
        error,
        createRoom,
        joinRoom,
        startGame,
        cancelRoom,
        leaveRoom,
        reset,
        attachToRoom,
        submitAnswerProgress,
        submitOneVsOneAnswer,
        fetchRoomQuestions,
        submitResults,
        randomMatchStatus,
        randomSearchQuestions,
        searchOpponent,
        cancelSearch,
        fetchBotQuestions,
        messages,
        sendBattleMessage,
    }
}
