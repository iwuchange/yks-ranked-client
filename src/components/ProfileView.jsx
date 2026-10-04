import { useRef, useState } from "react";
import { Camera, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { setAytTrack, uploadProfileImage } from "../lib/account";
import { aytLaneFromTrack, LANES } from "../lib/ranks";
import RankEmblem from "./RankEmblem";

function RankCard({ title, lig, lp }) {
  return (
    <div className="gold-border flex flex-col items-center bg-hex-deep/80 px-4 py-6 text-center">
      <RankEmblem lig={lig} size={140} />
      <p className="mt-3 text-[11px] uppercase tracking-[0.2em] text-hex-gold/80">{title}</p>
      <p className="font-display text-xl text-hex-gold-bright">{lig}</p>
      <p className="text-sm text-hex-cyan">{lp} LP</p>
    </div>
  );
}

export default function ProfileView() {
  const { uid, profile, matches } = useAuth();
  const fileRef = useRef(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (!profile) {
    return (
      <p className="text-sm text-hex-gold-bright/60">Profil yükleniyor...</p>
    );
  }

  const track = profile.ayt_track || "sayisal";
  const aytLane = aytLaneFromTrack(track === "esit_agirlik" ? "esit" : track);

  async function onFile(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !uid) return;
    setError("");
    setBusy(true);
    try {
      await uploadProfileImage(uid, file);
    } catch (err) {
      setError(err.message || "Fotoğraf yüklenemedi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="gold-border bg-hex-panel/70 p-6">
        <div className="flex flex-wrap items-center gap-5">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="group relative h-28 w-28 overflow-hidden border border-hex-gold/50 bg-hex-void"
          >
            {profile.profile_img ? (
              <img
                src={profile.profile_img}
                alt={profile.username}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="grid h-full w-full place-items-center text-hex-gold">
                <User className="h-12 w-12" />
              </span>
            )}
            <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-hex-void/80 py-1 text-[10px] uppercase tracking-widest text-hex-gold opacity-0 group-hover:opacity-100">
              <Camera className="h-3 w-3" /> Yükle
            </span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onFile}
          />
          <div>
            <p className="font-display text-3xl text-hex-gold-bright">{profile.username}</p>
            <p className="text-sm text-hex-gold-bright/60">{profile.email}</p>
            <p className="mt-2 text-xs uppercase tracking-widest text-hex-cyan">
              {busy ? "Fotoğraf yükleniyor..." : `${matches.length} deneme · sezon 1`}
            </p>
          </div>
        </div>
        {error && (
          <p className="mt-4 border border-rose-400/40 bg-rose-950/40 px-3 py-2 text-sm text-rose-300">
            {error}
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { id: "sayisal", label: "AYT Sayısal" },
          { id: "esit_agirlik", label: "AYT Eşit Ağırlık" },
          { id: "sozel", label: "AYT Sözel" },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => uid && setAytTrack(uid, t.id)}
            className={`border px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] ${
              track === t.id || (t.id === "sayisal" && track === "sayisal")
                ? "border-hex-gold bg-hex-gold/15 text-hex-gold"
                : "border-hex-gold/30 text-hex-gold-bright/60"
            }`}
          >
            {t.label} göster
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <RankCard title="TYT Derecesi" lig={profile.tyt_lig} lp={profile.tyt_lp} />
        <RankCard
          title={`AYT Derecesi · ${aytLane.short}`}
          lig={profile[aytLane.lig]}
          lp={profile[aytLane.lp]}
        />
        <RankCard title="YDT Derecesi" lig={profile.ydt_lig} lp={profile.ydt_lp} />
      </div>
    </div>
  );
}
