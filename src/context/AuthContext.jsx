import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { watchMatches, watchUser } from "../lib/account";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(undefined);
  const [profile, setProfile] = useState(null);
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    return onAuthStateChanged(auth, setFirebaseUser);
  }, []);

  useEffect(() => {
    if (!firebaseUser?.uid) {
      setProfile(null);
      setMatches([]);
      return undefined;
    }
    const offUser = watchUser(firebaseUser.uid, setProfile);
    const offMatches = watchMatches(firebaseUser.uid, setMatches);
    return () => {
      offUser();
      offMatches();
    };
  }, [firebaseUser?.uid]);

  const value = useMemo(
    () => ({
      ready: firebaseUser !== undefined,
      firebaseUser,
      profile,
      matches,
      uid: firebaseUser?.uid || null,
    }),
    [firebaseUser, profile, matches]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth AuthProvider içinde kullanılmalı.");
  return ctx;
}
