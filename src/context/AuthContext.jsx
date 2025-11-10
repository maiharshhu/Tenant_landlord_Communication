import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { auth, db, rtdb } from "../firebase/config.js";

// Firestore (fallback only)
import { doc, getDoc, setDoc } from "firebase/firestore";

// Realtime Database (primary source for role)
import {
  ref as dbRef,
  get as rtdbGet,
  set as rtdbSet,
} from "firebase/database";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); // "tenant" | "landlord" | null
  const [loading, setLoading] = useState(true);

  // Prefer RTDB for role; fallback to Firestore; never crash UI if offline.
  const loadRole = async (uid) => {
    // 1) Try RTDB
    try {
      const rsnap = await rtdbGet(dbRef(rtdb, `users/${uid}/role`));
      if (rsnap.exists()) return rsnap.val();
    } catch {
      // ignore — move to Firestore fallback
    }

    // 2) Firestore fallback
    try {
      const fsSnap = await getDoc(doc(db, "users", uid));
      if (fsSnap.exists()) return fsSnap.data()?.role ?? null;
    } catch {
      // ignore offline errors
    }
    return null;
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const r = await loadRole(u.uid);
        setRole(r);
      } else {
        setRole(null);
      }
      setLoading(false);
    });
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signIn = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  // Signup: write role to RTDB (primary) + Firestore (best-effort)
  const signUp = async (name, email, password, roleSelected = "tenant") => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (name) await updateProfile(cred.user, { displayName: name });

    // RTDB (canonical)
    await rtdbSet(dbRef(rtdb, `users/${cred.user.uid}`), {
      uid: cred.user.uid,
      email,
      name: name || "",
      role: roleSelected,
      createdAt: Date.now(),
    });

    // Firestore (optional mirror; ignore offline failures)
    try {
      await setDoc(doc(db, "users", cred.user.uid), {
        uid: cred.user.uid,
        email,
        name: name || "",
        role: roleSelected,
        createdAt: Date.now(),
      });
    } catch {}

    setRole(roleSelected);
    return cred;
  };

  const logOut = () => signOut(auth);

  const value = {
    user,
    role,
    isTenant: role === "tenant",
    isLandlord: role === "landlord",
    loading,
    signIn,
    signUp,
    logOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
