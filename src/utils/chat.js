import { addDoc, collection, query, where, getDocs, serverTimestamp } from "firebase/firestore";

export async function getOrCreateThread(db, uidA, uidB) {
    // find threads where uidA is a member, then filter for uidB client-side
    const q = query(collection(db, "threads"), where("members", "array-contains", uidA));
    const snap = await getDocs(q);
    const existing = snap.docs.find(d => {
        const m = d.data().members || [];
        return m.includes(uidA) && m.includes(uidB);
    });
    if (existing) return existing.id;

    const ref = await addDoc(collection(db, "threads"), {
        members: [uidA, uidB],
        updatedAt: serverTimestamp(),
    });
    return ref.id;
}
