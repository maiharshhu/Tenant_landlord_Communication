import { addDoc, collection, serverTimestamp } from "firebase/firestore"; // (optional if you notify)
import { ref, get, set, push, update, serverTimestamp as rtdbTs } from "firebase/database";

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
    const threadRef = push(ref(rtdb, "threads"));
    const threadId = threadRef.key;
    const now = rtdbTs();

    await set(threadRef, {
        members: { [uidA]: true, [uidB]: true },
        updatedAt: now,
    });

    await update(ref(rtdb), {
        [`userThreads/${uidA}/${threadId}`]: { otherUid: uidB, updatedAt: Date.now() },
        [`userThreads/${uidB}/${threadId}`]: { otherUid: uidA, updatedAt: Date.now() },
    });

    return threadId;
}

export async function sendMessageRTDB(rtdb, threadId, { text, senderId }) {
    const msgRef = push(ref(rtdb, `messages/${threadId}`));
    const now = rtdbTs();
    await set(msgRef, {
        text,
        senderId,
        createdAt: now,
        readBy: { [senderId]: true },
    });
    await update(ref(rtdb), {
        [`threads/${threadId}/updatedAt`]: now,
    });
    return msgRef.key;
}

export async function markReadRTDB(rtdb, threadId, msgId, uid) {
    await set(ref(rtdb, `messages/${threadId}/${msgId}/readBy/${uid}`), true);
}
