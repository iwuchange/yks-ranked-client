import {
  createUserWithEmailAndPassword,
  deleteUser,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { auth, db, storage } from "../firebase";
import { defaultUserDoc, LANES, resolveAttempt } from "./ranks";

const USERNAME_TAKEN = "Bu sihirdar adı zaten alınmış!";

export function usernameKey(name) {
  return String(name || "")
    .trim()
    .toLocaleLowerCase("tr");
}

export function validateUsername(name) {
  const trimmed = String(name || "").trim();
  if (trimmed.length < 3 || trimmed.length > 16) {
    return "Sihirdar adı 3–16 karakter olmalı.";
  }
  if (!/^[a-zA-Z0-9ğüşöçıİĞÜŞÖÇ_]+$/.test(trimmed)) {
    return "Sihirdar adı harf, rakam veya alt çizgi içerebilir.";
  }
  return null;
}

export async function registerSummoner({ username, email, password }) {
  const nameError = validateUsername(username);
  if (nameError) throw new Error(nameError);

  const key = usernameKey(username);
  const usernameRef = doc(db, "usernames", key);
  const taken = await getDoc(usernameRef);
  if (taken.exists()) throw new Error(USERNAME_TAKEN);

  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const uid = cred.user.uid;
  const userRef = doc(db, "users", uid);

  try {
    await runTransaction(db, async (tx) => {
      const again = await tx.get(usernameRef);
      if (again.exists()) throw new Error(USERNAME_TAKEN);
      tx.set(usernameRef, { uid, username: username.trim() });
      tx.set(userRef, {
        ...defaultUserDoc(username.trim(), email.trim()),
        createdAt: serverTimestamp(),
      });
    });
  } catch (err) {
    try {
      await deleteUser(cred.user);
    } catch {
      /* ignore */
    }
    if (err?.message === USERNAME_TAKEN) throw err;
    throw err;
  }

  return cred.user;
}

export function loginSummoner(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function logoutSummoner() {
  return signOut(auth);
}

export function watchUser(uid, callback) {
  return onSnapshot(
    doc(db, "users", uid),
    (snap) => {
      callback(snap.exists() ? { id: snap.id, ...snap.data() } : null);
    },
    () => callback(null)
  );
}

export function watchMatches(uid, callback) {
  const q = query(
    collection(db, "users", uid, "matches"),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(
    q,
    (snap) => {
      callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    },
    () => callback([])
  );
}

export async function submitDeneme(uid, laneKey, nets, totalNet) {
  const lane = LANES[laneKey];
  if (!lane) throw new Error("Geçersiz kulvar.");

  const userRef = doc(db, "users", uid);
  const matchRef = doc(collection(db, "users", uid, "matches"));

  return runTransaction(db, async (tx) => {
    const snap = await tx.get(userRef);
    if (!snap.exists()) throw new Error("Profil bulunamadı.");
    const data = snap.data();
    const outcome = resolveAttempt({
      lig: data[lane.lig],
      lp: data[lane.lp],
      lastNet: data[lane.last],
      newNet: totalNet,
    });

    const patch = {
      [lane.lig]: outcome.lig,
      [lane.lp]: outcome.lp,
      [lane.last]: outcome.lastNet,
    };
    if (laneKey.startsWith("ayt_")) {
      patch.ayt_track = laneKey.replace("ayt_", "");
    }

    tx.update(userRef, patch);
    tx.set(matchRef, {
      lane: laneKey,
      mode: lane.label,
      result: outcome.result,
      delta: outcome.delta,
      nets,
      totalNet: Number(totalNet) || 0,
      fromLig: outcome.fromLig,
      fromLp: outcome.fromLp,
      toLig: outcome.lig,
      toLp: outcome.lp,
      createdAt: serverTimestamp(),
    });

    return { ...outcome, matchId: matchRef.id, mode: lane.label };
  });
}

export async function uploadProfileImage(uid, file) {
  if (!file || !file.type.startsWith("image/")) {
    throw new Error("Lütfen bir görsel dosyası seç.");
  }
  if (file.size > 4 * 1024 * 1024) {
    throw new Error("Görsel 4 MB’dan küçük olmalı.");
  }
  const ext = file.name.split(".").pop() || "jpg";
  const objectRef = ref(storage, `profiles/${uid}/${Date.now()}.${ext}`);
  await uploadBytes(objectRef, file);
  const url = await getDownloadURL(objectRef);
  await updateDoc(doc(db, "users", uid), { profile_img: url });
  return url;
}

export function setAytTrack(uid, track) {
  return updateDoc(doc(db, "users", uid), { ayt_track: track });
}
