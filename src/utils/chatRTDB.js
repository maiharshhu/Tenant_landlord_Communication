import {
    ref, get, set, push, update, serverTimestamp,
} from "firebase/database";

/**
 * Find existing thread between uidA & uidB using /userThreads/{uidA}
 * else create new thread and backfill both users' maps.
 */
export async function getOrCreateThreadRTDB(rtdb, uidA, uidB) {
    const mapRef = ref(rtdb, `userThreads/${uidA}`);
    const snap = await get(mapRef);
    if (snap.exists()) {
        const entries = snap.val() || {};
        for (const [threadId, meta] of Object.entries(entries)) {
            if (meta?.otherUid === uidB) return threadId;
        }
    }
    // create new thread
    const threadRef = push(ref(rtdb, "threads"));
    const threadId = threadRef.key;

    const now = serverTimestamp();
    await set(threadRef, {
        members: { [uidA]: true, [uidB]: true },
        updatedAt: now,
    });

    await update(ref(rtdb), {
        [`userThreads/${uidA}/${threadId}`]: { otherUid: uidB, updatedAt: now },
        [`userThreads/${uidB}/${threadId}`]: { otherUid: uidA, updatedAt: now },
    });

    return threadId;
}

/** Push a message and bump updatedAt */
export async function sendMessageRTDB(rtdb, threadId, { text, senderId }) {
    const msgRef = push(ref(rtdb, `messages/${threadId}`));
    const now = serverTimestamp();
    await set(msgRef, {
        text,
        senderId,
        createdAt: now,
        readBy: { [senderId]: true },
    });
    await update(ref(rtdb), {
        [`threads/${threadId}/updatedAt`]: now,
        // userThreads updatedAt will be read for both members; we can update both,
        // but we don't know both IDs here—callers can pass also otherUid if needed.
    });
    return msgRef.key;
}

/** Mark message read for a user */
export async function markReadRTDB(rtdb, threadId, msgId, uid) {
    await set(ref(rtdb, `messages/${threadId}/${msgId}/readBy/${uid}`), true);
}
